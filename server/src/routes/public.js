import { Router } from "express";
import { prisma } from "../db/prisma.js";

export const publicRouter = Router();

publicRouter.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const [bestResults, recentResults] = await Promise.all([
    prisma.activityResult.groupBy({
      by: ["activityType"],
      where: { userId },
      _max: {
        score: true,
        accuracy: true,
      },
    }),
    prisma.activityResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    region: user.region,
    dpUrl: user.dpUrl || null,
    bio: user.bio || "",
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    portfolioUrl: user.portfolioUrl || "",
    xUrl: user.xUrl || "",
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    bestResults: bestResults.map((entry) => ({
      activityType: entry.activityType,
      bestScore: entry._max.score ?? 0,
      bestAccuracy: entry._max.accuracy ?? null,
    })),
    recentResults,
  });
});
