# SkillNODE

SkillNODE is a multi-page AI-powered skills platform with:
- secure email-code sign-in
- public player profiles
- persistent activity results
- live leaderboard APIs
- multiplayer room presence
- typing, math, guessing, coding, grammar, and comprehension modules

## Stack

- `client`: React + Vite
- `server`: Express + Prisma + Postgres + Socket.IO
- `db`: PostgreSQL via Docker

## Local setup

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Configure server env

```bash
cd server
copy .env.example .env
```

Important variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `OPENAI_API_KEY`
- `ALLOW_DEV_LOGIN_CODE=true` for local testing without email delivery

### 3. Push Prisma schema

```bash
npm run db:push
```

### 4. Install dependencies

```bash
npm install
npm install -w client
npm install -w server
```

### 5. Run the app

Server:

```bash
npm run dev:server
```

Client:

```bash
cd client
copy .env.example .env
cd ..
npm run dev:client
```

Client runs on `http://localhost:5173`.
Server runs on `http://localhost:5000`.

## Build

```bash
npm run build
```

## Auth flow

1. User enters DP, name, phone, email, and region.
2. Server sends a 6-digit verification code to the provided email.
3. User verifies the code.
4. Server issues a JWT session and sends a login alert email.

In development, if `RESEND_API_KEY` is missing and `ALLOW_DEV_LOGIN_CODE=true`, the verification code is returned in the API response and shown in the UI.

## Persistent product features

- profile editing and public sharing
- result storage for all main activity pages
- leaderboard endpoint for competitive views
- audit logging for fair-play events
- authenticated Socket.IO room presence

## Deployment notes

- Deploy the server anywhere Node + Postgres are available.
- Deploy the Vite client as a static app with `VITE_API_BASE_URL` pointing at the server.
- Set `PUBLIC_APP_URL` on the server to the deployed client URL.
- Configure `RESEND_API_KEY` and `RESEND_FROM` for real email delivery.
- Configure `OPENAI_API_KEY` for AI hints.

## Honest limitations

- screenshot detection on the web is best-effort only
- coding challenges currently run sample tests in-browser, not in a hardened remote judge
- this is now a strong deployable MVP, but not yet a full enterprise-scale platform with payments, admin moderation, deep analytics, or horizontal scaling infrastructure
