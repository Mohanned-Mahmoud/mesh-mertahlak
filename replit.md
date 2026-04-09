# The Date Judge (قاضي البلح) - Party Game Companion App

## Overview

Full-stack real-time party game companion app built with React, Express, Socket.io, and PostgreSQL.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (Pop Cartoon theme)
- **Backend**: Express 5 + Socket.io (real-time game state)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/date-judge/` — React frontend (served at `/`, port 20820)
- `artifacts/api-server/` — Express + Socket.io backend (served at `/api` and `/socket.io`, port 8080)

## Game Architecture

### Socket.io Events
**Client → Server:**
- `join-room` → `{ roomCode, playerName }`
- `start-game` → `{ roomCode }` (host only)
- `next-phase` → `{ roomCode }` (judge triggers verbal phase)
- `start-voting` → `{ roomCode }` (judge starts vote)
- `submit-vote` → `{ roomCode, votedPlayerId }` (judge votes)
- `next-round` → `{ roomCode }` (judge or host)

**Server → Client (per-player personalized state):**
- `room-joined`, `game-started`, `phase-changed`, `voting-started`, `vote-submitted`, `round-ended`
- Each event sends `GameState` with `myRole` specific to each player

### Roles
- **Judge (القاضي)**: Sees the question, must guess the truth teller
- **Truth Teller (عين العقل)**: Knows the answer, must act doubtful
- **Deceivers (اللي بياكلوا بعقل الحكم حلاوة)**: Know the answer, must lie convincingly

### Scoring
- Judge guesses right → Judge gets 1 diamond
- Judge guesses wrong → Truth Teller gets 1 diamond + Deceiver gets 1 diamond

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/date-judge run dev` — run frontend locally

## Database Schema

- `questions` table: `id (serial PK)`, `question (text)`, `answer (text)` — 30 pre-seeded Arabic questions

## Key Files

- `artifacts/api-server/src/lib/game-engine.ts` — Socket.io game state machine (in-memory)
- `artifacts/api-server/src/index.ts` — HTTP server with Socket.io setup
- `artifacts/date-judge/src/lib/socket-context.tsx` — React Socket.io context
- `artifacts/date-judge/src/pages/room.tsx` — All game screens (lobby, judge, player, voting, scoring)
- `artifacts/date-judge/src/pages/home.tsx` — Landing/entry screen
- `lib/db/src/schema/questions.ts` — Database schema
