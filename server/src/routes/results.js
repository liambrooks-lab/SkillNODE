import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const resultsRouter = Router();

const ActivityTypeEnum = z.enum(["typing", "math", "guess", "coding", "grammar", "comprehension"]);

const CreateResultSchema = z.object({
  activityType: ActivityTypeEnum,
  score: z.number().min(0).max(100000),
  accuracy: z.number().min(0).max(100).optional(),
  durationMs: z.number().int().min(0).max(1000 * 60 * 60).optional(),
  metadata: z.record(z.any()).optional(),
});

resultsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = CreateResultSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid result payload", details: parsed.error.flatten() });
  }

  const result = await prisma.activityResult.create({
    data: {
      userId: req.auth.sub,
      activityType: parsed.data.activityType,
      score: parsed.data.score,
      accuracy: parsed.data.accuracy,
      durationMs: parsed.data.durationMs,
      metadata: parsed.data.metadata,
    },
  });

  return res.json(result);
});

resultsRouter.get("/mine", requireAuth, async (req, res) => {
  const query = z
    .object({
      activityType: ActivityTypeEnum.optional(),
      take: z.coerce.number().int().min(1).max(20).optional().default(10),
    })
    .safeParse(req.query);

  if (!query.success) return res.status(400).json({ error: "Invalid query" });

  const results = await prisma.activityResult.findMany({
    where: {
      userId: req.auth.sub,
      ...(query.data.activityType ? { activityType: query.data.activityType } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: query.data.take,
  });

  return res.json(results);
});

resultsRouter.get("/leaderboard", async (req, res) => {
  const query = z
    .object({
      activityType: ActivityTypeEnum,
      take: z.coerce.number().int().min(1).max(20).optional().default(8),
    })
    .safeParse(req.query);

  if (!query.success) return res.status(400).json({ error: "Invalid query" });

  const grouped = await prisma.activityResult.groupBy({
    by: ["userId"],
    where: { activityType: query.data.activityType },
    _max: {
      score: true,
      accuracy: true,
      createdAt: true,
    },
    orderBy: {
      _max: {
        score: "desc",
      },
    },
    take: query.data.take,
  });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: grouped.map((entry) => entry.userId),
      },
    },
    select: {
      id: true,
      name: true,
      region: true,
      dpUrl: true,
    },
  });

  const userMap = new Map(users.map((user) => [user.id, user]));

  return res.json(
    grouped.map((entry, index) => {
      const user = userMap.get(entry.userId);
      return {
        rank: index + 1,
        userId: entry.userId,
        name: user?.name || "Player",
        region: user?.region || "",
        dpUrl: user?.dpUrl || null,
        bestScore: entry._max.score ?? 0,
        bestAccuracy: entry._max.accuracy ?? null,
        lastPlayedAt: entry._max.createdAt ?? null,
      };
    }),
  );
});
