import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

const invalidateProductCache = async () => {
  const keys = await redis.keys('products:*');
  if (keys.length > 0) await redis.del(keys);
  const catKeys = await redis.keys('categories:*');
  if (catKeys.length > 0) await redis.del(catKeys);
  const collKeys = await redis.keys('collections:*');
  if (collKeys.length > 0) await redis.del(collKeys);
  const catProdKeys = await redis.keys('category:*:products:*');
  if (catProdKeys.length > 0) await redis.del(catProdKeys);
  const collProdKeys = await redis.keys('collection:*:products:*');
  if (collProdKeys.length > 0) await redis.del(collProdKeys);
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const categorySlug = req.query.category as string;
    const collectionSlug = req.query.collection as string;
    const isVisible = req.query.isVisible as string;
    const includeArchived = req.query.includeArchived as string;
    const koreanBeautyStep = req.query.koreanBeautyStep as string;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 50;
    if (limit > 500) limit = 500;
    const skip = (page - 1) * limit;

    const cacheKey = `products:${categorySlug || 'all'}:${collectionSlug || 'all'}:${isVisible || 'all'}:${includeArchived || 'false'}:${koreanBeautyStep || 'all'}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const where: Record<string, any> = {};
    
    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } };
    }

    if (collectionSlug) {
      where.collections = { some: { slug: collectionSlug } };
    }
    
    if (isVisible !== undefined) {
      where.isVisible = isVisible === 'true';
    }

    if (includeArchived !== 'true') {
      where.isArchived = false;
    }

    if (koreanBeautyStep) {
      const stepNum = parseInt(koreanBeautyStep);
      if (!isNaN(stepNum)) {
        where.koreanBeautyStep = stepNum;
      }
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
    const { brand, name, nameAr, description, descriptionAr, price, oldPrice, image, categoryIds, collectionIds, concerns, badge, stock, tags, isVisible, koreanBeautyStep } = req.body;

    // Check for duplicate product name
    const existing = await prisma.product.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Un produit avec ce nom existe déjà' });
    }

    const newProduct = await prisma.product.create({
      data: {
        brand,
        name,
        nameAr: nameAr || null,
        description: description || '',
        descriptionAr: descriptionAr || null,
        price,
        oldPrice,
        image: image || '',
        badge,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        koreanBeautyStep: koreanBeautyStep ? parseInt(koreanBeautyStep) : null,
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
    const id = req.params.id as string;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { brand, name, nameAr, description, descriptionAr, price, oldPrice, image, categoryIds, collectionIds, concerns, badge, stock, tags, isVisible, isArchived, koreanBeautyStep } = req.body;

    // Check for duplicate product name (excluding current product)
    const existing = await prisma.product.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        NOT: { id: productId }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Un produit avec ce nom existe déjà' });
    }

    // Disconnect all existing relations before reconnecting
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        brand,
        name,
        nameAr: nameAr || null,
        description: description || '',
        descriptionAr: descriptionAr || null,
        price,
        oldPrice: oldPrice || null,
        image: image || '',
        badge: badge || null,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        koreanBeautyStep: koreanBeautyStep ? parseInt(koreanBeautyStep) : null,
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const importScrapedProducts = async (req: Request, res: Response) => {
  try {
    const products = req.body.products as any[];
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Body must contain a "products" array' });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const p of products) {
      try {
        const productName = (p.name_fr || p.name || '').trim();
        if (!productName) {
          skipped++;
          continue;
        }

        // Upsert categories
        const categoryNames: string[] = p.categories && p.categories.length > 0
          ? p.categories
          : ['Visage'];

        const categoryRecords = [];
        for (const catName of categoryNames) {
          const slug = slugify(catName);
          const category = await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { name: catName, nameAr: catName, slug },
          });
          categoryRecords.push(category);
        }

        const priceNum = parseFloat(p.price);
        const brand = (p.brand || 'Autre').trim();
        const description = (p.description_fr || p.name_fr || '').trim();
        const imagePath = p.image ? `/products/${p.image}` : '';

        // Check duplicate by name
        const existing = await prisma.product.findFirst({
          where: { name: { equals: productName, mode: 'insensitive' } },
        });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              brand,
              description,
              price: isNaN(priceNum) ? existing.price : priceNum,
              image: imagePath || existing.image,
              stock: p.stock ?? existing.stock,
              isVisible: true,
              categories: {
                set: [],
                connect: categoryRecords.map(c => ({ id: c.id })),
              },
            },
          });
          updated++;
        } else {
          await prisma.product.create({
            data: {
              name: productName,
              brand,
              description,
              price: isNaN(priceNum) ? 0 : priceNum,
              image: imagePath,
              stock: p.stock || 50,
              isVisible: true,
              categories: { connect: categoryRecords.map(c => ({ id: c.id })) },
            },
          });
          created++;
        }
      } catch (innerErr: any) {
        errors.push(`Product "${p.name_fr}": ${innerErr.message}`);
        skipped++;
      }
    }

    await invalidateProductCache();

    res.json({
      summary: { total: products.length, created, updated, skipped },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing scraped products:', error);
    res.status(500).json({ error: 'Failed to import products' });
  }
};