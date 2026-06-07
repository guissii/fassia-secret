# Fassia Secret

Boutique parapharmacie en ligne (Maroc) — Next.js 15 + Express + PostgreSQL + Redis.

## Prérequis

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- PM2 (production)

## Setup local

### 1. Cloner le repo

```bash
git clone https://github.com/guissii/fassia-secret.git
cd fassia-secret
```

### 2. Variables d'environnement

Créer `.env` à la racine :

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fassia_secret?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="changez-ce-secret-64-caracteres-ici"
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

Créer `backend/.env` :

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fassia_secret?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="changez-ce-secret-64-caracteres-ici"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### 3. Installer les dépendances

```bash
npm install
cd backend && npm install && cd ..
```

### 4. Base de données

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 5. Build & lancer

```bash
# Terminal 1 — Backend
cd backend
npm run build
npm start

# Terminal 2 — Frontend
npm run dev
```

Le frontend est sur `http://localhost:3000` et le backend sur `http://localhost:5000`.

## Build production

```bash
npm run build
cd backend && npm run build && cd ..
```

## Déploiement VPS (PM2)

```bash
# Sur le VPS
git clone https://github.com/guissii/fassia-secret.git
cd fassia-secret
npm install
cd backend && npm install && cd ..

# Créer .env et backend/.env avec les vraies valeurs
npx prisma generate
npx prisma migrate deploy

# Build
npm run build
cd backend && npm run build && cd ..

# Lancer avec PM2
pm2 start backend/dist/index.js --name fassia-backend
pm2 start "npm start" --name fassia-frontend
pm2 save
```

## Structure

```
fassia-secret/
├── app/                    # Pages Next.js (App Router)
├── src/
│   ├── components/         # Composants React
│   ├── lib/                # Helpers & Prisma client
│   └── ...
├── backend/
│   ├── src/
│   │   ├── controllers/    # Logique métier
│   │   ├── routes/         # Routes API
│   │   ├── middlewares/    # Auth, validation
│   │   └── config/         # Prisma, Redis
│   └── dist/               # Build compilé
├── prisma/
│   ├── schema.prisma       # Schéma DB
│   └── seed.ts             # Données initiales
└── public/                 # Images, favicon
```

## Technologies

- **Frontend** : Next.js 15, React 19, TypeScript, CSS Modules
- **Backend** : Express 5, TypeScript, Prisma ORM
- **Base de données** : PostgreSQL
- **Cache** : Redis (via ioredis)
- **Auth** : JWT (jsonwebtoken), bcryptjs
- **Déploiement** : PM2, Nginx

## Scripts utiles

| Commande | Action |
|----------|--------|
| `npm run dev` | Frontend en dev mode |
| `npm run build` | Build production frontend |
| `cd backend && npm run build` | Build production backend |
| `cd backend && npm start` | Lancer backend compilé |
| `npx prisma studio` | UI base de données |
| `npx prisma migrate deploy` | Appliquer migrations |

## Licence

Privé — Fassia Secret.
