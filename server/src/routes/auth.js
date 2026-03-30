import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { signToken } from "../auth/jwt.js";
import { upload } from "../storage/uploads.js";
import { sendLoginEmail } from "../email/resend.js";

export const authRouter = Router();

const LoginSchema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(5).max(30),
  email: z.string().email(),
  region: z.string().min(1).max(80),
});

// The client uses this as "login", but it also creates a profile if needed.
authRouter.post("/login", upload.single("dp"), async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid fields", details: parsed.error.flatten() });
  }

  const { name, phone, email, region } = parsed.data;
  const dpUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      phone,
      email,
      region,
      dpUrl,
      lastLoginAt: new Date(),
    },
    update: {
      name,
      phone,
      region,
      ...(dpUrl ? { dpUrl } : {}),
      lastLoginAt: new Date(),
    },
  });

  // Fire-and-forget (don’t block login on email)
  sendLoginEmail({ to: email, name: user.name, region: user.region }).catch(() => {});

  const token = signToken({ sub: user.id, email: user.email });
  return res.json({ token, user: publicUser(user) });
});

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    region: u.region,
    dpUrl: u.dpUrl ? absoluteDp(u.dpUrl) : null,
  };
}

function absoluteDp(dpUrl) {
  // The client calls API on same base; returning relative is fine.
  return dpUrl;
}

