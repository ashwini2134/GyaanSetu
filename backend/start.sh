#!/bin/sh
echo "=========================================="
echo "Starting backend boot sequence..."
echo "=========================================="

if [ -z "$DATABASE_URL" ]; then
  echo "CRITICAL ERROR: DATABASE_URL environment variable is MISSING!"
  echo "Please go to your Railway dashboard, click on your LMS backend service, go to Variables, and ensure it is linked to PostgreSQL!"
else
  echo "DATABASE_URL is present. Running Prisma DB Push..."
  # Run db push but don't crash if it fails
  npx --yes prisma db push --accept-data-loss || echo "Prisma DB Push failed! Server will still attempt to start."
fi

echo "=========================================="
echo "Starting Node server..."
echo "=========================================="
node dist/index.js
