# Render Deployment - Quick Reference

## Status: ✅ READY FOR DEPLOYMENT

All code and configuration is prepared for Render.com free tier deployment.

## One-Time Setup (5 minutes)

1. Create free account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Use `render.yaml` - Render will auto-detect and create both services
4. Set `DATABASE_URL` environment variable on backend service
5. Deploy

## Deploy Scripts

```bash
# Deploy everything
pnpm run deploy:render
```

(Or manually deploy via Render dashboard)

## URLs After Deployment

```
Frontend: https://date-judge-frontend.onrender.com
Backend:  https://date-judge-api.onrender.com/api
Socket.IO: https://date-judge-api.onrender.com
```

## Essential Environment Variables

**Frontend Service:**
- `NODE_ENV=production`
- `VITE_API_BASE_URL=https://date-judge-api.onrender.com/api`
- `VITE_SOCKET_URL=https://date-judge-api.onrender.com`
- `PNPM_HOME=/app/.pnpm`
- `PATH=/app/.pnpm:$PATH`

**Backend Service:**
- `NODE_ENV=production`
- `DATABASE_URL=<your-neon-connection-string>` (marked as Secret)

## Database

Connection string from `.env` file:
```
postgresql://user:password@ep-shiny-truth-al4rzh6v-pooler.c-3.eu-central-1.aws.neon.tech/neon
```

Set this on backend service as `DATABASE_URL` environment variable.

## Documentation

- **Full Guide**: See `RENDER_DEPLOYMENT.md`
- **Migration Notes**: See `MIGRATION_RENDER.md`
- **Deployment Config**: `render.yaml` (defines both frontend & backend services)

## What's Different from Previous Setup

| Before | After |
|--------|-------|
| Firebase Hosting | Render Node service |
| Cloud Run (blocked by billing) | Render Docker service |
| GCP project binding | GitHub repository integration |
| Requires GCP account + billing | Free Render account (no billing) |

## Troubleshooting

**Build fails**: Check Render build logs dashboard
**Can't connect**: Verify environment variables match deployed URLs
**Database error**: Ensure DATABASE_URL is set as Secret on backend service

See `RENDER_DEPLOYMENT.md` for detailed troubleshooting.

---

**Status**: Code ✅ Built ✅ Config ✅ → Ready to deploy!
