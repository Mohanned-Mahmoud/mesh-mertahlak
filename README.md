# 🃏 مش مرتاحلك المضروبة (Mesh Mertahlak Online)

> **"أيوه إحنا سارقين الفكرة بالمللي، بس عملناها أونلاين وببلاش عشان إحنا غلابة."** 🥸

A real-time, open-source multiplayer web game inspired by the wildly popular Egyptian social deduction card game "Mesh Mertahlak" (مش مرتاحلك). This digital "bootleg" version brings the chaos, bluffing, and laughter of the physical game to browsers anywhere, allowing friend groups to play together remotely.

Live game: https://mesh-mertahlak.onrender.com/

---

## 💡 The Idea: How It Works

At its core, **Mesh Mertahlak Online** is a game of deception, confidence, and reading your friends. It requires at least 3 players connected to the same room.

### The Roles

Every round, the game engine automatically assigns roles:

* ⚖️ **The Judge (القاضي):** One player is chosen to be the judge. They don't know the answer to the current question. Their goal is to figure out who is telling the truth.
* 😇 **The Truth-Teller (صاحب عين العقل):** One player is secretly given the actual correct answer to an obscure question.
* 😈 **The Deceivers (الهبيدة):** Everyone else. They see the question, but *not* the answer. Their goal is to make up a convincing fake answer on the spot.

### The Game Loop

1.  **Card Display:** A random question is pulled from the database. Everyone except the Judge sees the question. The Truth-Teller sees the real answer.
2.  **Verbal Phase:** The Judge asks the question. One by one (or in chaotic cross-talk), players state their answers. 
3.  **Voting:** The Judge must cast their vote for who they believe is the actual Truth-Teller.
4.  **Scoring:** Judge gets 1 point if correct. If fooled, the Truth-Teller and the successful Deceiver get 1 point each. First to **6 points** wins!

---

## 🏗️ Architecture & Monorepo Layout

The app pairs a Vite + React frontend with an Express + Socket.IO backend and a PostgreSQL-backed question database. It is built as a highly robust **TypeScript Monorepo** using `pnpm` workspaces.

* 🎨 `artifacts/date-judge` - React + Vite frontend styled with a bold Arabic visual language.
* ⚙️ `artifacts/api-server` - Express + Socket.IO backend (handles API, real-time socket transport, and serves the frontend in prod).
* 🗄️ `lib/db` - Drizzle ORM schema and PostgreSQL database access.
* 🛡️ `lib/api-zod` - Shared Zod schemas for strict API validation across client and server.
* ⚡ `lib/api-client-react` - React Query client helpers automatically generated from the API schema.
* 📜 `scripts` - Deployment helpers and utility scripts.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

* **Node.js** 20+
* **pnpm** 9+
* A **PostgreSQL** database (for questions and game data).

### 1. Install Dependencies

From the repository root, run:

```bash
pnpm install
```

### 2. Environment Variables

Create .env files in the respective directories:

Backend (artifacts/api-server/.env):

* `PORT` - (e.g., 3000)
* `DATABASE_URL` - Your PostgreSQL connection string.
* `NODE_ENV` - development

Frontend (artifacts/date-judge/.env):

* `VITE_API_BASE_URL` - /api (local) or your production backend URL.
* `VITE_SOCKET_URL` - / (local) or your production backend URL.

### 3. Setup the Database

Push the Drizzle schema to your PostgreSQL database to create the questions table:

```bash
pnpm --filter @workspace/db push
```

(Use push-force if you need to force schema changes).

### 4. Run the Dev Servers

Open two terminal tabs and run the frontend and backend separately:

Backend:

```bash
pnpm --filter @workspace/api-server dev
```

Frontend:

```bash
pnpm --filter @workspace/date-judge dev
```

## 🛠️ Scripts & Build Commands

From the root package, you can run:

* `pnpm run build` - Type-checks then builds all workspace packages.
* `pnpm run build:frontend` - Builds the React app.
* `pnpm run build:api-server` - Builds the backend server.
* `pnpm run typecheck` - Runs workspace-wide TypeScript type checking.

Deployment Scripts:

* `pnpm run deploy:render` - Deploys both services to Render via CLI.
* `pnpm run deploy:render:frontend / pnpm run deploy:render:backend` - Deploys a specific service.

## 🌍 Deployment (Render Free-Tier)

This repository is optimized for Render's free tier. In production, the root Dockerfile builds both the backend and frontend, then copies the compiled artifacts into a small runtime image. The backend starts from the compiled server bundle and serves the frontend static output directly.

Recommended Flow:

* Connect this repository to a new Render project.
* Setup an external PostgreSQL database (e.g., Neon).
* Set DATABASE_URL as a secret on the backend service.
* Point VITE_API_BASE_URL and VITE_SOCKET_URL to your Render backend service URL.
* Deploy using the included render.yaml blueprint.

## 🩺 Troubleshooting

* Frontend cannot reach the backend: Verify VITE_API_BASE_URL and VITE_SOCKET_URL point to the correct host. Check browser console for CORS or WebSocket connection failures.
* Backend fails to start: Ensure PORT is in the environment and DATABASE_URL points to a reachable Postgres instance. Check logs for schema errors.
* No questions in the game: Ensure you have seeded the database with question rows. Verify the questions table exists.
* Render deployment fails: Confirm render.yaml is committed, DATABASE_URL is a marked secret, and the pnpm build command is executing successfully.

## ⚖️ Disclaimer & Shoutout

This project is an open-source homage to the original physical card game. As stated in the app:

"اللعب بالكروت الحقيقية أمتع بكتير. الأونلاين تمام للي معهمش فلوس، بس لما تكون الشلة موجودة فعلًا الجو بيبقى غير خالص."

If you love the digital version, go support the creators and buy the official physical copy of Mesh Mertahlak!

License: MIT