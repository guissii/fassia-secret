import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  try {
    return new PrismaClient();
  } catch (error) {
    console.warn("Failed to initialize PrismaClient. Using dummy proxy for build.");
    return new Proxy({}, {
      get: () => () => Promise.resolve([])
    }) as unknown as PrismaClient;
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
