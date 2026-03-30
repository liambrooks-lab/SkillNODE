import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

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

