import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().optional(),
  PUBLIC_APP_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM: z.string().optional().default("SkillNODE <onboarding@resend.dev>"),
  OPENAI_API_KEY: z.string().optional().default(""),
});

export const env = EnvSchema.parse(process.env);

