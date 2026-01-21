# Cal.com Fork (Rebookshare)

This repo is a fork of Cal.com tailored for our deployment on Railway.

Live URL: https://call.robuxio.com

## What This Fork Is For

- Self-hosted Cal.com with organizations enabled.
- Custom booking pages like `/papo` (these map to user slugs).
- Railway deployment from GitHub with reproducible build settings.

## Key Behavior

- `/` is the main app dashboard. If you see a 404 on `/`, the domain was treated as an org subdomain at build time. See the Railway section below.
- `/papo` only works if a user with username `papo` exists in the database.
- Organizations are enabled via `ORGANIZATIONS_ENABLED=true`.

## Local Development (Quick Start)

1) Install dependencies

```bash
yarn
```

2) Copy and configure env

```bash
cp .env.example .env
```

Required minimum:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `CALENDSO_ENCRYPTION_KEY`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_WEBAPP_URL`

3) Run the app

```bash
yarn dev
```

## Railway Deployment (GitHub Build)

This repo is connected to Railway. Pushing to `main` triggers a build.

### Required Build-Time Argument

The org rewrite logic is computed at build time. If `NEXT_PUBLIC_WEBAPP_URL` is missing during build,
the app will treat your domain as an org subdomain and `/` will 404.

We pin the build arg in `railway.toml` for consistency:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[build.args]
NEXT_PUBLIC_WEBAPP_URL = "https://call.robuxio.com"
```

### Required Runtime Variables

Set these in Railway (Service -> Variables):
- `DATABASE_URL`
- `DATABASE_DIRECT_URL`
- `NEXTAUTH_SECRET`
- `CALENDSO_ENCRYPTION_KEY`
- `NEXTAUTH_URL=https://call.robuxio.com`
- `NEXT_PUBLIC_WEBAPP_URL=https://call.robuxio.com`
- `ORGANIZATIONS_ENABLED=true`
- `EMAIL_FROM` and email provider keys (Resend, etc) if you send mail

Optional but recommended:
- `ALLOWED_HOSTNAMES="\"robuxio.com\",\"call.robuxio.com\""`

### Custom Domain

Add the domain in Railway to the web service and point DNS:

- CNAME `call.robuxio.com` -> Railway domain
- Ensure Railway shows the domain as "Verified"

### Deploy Steps

1) Commit and push to `main`
2) Railway builds automatically
3) Verify: `https://call.robuxio.com/` loads the app

## Creating Custom Pages

Routes like `/papo` are user slugs. To make them work:

- Create a user with username `papo`
- Or create an org and publish its profile

## Troubleshooting

### Root path 404

Symptom: `https://call.robuxio.com/` returns 404 and response header shows `X-Cal-Org-Path: /team/call`

Fix:
- Ensure build arg `NEXT_PUBLIC_WEBAPP_URL` is set during build (see Railway section).
- Rebuild by pushing to `main`.

### `/papo` 404

Fix:
- Ensure a user with username `papo` exists in the database.

## License

This project is licensed under AGPLv3. See `LICENSE`.

Upstream source: https://github.com/calcom/cal.com
