/**
 * MatchHistory model schema.
 * Represents a single completed game/challenge session.
 */

export const MatchHistorySchema = {
  id:           { type: "string", required: true  },
  userId:       { type: "string", required: true  },
  activityType: { type: "string", required: true  },  // "typing" | "math" | "code" | "guess" | "grammar" | "comprehension"
  score:        { type: "number", required: true  },
  accuracy:     { type: "number", required: false },
  durationMs:   { type: "number", required: false },
  roomCode:     { type: "string", required: false },
  metadata:     { type: "object", default: {}     },
  createdAt:    { type: "number", default: () => Date.now() },
};

export function normalizeMatch(input) {
  if (!input?.id)           throw new Error("MatchHistory.id is required.");
  if (!input?.userId)       throw new Error("MatchHistory.userId is required.");
  if (!input?.activityType) throw new Error("MatchHistory.activityType is required.");

  return {
    id:           String(input.id),
    userId:       String(input.userId),
    activityType: String(input.activityType),
    score:        Number(input.score) || 0,
    accuracy:     input.accuracy != null ? Number(input.accuracy) : null,
    durationMs:   input.durationMs != null ? Number(input.durationMs) : null,
    roomCode:     input.roomCode ? String(input.roomCode) : null,
    metadata:     input.metadata && typeof input.metadata === "object" ? input.metadata : {},
    createdAt:    Number(input.createdAt) || Date.now(),
  };
}
