import prisma from './prisma';

export async function getPageCollections(page: string, takeProducts: number = 4) {
  return await prisma.collection.findMany({
    where: { page },
    include: {
      products: {
        where: { isVisible: true, isArchived: false },
        take: takeProducts,
      }
    },
    orderBy: { order: 'asc' }
  });
}
