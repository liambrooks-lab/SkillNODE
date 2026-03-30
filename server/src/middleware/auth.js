import { verifyToken } from "../auth/jwt.js";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const [, token] = hdr.split(" ");
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const decoded = verifyToken(token);
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid auth token" });
  }
}

