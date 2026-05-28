# VPS Setup & Deploy Guide

## 1. Clone from GitHub
```bash
git clone https://github.com/guissii/fassia-secret.git
cd fassia-secret
```

## 2. Environment
Create `.env` file in the root:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fassia_secret?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
CLERK_SECRET_KEY="your-clerk-key"
```

## 3. Install dependencies
```bash
npm install
```
This will auto-run `prisma generate` via postinstall.

## 4. Database Migration
```bash
npx prisma migrate deploy
```
This applies all pending migrations (non-destructive).

## 5. Seed scraped products (optional)
If you have `prisma/products.json` and `scraped_products/images/`:
```bash
npx tsx prisma/seed-scraped.ts
```
Or use the package script:
```bash
npm run seed:scraped
```

## 6. Build backend
```bash
cd backend
npm install
npm run build
cd ..
```

## 7. Start server
With PM2:
```bash
pm2 start backend/dist/index.js --name fassia-backend
```
Or with systemd, restart your service.

## One-command deploy (after first setup)
From project root:
```bash
bash scripts/vps-deploy.sh
```
