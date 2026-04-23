/**
 * QuestionBank model schema.
 * Represents a single question entry used across skill activities.
 */

export const QuestionBankSchema = {
  id:           { type: "string",  required: true  },
  activityType: { type: "string",  required: true  },
  category:     { type: "string",  required: false },
  difficulty:   { type: "string",  default: "medium" },  // "easy" | "medium" | "hard"
  prompt:       { type: "string",  required: true  },
  answer:       { type: "string",  required: true  },
  options:      { type: "array",   required: false },  // for MCQ activities
  explanation:  { type: "string",  required: false },
  tags:         { type: "array",   default: []     },
  createdAt:    { type: "number",  default: () => Date.now() },
};

export function normalizeQuestion(input) {
  if (!input?.id)     throw new Error("Question.id is required.");
  if (!input?.prompt) throw new Error("Question.prompt is required.");
  if (!input?.answer) throw new Error("Question.answer is required.");

  return {
    id:           String(input.id),
    activityType: String(input.activityType || "general"),
    category:     input.category ? String(input.category) : null,
    difficulty:   ["easy", "medium", "hard"].includes(input.difficulty) ? input.difficulty : "medium",
    prompt:       String(input.prompt).trim(),
    answer:       String(input.answer).trim(),
    options:      Array.isArray(input.options) ? input.options.map(String) : null,
    explanation:  input.explanation ? String(input.explanation).trim() : null,
    tags:         Array.isArray(input.tags) ? input.tags.map(String) : [],
    createdAt:    Number(input.createdAt) || Date.now(),
  };
}
