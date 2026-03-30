import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const auditRouter = Router();

const EventSchema = z.object({
  type: z.string().min(1).max(80),
  meta: z.any().optional(),
});

auditRouter.post("/event", requireAuth, async (req, res) => {
  const parsed = EventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid event" });

  const userId = req.auth.sub;
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || null;
  const ua = req.headers["user-agent"] || null;

  await prisma.auditEvent.create({
    data: {
      userId,
      type: parsed.data.type,
      meta: parsed.data.meta,
      ip,
      ua,
    },
  });

  return res.json({ ok: true });
});

