FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package.json if workspaces are used, otherwise copy backend specifically
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy Prisma schema and generate client
WORKDIR /app/backend
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV production

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 5000

CMD ["npm", "start"]