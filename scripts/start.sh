#!/bin/sh

echo "=== Cal.com Start Script ==="
echo "PORT environment variable: ${PORT:-not set, defaulting to 3000}"
echo "NEXTAUTH_SECRET set: $([ -n "$NEXTAUTH_SECRET" ] && echo 'YES' || echo 'NO')"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"
echo "NEXT_PUBLIC_WEBAPP_URL: $NEXT_PUBLIC_WEBAPP_URL"

# Replace URL placeholders
scripts/replace-placeholder.sh "$BUILT_NEXT_PUBLIC_WEBAPP_URL" "$NEXT_PUBLIC_WEBAPP_URL"

# Extract DATABASE_HOST from DATABASE_URL if not set
if [ -z "$DATABASE_HOST" ] && [ -n "$DATABASE_URL" ]; then
  DATABASE_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^/]+)/.*|\1|')
  echo "DATABASE_HOST: $DATABASE_HOST"
fi

# Wait for database
if [ -n "$DATABASE_HOST" ]; then
  scripts/wait-for-it.sh ${DATABASE_HOST} -t 60 -- echo "Database is ready"
fi

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy --schema /calcom/packages/prisma/schema.prisma
MIGRATE_EXIT=$?
echo "Migration exit code: $MIGRATE_EXIT"

# Seed app store (non-fatal - continue even if it fails)
echo "Seeding app store (errors are non-fatal)..."
npx ts-node --transpile-only /calcom/scripts/seed-app-store.ts 2>/dev/null || echo "App store seeding had errors (this is OK for initial setup)"

# Start the app
# Run Next.js directly instead of `yarn start` (yarn -> turbo -> yarn -> next):
# the three wrapper processes stayed in memory for nothing. `exec` makes Next
# the container's main process, so it receives Railway's stop signal itself.
# Falls back to `yarn start` if Next cannot be found.
echo "Starting Cal.com..."
cd /calcom/apps/web
NEXT_BIN=$(node -p "require.resolve('next/dist/bin/next')" 2>/dev/null)
if [ -n "$NEXT_BIN" ]; then
  exec node "$NEXT_BIN" start
fi
cd /calcom
yarn start
