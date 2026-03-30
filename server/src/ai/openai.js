import OpenAI from "openai";
import { env } from "../env.js";

let client = null;

export function getOpenAI() {
  if (!env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

