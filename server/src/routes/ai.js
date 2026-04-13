import { Router } from "express";
import { z } from "zod";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getOpenAI } from "../ai/openai.js";

export const aiRouter = Router();

const limiter = new RateLimiterMemory({
  points: 12,
  duration: 60,
});

const HintSchema = z.object({
  activityId: z.string().min(1).max(40),
  prompt: z.string().min(1).max(800),
});

aiRouter.post("/hint", async (req, res) => {
  const limiterKey =
    req.headers["x-skillnode-session"]?.toString().slice(0, 120) ||
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "guest";

  try {
    await limiter.consume(limiterKey);
  } catch {
    return res.status(429).json({ error: "Rate limited. Try again in a minute." });
  }

  const parsed = HintSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const client = getOpenAI();
  if (!client) return res.status(501).json({ error: "AI not configured on server" });

  const { activityId, prompt } = parsed.data;

  const system =
    "You are a concise coach for a skill-training app. Give a short hint, not the full answer. " +
    "Never include personal data. Keep it under 80 words.";

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.6,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Activity: ${activityId}\nContext:\n${prompt}` },
    ],
  });

  const hint = completion.choices?.[0]?.message?.content?.trim() || "Try breaking it into smaller steps.";
  return res.json({ hint });
});

