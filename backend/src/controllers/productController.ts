import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

const invalidateProductCache = async () => {
  const keys = await redis.keys('products:*');
  if (keys.length > 0) await redis.del(keys);
  await redis.del('categories:all');
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const categorySlug = req.query.category as string;
    const isVisible = req.query.isVisible as string;
    const includeArchived = req.query.includeArchived as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const cacheKey = `products:${categorySlug || 'all'}:${isVisible || 'all'}:${includeArchived || 'false'}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const where: Record<string, any> = {};
    
    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } };
    }
    
    if (isVisible !== undefined) {
      where.isVisible = isVisible === 'true';
    }

    if (includeArchived !== 'true') {
      where.isArchived = false;
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
    const { brand, name, description, price, oldPrice, image, categoryIds, collectionIds, concerns, badge, stock, tags, isVisible } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        brand,
        name,
        description: description || '',
        price,
        oldPrice,
        image: image || '',
        badge,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        isVisible: isVisible !== false,
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

    await invalidateProductCache();

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { brand, name, description, price, oldPrice, image, categoryIds, collectionIds, concerns, badge, stock, tags, isVisible, isArchived } = req.body;

    // Disconnect all existing relations before reconnecting
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        brand,
        name,
        description: description || '',
        price,
        oldPrice: oldPrice || null,
        image: image || '',
        badge: badge || null,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        isVisible: isVisible !== false,
        isArchived: isArchived === true,
        categories: {
          set: [], // Disconnect all
          connect: (categoryIds || []).map((id: string) => ({ id }))
        },
        collections: {
          set: [], // Disconnect all
          connect: (collectionIds || []).map((id: string) => ({ id }))
        }
      },
      include: {
        categories: true,
        collections: true,
      },
    });

    await invalidateProductCache();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Delete order items referencing this product first
    await prisma.orderItem.deleteMany({ where: { productId } });

    await prisma.product.delete({ where: { id: productId } });

    await invalidateProductCache();

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const toggleVisibility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isVisible: !product.isVisible },
    });

    await invalidateProductCache();

    res.json({ product: updated });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
};

export const toggleArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isArchived: !product.isArchived },
    });

    await invalidateProductCache();

    res.json({ product: updated });
  } catch (error) {
    console.error('Error toggling archive:', error);
    res.status(500).json({ error: 'Failed to toggle archive' });
  }
};