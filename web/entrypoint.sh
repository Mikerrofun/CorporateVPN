#!/bin/sh
set -e

echo "▶ Syncing Prisma schema..."
node_modules/.bin/prisma db push --accept-data-loss

echo "▶ Running seed (idempotent)..."
node_modules/.bin/tsx prisma/seed.ts || true

echo "▶ Starting Next.js..."
exec node server.js
