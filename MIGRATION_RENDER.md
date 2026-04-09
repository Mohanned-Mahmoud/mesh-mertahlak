# Migration from Firebase to Render - Summary

## What Changed

### Removed
- ❌ `firebase.json` - Firebase Hosting configuration
- ❌ `.firebaserc` - Firebase project binding
- ❌ `deploy:firebase` npm script
- ❌ `deploy:api-server` npm script (Cloud Run based)
- ❌ `scripts/deploy-api-server.mjs` (GCP/Cloud Run based)
- ❌ Firebase Hosting deployment logic

### Added
- ✅ `render.yaml` - Single Render project with both frontend and backend services
- ✅ `scripts/deploy-render.mjs` - Automated Render deployment helper
- ✅ `.env.render.example` - Render environment variables template
- ✅ `RENDER_DEPLOYMENT.md` - Complete deployment guide
- ✅ `MIGRATION_RENDER.md` - This file

### Updated
- 📝 `package.json` - Replaced Firebase scripts with Render scripts
- 📝 `artifacts/date-judge/vite.config.ts` - Simplified for Render (port 3000, root base)

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Render.com (Free) - Single Project             │
│                                                             │
│  ┌──────────────────────┐   ┌──────────────────────┐      │
│  │ Frontend Service     │   │ Backend Service      │      │
│  │ (Node Runtime)       │   │ (Docker Runtime)     │      │
│  │                      │   │                      │      │
│  │ • React + Vite       │   │ • Express.js         │      │
│  │ • Port: 3000         │   │ • Socket.IO          │      │
│  │ • serve command      │   │ • Auto-port (4000)   │      │
│  └──────────────────────┘   └─────────┬────────────┘      │
│         │                             │                   │
│         │         Both defined in     │                   │
│         └────── render.yaml ─────────┘                   │
│                                                             │
│            ┌──────────────────────┐                       │
│            │  External Database   │                       │
│            │ (Neon PostgreSQL)    │                       │
│            └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```
│         │                    ┌────────▼──────┐            │
│         │                    │  Neon Database │            │
│         │                    │  (External)    │            │
│         │                    └────────────────┘            │
│         └──────────────────────────┬──────────────┬────────┤
│                      Socket.IO     │      REST    │        │
│                      Connections   │      API     │        │
└─────────────────────────────────────────────────────────────┘
```

## Why Render?

1. **Free Tier**: Both frontend and backend can run free (with cold-start limitations)
2. **No Billing Blocker**: Unlike GCP, doesn't require credit card/billing account
3. **Docker Support**: Native Docker support for backend
4. **PostgreSQL Integration**: Easy integration with external Neon PostgreSQL
5. **Simple Deployment**: Web UI + CLI available for easy deployment

## Free Tier Limitations & Workarounds

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| 15-min auto-shutdown | Cold starts (30-50s) | Navigate frontend frequently |
| ~750 hrs/month free | 2 services = ~375 hrs each | Share free tier or upgrade |
| No always-on database | N/A | Use external Neon (already done) |

## Deployment Steps

### Quick Start (Manual)
1. Create [render.com](https://render.com) account (free)
2. Use Render UI to create two services:
   - Frontend: Node runtime, build command `pnpm install && pnpm run build:frontend`
   - Backend: Docker runtime, auto-detect Dockerfile
3. Set environment variables on each service (see `RENDER_DEPLOYMENT.md`)
4. Services auto-deploy on push to main branch

### Automated (Optional)
```bash
# After installing Render CLI
npm install -g render-cli-v2
render login

# Then deploy
pnpm run deploy:render
```

## Environment Variables

### Frontend Service
```
NODE_ENV=production
VITE_API_BASE_URL=https://date-judge-api.onrender.com/api
VITE_SOCKET_URL=https://date-judge-api.onrender.com
PNPM_HOME=/app/.pnpm
PATH=/app/.pnpm:$PATH
```

### Backend Service
```
NODE_ENV=production
DATABASE_URL=postgresql://... (your Neon connection string, marked Secret)
```

## Accessing Deployed Services

Once both services are deployed:
- **Frontend**: https://date-judge-frontend.onrender.com
- **Backend API**: https://date-judge-api.onrender.com/api
- **Backend Socket.IO**: https://date-judge-api.onrender.com

## Troubleshooting

### Build fails on Render
- Check build logs in Render dashboard
- Ensure `pnpm install --frozen-lockfile` is in build command
- Verify all required env vars are set before deploy

### Frontend doesn't connect to backend
- Verify `VITE_API_BASE_URL` and `VITE_SOCKET_URL` match deployed backend
- Check browser DevTools → Network tab for CORS/connection errors
- Ensure backend service is running (check Render dashboard status)

### Backend image build fails
- Ensure `artifacts/api-server/Dockerfile` exists
- Verify Dockerfile uses correct Node base image (currently using Chainguard)
- Check that all dependencies are installed in Dockerfile

## Files Created/Modified

### New Files
- `render-frontend.yaml` - Frontend service config
- `render-backend.yaml` - Backend service config
- `scripts/deploy-render.mjs` - Deploy automation
- `.env.render.example` - Environment variable template
- `RENDER_DEPLOYMENT.md` - Detailed deployment guide
- `MIGRATION_RENDER.md` - This migration summary

### Modified Files
- `package.json` - Changed deploy:firebase → deploy:render
- `artifacts/date-judge/vite.config.ts` - Port 3000, simplified base path

### Removed Files
- `firebase.json` - No longer needed
- `.firebaserc` - No longer needed
- `scripts/deploy-api-server.mjs` - Cloud Run specific, replaced by Render

## Next Steps

1. ✅ Codebase ready for Render (builds verified)
2. ⏳ Create Render account (free)
3. ⏳ Deploy frontend service
4. ⏳ Deploy backend service
5. ⏳ Set environment variables on both services
6. ⏳ Access deployed application

See `RENDER_DEPLOYMENT.md` for detailed deployment instructions.
