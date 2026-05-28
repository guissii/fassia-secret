# VPS Deployment Script for Fassia Secret Backend (PowerShell)
# Run this on the VPS after pulling from GitHub

$ErrorActionPreference = "Stop"

Write-Host "=== Fassia Secret VPS Deploy ===" -ForegroundColor Cyan

# 1. Install dependencies
Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
npm ci

# 2. Generate Prisma Client
Write-Host "[2/5] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 3. Deploy migrations
Write-Host "[3/5] Deploying database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy

# 4. Build the backend
Write-Host "[4/5] Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

# 5. Restart service
Write-Host "[5/5] Restarting backend..." -ForegroundColor Yellow
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 restart fassia-backend
    if ($LASTEXITCODE -ne 0) {
        pm2 start backend/dist/index.js --name fassia-backend
    }
} else {
    Write-Host "Please restart your backend service manually." -ForegroundColor Red
}

Write-Host "=== Deploy complete ===" -ForegroundColor Green
