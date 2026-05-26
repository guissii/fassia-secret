import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

const invalidateCategoryCache = async () => {
  await redis.del('categories:all');
};

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
    await redis.setex(cacheKey, 3600, JSON.stringify(responseData));

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
      data: { name, nameAr, slug },
    });

    await invalidateCategoryCache();

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameAr, slug } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: { name, nameAr, slug },
    });

    await invalidateCategoryCache();

    res.json({ category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { migrateToId } = req.body;

    // If products need to be migrated
    if (migrateToId) {
      // Get all products in this category
      const products = await prisma.product.findMany({
        where: { categories: { some: { id } } },
        select: { id: true }
      });

      // Connect products to the new category
      for (const product of products) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            categories: {
              disconnect: { id },
              connect: { id: migrateToId }
            }
          }
        });
      }
    }

    await prisma.category.delete({ where: { id } });
    await invalidateCategoryCache();

    // Also invalidate product cache since category assignments changed
    const productKeys = await redis.keys('products:*');
    if (productKeys.length > 0) await redis.del(productKeys);

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};