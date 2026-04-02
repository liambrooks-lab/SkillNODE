# SkillNODE

SkillNODE is a multi-page skill development platform that blends competitive practice, social identity, AI-assisted learning, and lightweight multiplayer interaction into one product experience. It is designed to feel like a polished modern application rather than a collection of disconnected mini tools.

The platform currently includes:
- profile creation with display picture, bio, region, and social links
- public player profile sharing
- typing, math, guessing, coding, grammar, and comprehension modules
- persistent result storage and leaderboard APIs
- fair-play audit events for competitive flows
- real-time room presence through Socket.IO
- AI hint hooks for selected activities

## Product Vision

SkillNODE is built around a simple idea: skill growth should feel measurable, social, and premium. Users should be able to train, compete, present themselves professionally, and return to a product that feels cohesive across desktop and mobile.

## Key Features

- `Skill Labs`
  Solo practice modules for typing, math, guessing, coding, grammar, and comprehension.
- `Identity Layer`
  Player profile with DP, bio, region, and four social links.
- `Public Sharing`
  Public user pages that expose profile details and performance highlights.
- `Competition Layer`
  Results, best-score summaries, and leaderboard endpoints.
- `Realtime Presence`
  Multiplayer room presence via Socket.IO.
- `AI Assistance`
  Contextual hint endpoint for supported activities.
- `Fair-Play Signals`
  Suspicious focus-loss and screenshot-key events logged to the backend.

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Framer Motion
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Socket.IO
- Zod
- Resend
- OpenAI SDK

### Deployment
- Vercel for frontend hosting
- Render for backend and PostgreSQL

## Repository Structure

```txt
SkillNODE/
├─ client/                  Frontend application
│  ├─ public/               Static assets such as logo and manifest
│  ├─ src/
│  │  ├─ components/        Shared UI and layout components
│  │  ├─ data/              Product metadata and page configuration
│  │  ├─ hooks/             Reusable React hooks
│  │  ├─ lib/               API, auth, media, socket, and utility modules
│  │  ├─ pages/             Route-level screens
│  │  └─ styles/            Global product styling
│  └─ vercel.json           Vercel frontend routing configuration
├─ server/                  Backend API and realtime service
│  ├─ prisma/               Prisma schema
│  ├─ src/
│  │  ├─ ai/                AI client setup
│  │  ├─ auth/              JWT auth helpers
│  │  ├─ email/             Resend email integrations
│  │  ├─ middleware/        Auth and upload middleware
│  │  ├─ realtime/          Socket.IO room presence handling
│  │  └─ routes/            Express route modules
├─ tests/                   Existing test scaffolding
├─ render.yaml              Render blueprint
└─ docker-compose.yml       Local Postgres setup
```

## Core User Flows

### 1. Sign In
User enters profile details, optionally uploads a display picture, and enters the app through the login page.

### 2. Build Identity
User updates profile information, adds a short bio, and sets social links in the profile studio.

### 3. Train and Compete
User opens any activity module, plays a session, and the result is stored against the account.

### 4. Share Public Presence
User copies a public profile URL and shares a profile card that includes personal details, social links, and performance highlights.

## Environment Variables

### Frontend
Defined in `client/.env`:

```txt
VITE_API_BASE_URL=http://localhost:5000
```

### Backend
Defined in `server/.env`:

```txt
APP_ENV=development
PORT=5000
PUBLIC_APP_URL=http://localhost:5173
PUBLIC_APP_URLS=
PUBLIC_APP_URL_REGEX=
DATABASE_URL=postgresql://...
JWT_SECRET=your_long_secret
RESEND_API_KEY=
RESEND_FROM=SkillNODE <onboarding@resend.dev>
OPENAI_API_KEY=
ALLOW_DEV_LOGIN_CODE=true
```

## Local Development

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Install dependencies

```bash
npm install
npm install -w client
npm install -w server
```

### 3. Configure environment files

```bash
cd server
copy .env.example .env
cd ..\client
copy .env.example .env
cd ..
```

### 4. Sync the database schema

```bash
npm run db:push
```

### 5. Run the application

```bash
npm run dev:server
npm run dev:client
```

Default URLs:
- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`

## Build Commands

### Frontend production build

```bash
npm run build -w client
```

### Full repository build

```bash
npm run build
```

## Deployment

### Render
- backend API hosted on Render web service
- PostgreSQL hosted on Render database
- configuration defined in [render.yaml](F:/Projects/SkillNODE/render.yaml)

### Vercel
- frontend hosted on Vercel
- project root should point to `client`
- set `VITE_API_BASE_URL` to the Render backend URL

## Mobile and Responsive Design Notes

SkillNODE is designed to be usable across desktop, tablet, and mobile devices. The main application uses adaptive grids, mobile navigation, route-level code splitting, and profile layouts that collapse cleanly on smaller screens.

## Current Limitations

- screenshot detection on the web is best-effort only
- coding challenges currently run sample tests in-browser, not in a hardened remote judge
- email OTP code paths exist in the backend, but the live sign-in flow is currently optimized for direct entry
- free hosting constraints may affect persistent file storage and cold-start behavior

## Author

### Name
Rudranarayan Jena

### GitHub
[liambrooks-lab](https://github.com/liambrooks-lab)

## Project Positioning

SkillNODE is structured as a serious product-oriented MVP. The codebase emphasizes:
- modular route separation
- reusable UI primitives
- API-backed state instead of static-only pages
- deployment-ready frontend and backend separation
- product presentation suitable for portfolio, startup prototype, or further commercial evolution
