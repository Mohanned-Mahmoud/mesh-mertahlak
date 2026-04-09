# Render Deployment Guide

This project is configured for deployment on Render.com (free tier) with both frontend and backend services in a single project.

## Architecture

- **Frontend**: React + Vite, deployed as Node service via `serve` binary
- **Backend**: Express.js + Socket.IO, deployed via Docker
- **Database**: Neon PostgreSQL (external, not deployed to Render)

## Prerequisites

1. **Render Account**: Create a free account at [render.com](https://render.com)
2. **Render CLI** (optional, for automated deploys):
   ```bash
   npm install -g render-cli-v2
   render login
   ```
3. **Database**: Ensure your Neon PostgreSQL connection string is available

## Single Project Setup

Both services are defined in `render.yaml` and deploy to the same Render project.

### 1. Create Render Project

1. Log in to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Use the `render.yaml` blueprint (Render will auto-detect it)

### 2. Configure Services from render.yaml

Render will automatically create both services:

**Service 1: Frontend (date-judge-frontend)**
- Runtime: Node
- Port: 3000
- Build: `pnpm install --frozen-lockfile && pnpm run build:frontend`
- Start: `npm install -g serve && serve -s artifacts/date-judge/dist/public -l 3000`

**Service 2: Backend (date-judge-api)**
- Runtime: Docker
- Port: auto-detected from Dockerfile
- Build: Uses `artifacts/api-server/Dockerfile`

### 3. Set Environment Variables

Render will pre-populate most environment variables from `render.yaml`, but you must set:

**Backend Service (date-judge-api) - Secrets:**
- `DATABASE_URL`: Your Neon PostgreSQL connection string (mark as **Secret**)

**Frontend Service (date-judge-frontend) - Auto-populated:**
- `VITE_API_BASE_URL`: `https://date-judge-api.onrender.com/api`
- `VITE_SOCKET_URL`: `https://date-judge-api.onrender.com`

### 4. Deploy

Click **Deploy** and wait for both services to build and start (~3-5 minutes total)

## Manual Alternative (Without render.yaml)

If Render doesn't auto-detect `render.yaml`, manually create both web services:

**Frontend Service:**
- Runtime: Node
- Build Command: `pnpm install --frozen-lockfile && pnpm run build:frontend`
- Start Command: `npm install -g serve && serve -s artifacts/date-judge/dist/public -l 3000`
- Environment Variables:
  - `NODE_ENV`: `production`
  - `VITE_API_BASE_URL`: `https://date-judge-api.onrender.com/api`
  - `VITE_SOCKET_URL`: `https://date-judge-api.onrender.com`
  - `PNPM_HOME`: `/app/.pnpm`
  - `PATH`: `/app/.pnpm:$PATH`

**Backend Service:**
- Runtime: Docker
- Dockerfile Path: `./artifacts/api-server/Dockerfile`
- Docker Context: `./`
- Environment Variables:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: Your Neon connection string (mark as Secret)
- Health Check Path: `/api/health`

## Automated Deployment (via CLI)

After creating the project and authenticating with Render CLI:

```bash
# Deploy both services
pnpm run deploy:render

# Or deploy individually
pnpm run deploy:render:frontend
pnpm run deploy:render:backend
```

## Environment Variables Reference

### Backend (date-judge-api)
- `NODE_ENV`: Set to `production`
- `DATABASE_URL`: PostgreSQL connection string (mark as Secret in Render dashboard)

### Frontend (date-judge-frontend)
- `NODE_ENV`: Set to `production`
- `VITE_API_BASE_URL`: Backend API URL (e.g., `https://date-judge-api.onrender.com/api`)
- `VITE_SOCKET_URL`: Backend Socket.IO URL (e.g., `https://date-judge-api.onrender.com`)
- `PNPM_HOME`: `/app/.pnpm` (for pnpm support)
- `PATH`: `/app/.pnpm:$PATH` (for pnpm support)

## Accessing Your Services

Once deployed:
- **Frontend**: https://date-judge-frontend.onrender.com
- **Backend API**: https://date-judge-api.onrender.com/api
- **Socket.IO**: https://date-judge-api.onrender.com

## Troubleshooting

### Build fails with "Cannot find module"
- Ensure `pnpm install` is run in the Dockerfile
- Check that all dependencies are in `artifacts/api-server/package.json`

### Frontend doesn't connect to backend
- Verify `VITE_API_BASE_URL` and `VITE_SOCKET_URL` match your deployed backend URL
- Check browser console for CORS errors
- Ensure WebSocket connections are allowed (Render supports them)

### Database connection errors
- Verify `DATABASE_URL` is correct and marked as "Secret" in Render
- Ensure Neon database allows connections from Render IP ranges
- Test connection string locally with a quick CLI test

### Services not appearing in Render dashboard
- Make sure `render.yaml` is committed to your Git repository
- Push changes to main/master branch
- Trigger new deployment or reconnect repo

## Free Tier Limitations

- Services spin down after 15 minutes of inactivity (cold start ~30-50 seconds)
- Database must be managed separately (not on Render free tier)
- Limited to 750 free hours/month (approximately 1 service always running)
- Both services count toward the 750-hour limit

## Configuration Files

- `render.yaml`: Both services defined in single project blueprint
- `.env.render.example`: Environment variables template
- `scripts/deploy-render.mjs`: Automated deployment script
- `artifacts/api-server/Dockerfile`: Backend container image
