# Cal.com Railway Deployment Status

## Current Status: DEPLOYING (Healthcheck Failing)

Last updated: 2025-01-18

## What's Working

- **Build**: Docker build completes successfully (~10 min)
- **Environment Variables**: Fixed and now properly injected
  - DATABASE_URL: Working (connects to Postgres)
  - DATABASE_DIRECT_URL: Added (required by Prisma)
  - NEXTAUTH_SECRET: Fixed (was broken due to leading space in variable name)
  - NEXTAUTH_URL: Fixed
  - NEXT_PUBLIC_WEBAPP_URL: Fixed

## What Was Fixed

### Issue 1: Leading Spaces in Variable Names
The original variables were entered with accidental leading spaces:
- `" NEXTAUTH_SECRET"` instead of `"NEXTAUTH_SECRET"`
- `" NEXTAUTH_URL"` instead of `"NEXTAUTH_URL"`
- `" NEXT_PUBLIC_WEBAPP_URL"` instead of `"NEXT_PUBLIC_WEBAPP_URL"`

This caused the app to not find the variables. Fixed by deleting and recreating without spaces.

### Issue 2: Missing DATABASE_DIRECT_URL
Prisma schema requires both `DATABASE_URL` and `DATABASE_DIRECT_URL`. Added via:
```bash
railway variable set DATABASE_DIRECT_URL='${{Postgres.DATABASE_URL}}' --service cal.com
```

### Issue 3: Start Script Improvements
Modified `scripts/start.sh` to:
- Reduce verbose logging (was causing rate limiting)
- Make seed-app-store errors non-fatal (redirected to /dev/null)
- Add migration exit code logging

## Current Problem

The app builds but healthcheck fails. Possible causes:
1. Migrations may not be running properly
2. App may be crashing during startup
3. Port/networking issue

## Railway Configuration

**Project**: cal.com
**Service**: dries-robuxio-cal.com (GitHub repo deployment)
**URL**: https://calcom-production-edf7.up.railway.app

### Environment Variables (All Correct Now)
```json
{
  "CALENDSO_ENCRYPTION_KEY": "zIYQlzyoX/XtNhchBPC7ECeeDAY/tu/K9+xaLta6rrg",
  "DATABASE_DIRECT_URL": "postgresql://...",
  "DATABASE_URL": "postgresql://...",
  "NEXTAUTH_SECRET": "my-single-nextauth-secret-2024",
  "NEXTAUTH_URL": "https://calcom-production-edf7.up.railway.app",
  "NEXT_PUBLIC_WEBAPP_URL": "https://calcom-production-edf7.up.railway.app"
}
```

## Files Modified

| File | Changes |
|------|---------|
| `scripts/start.sh` | Simplified, better error handling, non-fatal seed |
| `railway.toml` | Added for Railway configuration |
| `Dockerfile` | Changed CMD to shell form (didn't help) |

## Next Steps

1. **Debug Healthcheck Failure**
   - Check if migrations are actually running
   - Look for specific startup errors in logs
   - Consider running migrations manually first

2. **Possible Fixes to Try**
   - Run migrations via Railway shell before app start
   - Increase healthcheck timeout
   - Check if PORT environment variable is needed
   - Try Railway template to compare

3. **Once Working**
   - Create admin user
   - Configure calendars
   - Set up booking types
   - Embed in robuxio.com

## Useful Commands

```bash
# Check status
railway service status --all

# View logs
railway service logs --service cal.com --latest --lines 100

# Check variables
railway variable list --json --service cal.com

# Redeploy
railway service redeploy --service cal.com

# Delete a variable
railway variable delete VARNAME --service cal.com

# Set a variable
railway variable set VARNAME=value --service cal.com
```

## Railway CLI Setup

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project (run in cal-com-fork directory)
railway link --project "cal.com"
```
