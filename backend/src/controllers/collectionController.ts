import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

const invalidateCollectionCache = async () => {
  await redis.del('collections:all');
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'collections:all';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { page: 'asc' },
        { order: 'asc' },
      ],
    });

    const responseData = { collections };
    await redis.setex(cacheKey, 3600, JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, page, order } = req.body;

    const newCollection = await prisma.collection.create({
      data: { name, slug, description, image, page, order: order || 0 },
    });

    await invalidateCollectionCache();

    res.status(201).json({ collection: newCollection });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, image, page, order } = req.body;

    const updated = await prisma.collection.update({
      where: { id },
      data: { name, slug, description, image, page, order },
    });

    await invalidateCollectionCache();

    res.json({ collection: updated });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.collection.delete({ where: { id } });
    await invalidateCollectionCache();

    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};
