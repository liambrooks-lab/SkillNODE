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

- Recommended split:
  - backend + Postgres on Render
  - frontend on Vercel
- Deploy the Vite client as a static app with `VITE_API_BASE_URL` pointing at the Render backend URL.
- Set `PUBLIC_APP_URL` on the server to the deployed Vercel URL.
- If you use Vercel preview URLs too, set `PUBLIC_APP_URLS` to a comma-separated list of allowed origins.
- Configure `RESEND_API_KEY` and `RESEND_FROM` for real email delivery.
- Configure `OPENAI_API_KEY` for AI hints.

### Render

- Use the included [render.yaml](F:/Projects/SkillNODE/render.yaml) blueprint.
- It provisions:
  - a Postgres database
  - a Node web service for the API
  - a persistent disk for uploaded profile images
- After creating the blueprint, set:
  - `PUBLIC_APP_URL` to your production Vercel domain
  - `PUBLIC_APP_URLS` if you want to allow preview domains too
  - `PUBLIC_APP_URL_REGEX` if you want to allow dynamic Vercel preview URLs with one regex
  - `RESEND_API_KEY`
  - `RESEND_FROM`
  - `OPENAI_API_KEY` if AI hints should work in production
- Render runs `npm run prisma:push` before deploy using the blueprint.
 - On the free plan, Prisma schema sync runs inside the normal Render build command.

### Vercel

- You can import the repo root directly now. The root [vercel.json](F:/Projects/SkillNODE/vercel.json) builds `client` and serves `client/dist`.
- If you prefer setting the project Root Directory to `client`, Vercel will still pick up [vercel.json](F:/Projects/SkillNODE/client/vercel.json) for SPA route rewrites.
- Add:
  - `VITE_API_BASE_URL=https://your-render-api.onrender.com`
- Then redeploy.

Suggested preview-origin regex example for Render:

```txt
^https://.*\.vercel\.app$
```

### Production checklist

- Create the Render blueprint.
- Set the server env vars.
- Create the Vercel project.
- Set `VITE_API_BASE_URL`.
- Confirm that the Vercel URL is added to `PUBLIC_APP_URL`.
- Test:
  - email code login
  - profile upload
  - multiplayer room join
  - leaderboard updates
  - AI hint flow

## Honest limitations

- screenshot detection on the web is best-effort only
- coding challenges currently run sample tests in-browser, not in a hardened remote judge
- this is now a strong deployable MVP, but not yet a full enterprise-scale platform with payments, admin moderation, deep analytics, or horizontal scaling infrastructure
