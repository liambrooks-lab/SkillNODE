/**
 * User model schema definition.
 * SkillNODE is local-first — this schema documents the shape of user data.
 * It is used for server-side profile sync and future database integration.
 */

export const UserSchema = {
  id:           { type: "string",  required: true  },
  name:         { type: "string",  required: true  },
  email:        { type: "string",  required: false },
  phone:        { type: "string",  required: false },
  region:       { type: "string",  required: false },
  bio:          { type: "string",  required: false },
  dpUrl:        { type: "string",  required: false },
  githubUrl:    { type: "string",  required: false },
  linkedinUrl:  { type: "string",  required: false },
  portfolioUrl: { type: "string",  required: false },
  xUrl:         { type: "string",  required: false },
  role:         { type: "string",  default: "player" },
  createdAt:    { type: "number",  default: () => Date.now() },
  updatedAt:    { type: "number",  default: () => Date.now() },
};

/**
 * Validate and normalize a user object against UserSchema.
 * Returns the normalized object or throws if required fields are missing.
 */
export function normalizeUser(input) {
  if (!input?.id) throw new Error("User.id is required.");
  if (!input?.name?.trim()) throw new Error("User.name is required.");

  return {
    id:           String(input.id).trim(),
    name:         String(input.name).trim(),
    email:        input.email ? String(input.email).trim().toLowerCase() : null,
    phone:        input.phone ? String(input.phone).trim() : null,
    region:       input.region ? String(input.region).trim() : null,
    bio:          input.bio ? String(input.bio).trim() : null,
    dpUrl:        input.dpUrl ? String(input.dpUrl).trim() : null,
    githubUrl:    input.githubUrl ? String(input.githubUrl).trim() : null,
    linkedinUrl:  input.linkedinUrl ? String(input.linkedinUrl).trim() : null,
    portfolioUrl: input.portfolioUrl ? String(input.portfolioUrl).trim() : null,
    xUrl:         input.xUrl ? String(input.xUrl).trim() : null,
    role:         input.role || "player",
    createdAt:    Number(input.createdAt) || Date.now(),
    updatedAt:    Number(input.updatedAt) || Date.now(),
  };
}
