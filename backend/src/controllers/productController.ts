import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';
import { Prisma } from '@prisma/client';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const categorySlug = req.query.category as string;
    const isVisible = req.query.isVisible as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // default 50
    const skip = (page - 1) * limit;

    const cacheKey = `products:${categorySlug || 'all'}:${isVisible || 'all'}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const where: Prisma.ProductWhereInput = {};
    
    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } };
    }
    
    if (isVisible !== undefined) {
      where.isVisible = isVisible === 'true';
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        include: {
          categories: { select: { id: true, name: true, slug: true } },
          collections: { select: { id: true, name: true, slug: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where })
    ]);

    const responseData = { products, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { brand, name, description, price, oldPrice, image, categoryIds, collectionIds, concerns, badge, stock, tags } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        brand,
        name,
        description,
        price,
        oldPrice,
        image,
        badge,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        categories: {
          connect: (categoryIds || []).map((id: string) => ({ id }))
        },
        collections: {
          connect: (collectionIds || []).map((id: string) => ({ id }))
        }
      },
      include: {
        categories: true,
        collections: true,
      },
    });

    // Active cache invalidation: Clear all product-related cache keys
    const keys = await redis.keys('products:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
    
    // Also clear categories cache since counts may change
    await redis.del('categories:all');

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};