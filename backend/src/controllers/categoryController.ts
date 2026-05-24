import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'categories:all';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const responseData = { categories };
    await redis.setex(cacheKey, 3600, JSON.stringify(responseData)); // Cache for 1 hour

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, nameAr, slug } = req.body;

    const newCategory = await prisma.category.create({
      data: {
        name,
        nameAr,
        slug,
      },
    });

    // Invalidate Redis cache
    await redis.del('categories:all');

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};