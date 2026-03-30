# SkillNODE

AI-powered skill + games platform with profiles, multiplayer foundation, and a premium UI.

## Prereqs
- Node.js 18+ (recommended 20+)
- Docker Desktop (recommended) for Postgres

## Quick start (dev)

### 1) Start Postgres

```bash
docker compose up -d
```

### 2) Server

```bash
cd server
npm install
copy .env.example .env
npm run prisma:migrate
npm run dev
```

Server runs on `http://localhost:5000`.

### 3) Client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`.

## Environment variables

- Server env is in `server/.env` (see `server/.env.example`)
  - `RESEND_API_KEY` + `RESEND_FROM` for login emails
  - `OPENAI_API_KEY` for AI hints

## Notes
- **Screenshot detection** isn’t fully possible on the web. SkillNODE uses best-effort signals (PrintScreen key, tab/window focus changes) to show an alert and log an audit event.

