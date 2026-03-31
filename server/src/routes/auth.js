import { Router } from "express";
import { createHash, randomInt } from "crypto";
import { z } from "zod";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { prisma } from "../db/prisma.js";
import { signToken } from "../auth/jwt.js";
import { upload } from "../storage/uploads.js";
import { sendLoginEmail, sendVerificationCodeEmail } from "../email/resend.js";
import { env } from "../env.js";

export const authRouter = Router();

const CHALLENGE_TTL_MINUTES = 10;

const RequestCodeSchema = z.object({
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

authRouter.post("/request-code", upload.single("dp"), async (req, res) => {
  const parsed = RequestCodeSchema.safeParse(req.body);
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

  await prisma.loginChallenge.deleteMany({
    where: {
      email,
      consumedAt: null,
    },
  });

  await prisma.loginChallenge.create({
    data: {
      email,
      name,
      phone,
      region,
      dpUrl,
      codeHash: hashCode(code),
      expiresAt,
    },
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

  const challenge = await prisma.loginChallenge.findFirst({
    where: {
      email,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return res.status(400).json({ error: "Verification code expired or unavailable." });
  }

  if (challenge.codeHash !== hashCode(code)) {
    return res.status(400).json({ error: "Incorrect verification code." });
  }

  await prisma.loginChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  const user = await prisma.user.upsert({
    where: { email: challenge.email },
    create: {
      name: challenge.name,
      phone: challenge.phone,
      email: challenge.email,
      region: challenge.region,
      dpUrl: challenge.dpUrl,
      lastLoginAt: new Date(),
    },
    update: {
      name: challenge.name,
      phone: challenge.phone,
      region: challenge.region,
      ...(challenge.dpUrl ? { dpUrl: challenge.dpUrl } : {}),
      lastLoginAt: new Date(),
    },
  });

  sendLoginEmail({ to: user.email, name: user.name, region: user.region }).catch(() => null);

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  return res.json({ token, user: publicUser(user) });
});

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
