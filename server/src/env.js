import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().optional(),
  APP_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
  PUBLIC_APP_URL: z.string().default("http://localhost:5173"),
  PUBLIC_APP_URLS: z.string().optional().default(""),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM: z.string().optional().default("SkillNODE <onboarding@resend.dev>"),
  OPENAI_API_KEY: z.string().optional().default(""),
  ALLOW_DEV_LOGIN_CODE: z
    .string()
    .optional()
    .default("true")
    .transform((value) => value === "true"),
});

export const env = EnvSchema.parse(process.env);

