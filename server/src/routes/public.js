import { Router } from "express";
import { prisma } from "../db/prisma.js";

export const publicRouter = Router();

publicRouter.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
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
