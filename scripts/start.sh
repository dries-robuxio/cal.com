#!/bin/sh
set -x

# Debug: Print environment variables (Railway injection check)
echo "=== Railway Environment Check ==="
echo "NEXTAUTH_SECRET is set: $([ -n "$NEXTAUTH_SECRET" ] && echo 'YES' || echo 'NO')"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"
echo "NEXT_PUBLIC_WEBAPP_URL: $NEXT_PUBLIC_WEBAPP_URL"
echo "================================="

# Replace the statically built BUILT_NEXT_PUBLIC_WEBAPP_URL with run-time NEXT_PUBLIC_WEBAPP_URL
# NOTE: if these values are the same, this will be skipped.
scripts/replace-placeholder.sh "$BUILT_NEXT_PUBLIC_WEBAPP_URL" "$NEXT_PUBLIC_WEBAPP_URL"

# Extract DATABASE_HOST from DATABASE_URL if not set (for Railway compatibility)
if [ -z "$DATABASE_HOST" ] && [ -n "$DATABASE_URL" ]; then
  # Extract host:port from postgresql://user:pass@host:port/db
  DATABASE_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^/]+)/.*|\1|')
  echo "Extracted DATABASE_HOST: $DATABASE_HOST"
fi

# Wait for database if DATABASE_HOST is available
if [ -n "$DATABASE_HOST" ]; then
  scripts/wait-for-it.sh ${DATABASE_HOST} -- echo "database is up"
else
  echo "DATABASE_HOST not set, skipping wait-for-it (assuming database is ready)"
fi

npx prisma migrate deploy --schema /calcom/packages/prisma/schema.prisma
npx ts-node --transpile-only /calcom/scripts/seed-app-store.ts
yarn start
