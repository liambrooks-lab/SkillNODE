import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { auditRouter } from "./routes/audit.js";
import { aiRouter } from "./routes/ai.js";
import { publicRouter } from "./routes/public.js";
import { resultsRouter } from "./routes/results.js";
import { attachRealtime } from "./realtime/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.set("trust proxy", 1);

// Serve uploads in dev/prod (static)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({ status: "Online", app: "SkillNODE", message: "API running." });
});

app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/audit", auditRouter);
app.use("/api/ai", aiRouter);
app.use("/api/public", publicRouter);
app.use("/api/results", resultsRouter);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Upload too large. Max size is 3 MB." });
  }

  if (err?.message === "Only image uploads are allowed.") {
    return res.status(400).json({ error: err.message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

const io = new Server(server, {
  cors: {
    origin: [...allowedOrigins],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
attachRealtime(io);

const PORT = Number(env.PORT || 5000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SkillNODE server listening on ${PORT}`);
});

function getAllowedOrigins() {
  return new Set(
    [env.PUBLIC_APP_URL, ...env.PUBLIC_APP_URLS.split(",").map((value) => value.trim())].filter(Boolean),
  );
}
