#!/bin/bash
# VPS Deployment Script for Fassia Secret Backend
# Run this on the VPS after pulling from GitHub

set -e

echo "=== Fassia Secret VPS Deploy ==="

# 1. Install dependencies
echo "[1/5] Installing dependencies..."
npm ci

# 2. Generate Prisma Client
echo "[2/5] Generating Prisma Client..."
npx prisma generate

# 3. Deploy migrations (non-destructive for existing data)
echo "[3/5] Deploying database migrations..."
npx prisma migrate deploy

# 4. Build the backend
echo "[4/5] Building backend..."
cd backend
npm run build

# 5. Restart service (adjust service name to your PM2/systemd config)
echo "[5/5] Restarting backend..."
if command -v pm2 &> /dev/null; then
  pm2 restart fassia-backend || pm2 start dist/index.js --name fassia-backend
elif systemctl is-active --quiet fassia-backend; then
  sudo systemctl restart fassia-backend
else
  echo "Please restart your backend service manually."
fi

echo "=== Deploy complete ==="
