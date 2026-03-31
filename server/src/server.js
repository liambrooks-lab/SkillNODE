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
import { attachRealtime } from "./realtime/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: env.PUBLIC_APP_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

// Serve uploads in dev/prod (static)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({ status: "Online", app: "SkillNODE", message: "API running." });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/audit", auditRouter);
app.use("/api/ai", aiRouter);
app.use("/api/public", publicRouter);

const io = new Server(server, {
  cors: {
    origin: env.PUBLIC_APP_URL,
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
