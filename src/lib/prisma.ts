import { PrismaClient } from '@prisma/client';

const createRecursiveProxy = (): any => {
  return new Proxy(
    () => Promise.resolve([]),
    {
      get: (target, prop) => {
        if (prop === 'then') return undefined;
        return createRecursiveProxy();
      }
    }
  );
};

const prismaClientSingleton = () => {
  try {
    return new PrismaClient();
  } catch (error) {
    console.warn("Failed to initialize PrismaClient. Using dummy proxy for build.");
    return createRecursiveProxy() as PrismaClient;
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
