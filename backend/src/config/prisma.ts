import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
// and manage connection pooling better to prevent PostgreSQL connection exhaustion.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  // Log queries only in development for debugging N+1, but off in prod
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;