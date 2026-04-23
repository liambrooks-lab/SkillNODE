import jwt from "jsonwebtoken";
import { env } from "../env.js";

const ANON_PREFIX = "anon_";

function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30d" });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/** POST /api/auth/local — Local-first session creation */
export async function localLogin(req, res) {
  try {
    const { name, email, region } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }

    const sessionId = `${ANON_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const token = signToken({ id: sessionId, name: name.trim(), email: email?.trim() || null, region: region?.trim() || null, role: "player" });

    return res.json({ token, sessionId });
  } catch (err) {
    console.error("[authCtrl.localLogin]", err);
    return res.status(500).json({ error: "Failed to create session." });
  }
}

/** POST /api/auth/logout */
export async function logout(req, res) {
  return res.json({ ok: true });
}

/** GET /api/auth/me — Verify current token */
export async function getMe(req, res) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token provided." });

    const payload = verifyToken(token);
    return res.json({ id: payload.id, name: payload.name, email: payload.email, region: payload.region });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
