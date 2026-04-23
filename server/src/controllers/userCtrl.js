import { getSessionProfile as localProfile } from "../lib/localStore.js";

/** In-memory profile store for server-side profile sync (optional, enhances multiplayer) */
const profiles = new Map();

/** GET /api/users/:userId */
export async function getUser(req, res) {
  try {
    const { userId } = req.params;
    const profile = profiles.get(userId);
    if (!profile) return res.status(404).json({ error: "User not found." });
    return res.json(profile);
  } catch (err) {
    console.error("[userCtrl.getUser]", err);
    return res.status(500).json({ error: "Failed to retrieve user." });
  }
}

/** PATCH /api/users/:userId */
export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { name, region, bio, githubUrl, linkedinUrl, portfolioUrl, xUrl } = req.body;

    const existing = profiles.get(userId) || {};
    const updated = {
      ...existing,
      id: userId,
      name: (name ?? existing.name ?? "").trim(),
      region: (region ?? existing.region ?? "").trim(),
      bio: (bio ?? existing.bio ?? "").trim(),
      githubUrl: (githubUrl ?? existing.githubUrl ?? "").trim(),
      linkedinUrl: (linkedinUrl ?? existing.linkedinUrl ?? "").trim(),
      portfolioUrl: (portfolioUrl ?? existing.portfolioUrl ?? "").trim(),
      xUrl: (xUrl ?? existing.xUrl ?? "").trim(),
      updatedAt: Date.now(),
    };

    profiles.set(userId, updated);
    return res.json(updated);
  } catch (err) {
    console.error("[userCtrl.updateUser]", err);
    return res.status(500).json({ error: "Failed to update user." });
  }
}

/** POST /api/users/:userId/sync — sync local profile to server */
export async function syncProfile(req, res) {
  try {
    const { userId } = req.params;
    const payload = req.body;
    if (!payload?.id) return res.status(400).json({ error: "Invalid profile payload." });
    profiles.set(userId, { ...payload, serverSynced: true, syncedAt: Date.now() });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[userCtrl.syncProfile]", err);
    return res.status(500).json({ error: "Sync failed." });
  }
}
