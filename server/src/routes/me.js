import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../storage/uploads.js";
import { z } from "zod";

export const meRouter = Router();

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  region: z.string().min(1).max(80),
});

meRouter.get("/", requireAuth, async (req, res) => {
  const userId = req.auth.sub;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    region: user.region,
    dpUrl: user.dpUrl || null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  });
});

meRouter.patch("/", requireAuth, upload.single("dp"), async (req, res) => {
  const userId = req.auth.sub;
  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid fields", details: parsed.error.flatten() });
  }

  const dpUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...parsed.data,
        ...(dpUrl ? { dpUrl } : {}),
      },
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      region: user.region,
      dpUrl: user.dpUrl || null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "That email is already in use." });
    }

    return res.status(500).json({ error: "Could not update profile." });
  }
});

