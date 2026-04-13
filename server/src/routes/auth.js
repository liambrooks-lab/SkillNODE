import { Router } from "express";
import { createHash, randomInt, randomUUID } from "crypto";
import { z } from "zod";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { signToken } from "../auth/jwt.js";
import { upload } from "../storage/uploads.js";
import { sendLoginEmail, sendVerificationCodeEmail } from "../email/resend.js";
import { env } from "../env.js";

export const authRouter = Router();

const CHALLENGE_TTL_MINUTES = 10;

// --- IN-MEMORY DATABASE MOCK ---
// This safely stores your users and login OTPs in RAM instead of a database.
const memoryUsers = new Map();
const memoryChallenges = new Map();
// -------------------------------

const ProfileSchema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(5).max(30),
  email: z.string().email(),
  region: z.string().min(1).max(80),
});

const VerifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

const requestLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 10,
});

const verifyLimiter = new RateLimiterMemory({
  points: 12,
  duration: 60 * 10,
});

authRouter.post("/login", upload.single("dp"), async (req, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid fields", details: parsed.error.flatten() });
  }

  const dpUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const session = await upsertUserAndIssueSession({
    ...parsed.data,
    dpUrl,
  });

  sendLoginEmail({
    to: session.user.email,
    name: session.user.name,
    region: session.user.region,
  }).catch(() => null);

  return res.json(session);
});

authRouter.post("/request-code", upload.single("dp"), async (req, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid fields", details: parsed.error.flatten() });
  }

  const { name, phone, email, region } = parsed.data;
  const limiterKey = `${clientIp(req)}:${email.toLowerCase()}`;

  try {
    await requestLimiter.consume(limiterKey);
  } catch {
    return res.status(429).json({ error: "Too many verification requests. Try again shortly." });
  }

  const dpUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000);

  // Clear existing unused challenges for this email
  for (const [key, challenge] of memoryChallenges.entries()) {
    if (challenge.email === email && !challenge.consumedAt) {
      memoryChallenges.delete(key);
    }
  }

  // Create new challenge
  const challengeId = randomUUID();
  memoryChallenges.set(challengeId, {
    id: challengeId,
    email,
    name,
    phone,
    region,
    dpUrl,
    codeHash: hashCode(code),
    expiresAt,
    consumedAt: null,
    createdAt: new Date(),
  });

  await sendVerificationCodeEmail({
    to: email,
    name,
    code,
    expiresInMinutes: CHALLENGE_TTL_MINUTES,
  }).catch(() => null);

  return res.json({
    ok: true,
    email,
    ...(env.APP_ENV !== "production" && env.ALLOW_DEV_LOGIN_CODE ? { debugCode: code } : {}),
  });
});

authRouter.post("/verify-code", async (req, res) => {
  const parsed = VerifyCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid code request", details: parsed.error.flatten() });
  }

  const { email, code } = parsed.data;
  const limiterKey = `${clientIp(req)}:${email.toLowerCase()}`;

  try {
    await verifyLimiter.consume(limiterKey);
  } catch {
    return res.status(429).json({ error: "Too many attempts. Wait a bit and try again." });
  }

  // Find the most recent active challenge
  let challenge = null;
  for (const val of memoryChallenges.values()) {
    if (val.email === email && !val.consumedAt && val.expiresAt > new Date()) {
      if (!challenge || val.createdAt > challenge.createdAt) {
        challenge = val;
      }
    }
  }

  if (!challenge) {
    return res.status(400).json({ error: "Verification code expired or unavailable." });
  }

  if (challenge.codeHash !== hashCode(code)) {
    return res.status(400).json({ error: "Incorrect verification code." });
  }

  // Mark consumed
  challenge.consumedAt = new Date();
  memoryChallenges.set(challenge.id, challenge);

  const session = await upsertUserAndIssueSession({
    name: challenge.name,
    phone: challenge.phone,
    email: challenge.email,
    region: challenge.region,
    dpUrl: challenge.dpUrl,
  });

  sendLoginEmail({
    to: session.user.email,
    name: session.user.name,
    region: session.user.region,
  }).catch(() => null);

  return res.json(session);
});

async function upsertUserAndIssueSession({ name, phone, email, region, dpUrl }) {
  // Check if user exists in RAM, if not create them, if so update them
  let user = memoryUsers.get(email);
  if (!user) {
    user = { id: randomUUID(), email, name, phone, region, dpUrl, lastLoginAt: new Date() };
  } else {
    user.name = name;
    user.phone = phone;
    user.region = region;
    if (dpUrl) user.dpUrl = dpUrl;
    user.lastLoginAt = new Date();
  }
  memoryUsers.set(email, user);

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  return { token, user: publicUser(user) };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    region: user.region,
    dpUrl: user.dpUrl || null,
  };
}

function hashCode(value) {
  return createHash("sha256").update(value).digest("hex");
}

function clientIp(req) {
  return req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
}