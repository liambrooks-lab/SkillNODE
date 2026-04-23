import OpenAI from "openai";
import { env } from "../env.js";

let client = null;

function getClient() {
  if (!client && env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are SkillNODE AI, a concise coaching assistant for a skill-training platform.
Your hints are short (2-3 sentences max), direct, and encouraging.
Never give away full answers. Guide the user to think for themselves.
Respond in plain text only — no markdown, no code blocks unless asked.`;

/**
 * Generate a contextual hint for a given activity and challenge.
 * @param {Object} params
 * @param {string} params.activityType - e.g. "typing", "math", "code", "grammar"
 * @param {string} params.context - the current challenge context or question
 * @param {string} [params.userInput] - what the user has typed/written so far
 * @returns {Promise<string>} the hint text
 */
export async function generateHint({ activityType, context, userInput }) {
  const ai = getClient();

  if (!ai) {
    return "AI hints are not configured on this server. Set OPENAI_API_KEY to enable them.";
  }

  const userMessage = [
    `Activity: ${activityType}`,
    `Challenge: ${context}`,
    userInput ? `User's current input: ${userInput}` : null,
    "Please give me a short, focused coaching hint.",
  ].filter(Boolean).join("\n");

  try {
    const response = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system",  content: SYSTEM_PROMPT },
        { role: "user",    content: userMessage   },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "No hint available right now.";
  } catch (err) {
    console.error("[aiEngine.generateHint]", err?.message);
    return "AI hint service is temporarily unavailable. Keep trying!";
  }
}
