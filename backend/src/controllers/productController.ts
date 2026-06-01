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
    const isEssential = req.query.isEssential as string;
    const includeArchived = req.query.includeArchived as string;
    const koreanBeautyStep = req.query.koreanBeautyStep as string;
    const makeupStep = req.query.makeupStep as string;
    const random = req.query.random as string;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 50;
    if (limit > 500) limit = 500;
    const skip = (page - 1) * limit;

    const cacheKey = `products:${categorySlug || 'all'}:${collectionSlug || 'all'}:${isVisible || 'all'}:${isEssential || 'all'}:${includeArchived || 'false'}:${koreanBeautyStep || 'all'}:${makeupStep || 'all'}:${random || 'false'}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const where: Record<string, any> = {};
    
    if (categorySlug) {
      where.categories = { some: { slug: { equals: categorySlug, mode: 'insensitive' } } };
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

    if (makeupStep) {
      const stepNum = parseInt(makeupStep);
      if (!isNaN(stepNum)) {
        where.makeupStep = stepNum;
      }
    }

    if (isEssential !== undefined && isEssential !== '') {
      where.isEssential = isEssential === 'true';
    }

    const orderBy = random === 'true' ? undefined : { createdAt: 'desc' as const };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        include: {
          categories: { select: { id: true, name: true, slug: true } },
          collections: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
      }),
      prisma.product.count({ where })
    ]);

    // Random shuffle if requested
    if (random === 'true') {
      for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
      }
    }

    // Map categories array to category string for frontend compatibility
    const mappedProducts = products.map((p: any) => ({
      ...p,
      category: p.categories?.[0]?.name || 'Visage',
      categorySlug: p.categories?.[0]?.slug || 'visage',
    }));

    const responseData = { products: mappedProducts, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    
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
    const { brand, name, nameAr, description, descriptionAr, price, oldPrice, promoPrice, wholesalePrice, bulkWholesalePrice, image, categoryIds, collectionIds, concerns, badge, stock, tags, isVisible, koreanBeautyStep, supplementFocus, makeupStep } = req.body;

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
        promoPrice: promoPrice || null,
        wholesalePrice: wholesalePrice || null,
        bulkWholesalePrice: bulkWholesalePrice || null,
        image: image || '',
        badge,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        koreanBeautyStep: koreanBeautyStep ? parseInt(koreanBeautyStep) : null,
        supplementFocus: supplementFocus || null,
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

    const { brand, name, nameAr, description, descriptionAr, price, oldPrice, promoPrice, wholesalePrice, bulkWholesalePrice, image, categoryIds, collectionIds, concerns, badge, stock, tags, isVisible, isArchived, koreanBeautyStep, supplementFocus, makeupStep } = req.body;

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
        promoPrice: promoPrice || null,
        wholesalePrice: wholesalePrice || null,
        bulkWholesalePrice: bulkWholesalePrice || null,
        image: image || '',
        badge: badge || null,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        koreanBeautyStep: koreanBeautyStep ? parseInt(koreanBeautyStep) : null,
        supplementFocus: supplementFocus || null,
        makeupStep: makeupStep ? parseInt(makeupStep) : null,
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

export const toggleEssential = async (req: Request, res: Response) => {
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

    const { isEssential } = req.body;

    // Check limit if adding to essentials
    if (isEssential === true && !product.isEssential) {
      const essentialCount = await prisma.product.count({ where: { isEssential: true } });
      if (essentialCount >= 10) {
        return res.status(400).json({ error: 'Maximum 10 produits essentiels atteint' });
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isEssential: isEssential === true },
    });

    await invalidateProductCache();

    res.json({ product: updated });
  } catch (error) {
    console.error('Error toggling essential:', error);
    res.status(500).json({ error: 'Failed to toggle essential' });
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

        // Check duplicate by name (case-insensitive via toLowerCase)
        const existing = await prisma.product.findFirst({
          where: { name: { contains: productName, mode: 'insensitive' } },
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
      } catch (innerErr) {
        const errMsg = innerErr instanceof Error ? innerErr.message : String(innerErr);
        errors.push(`Product "${p.name_fr}": ${errMsg}`);
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

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'products:promotions';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const products = await prisma.product.findMany({
      where: {
        isVisible: true,
        isArchived: false,
        oldPrice: { not: null },
      },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        collections: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter products with > 20% discount
    const promoProducts = products
      .map((p: any) => {
        const discount = p.oldPrice && p.price > 0
          ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
          : 0;
        return { ...p, discount };
      })
      .filter((p: any) => p.discount > 20);

    await redis.setex(cacheKey, 300, JSON.stringify({ products: promoProducts }));
    res.json({ products: promoProducts });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').trim();
    const categorySlug = req.query.category as string;
    const collectionSlug = req.query.collection as string;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    if (!query || query.length < 1) {
      return res.json({ products: [], pagination: { total: 0, page, limit, totalPages: 0 } });
    }

    const cacheKey = `search:${query}:${categorySlug || 'all'}:${collectionSlug || 'all'}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Clean query: keep letters (incl. accents), digits, spaces
    const cleanedQuery = query
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = cleanedQuery.split(' ').filter(Boolean);
    const likePattern = `%${cleanedQuery}%`;
    const firstWordPattern = `%${words[0] || cleanedQuery}%`;

    // Build OR-based tsquery for broader results (souhaitable/générale)
    // "crème hydratante" → "crème | hydratante" (any word matches)
    const orQuery = words.join(' | ');
    const orSafe = orQuery || cleanedQuery || query;

    // Short queries (1-2 chars): PostgreSQL FTS doesn't tokenize short words well.
    // Use ILIKE only for instant prefix matching.
    const isShortQuery = cleanedQuery.length <= 2;

    const rawResults: any[] = isShortQuery
      ? await prisma.$queryRaw`
          SELECT id,
            CASE WHEN unaccent(name) ILIKE unaccent(${likePattern}) THEN 1000 ELSE 0 END
            + CASE WHEN unaccent(brand) ILIKE unaccent(${likePattern}) THEN 800 ELSE 0 END
            + CASE WHEN unaccent(description) ILIKE unaccent(${likePattern}) THEN 500 ELSE 0 END
            + CASE WHEN array_to_string(tags, ' ') ILIKE ${likePattern} THEN 300 ELSE 0 END
            + CASE WHEN array_to_string(concerns, ' ') ILIKE ${likePattern} THEN 300 ELSE 0 END
            as score
          FROM "Product"
          WHERE (
            unaccent(name) ILIKE unaccent(${likePattern})
            OR unaccent(brand) ILIKE unaccent(${likePattern})
            OR unaccent(description) ILIKE unaccent(${likePattern})
            OR array_to_string(tags, ' ') ILIKE ${likePattern}
            OR array_to_string(concerns, ' ') ILIKE ${likePattern}
          )
            AND "isVisible" = true
            AND "isArchived" = false
          ORDER BY score DESC
          LIMIT ${limit} OFFSET ${skip}
        `
      : await prisma.$queryRaw`
          SELECT id,
            COALESCE(ts_rank_cd("searchVector", to_tsquery('french', unaccent(${orSafe})), 1), 0) * 100
            + COALESCE(ts_rank_cd("searchVector", plainto_tsquery('french', unaccent(${query})), 1), 0) * 50
            + CASE WHEN unaccent(name) ILIKE unaccent(${likePattern}) THEN 1000 ELSE 0 END
            + CASE WHEN unaccent(name) ILIKE unaccent(${firstWordPattern}) THEN 500 ELSE 0 END
            + CASE WHEN unaccent(brand) ILIKE unaccent(${likePattern}) THEN 300 ELSE 0 END
            + CASE WHEN unaccent(brand) ILIKE unaccent(${firstWordPattern}) THEN 150 ELSE 0 END
            + CASE WHEN unaccent(description) ILIKE unaccent(${likePattern}) THEN 100 ELSE 0 END
            + CASE WHEN unaccent(description) ILIKE unaccent(${firstWordPattern}) THEN 50 ELSE 0 END
            + CASE WHEN array_to_string(tags, ' ') ILIKE ${likePattern} THEN 80 ELSE 0 END
            + CASE WHEN array_to_string(concerns, ' ') ILIKE ${likePattern} THEN 80 ELSE 0 END
            as score
          FROM "Product"
          WHERE (
            "searchVector" @@ to_tsquery('french', unaccent(${orSafe}))
            OR "searchVector" @@ plainto_tsquery('french', unaccent(${query}))
            OR unaccent(name) ILIKE unaccent(${likePattern})
            OR unaccent(brand) ILIKE unaccent(${likePattern})
            OR unaccent(description) ILIKE unaccent(${likePattern})
            OR array_to_string(tags, ' ') ILIKE ${likePattern}
            OR array_to_string(concerns, ' ') ILIKE ${likePattern}
          )
            AND "isVisible" = true
            AND "isArchived" = false
          ORDER BY score DESC
          LIMIT ${limit} OFFSET ${skip}
        `;

    const ids = rawResults.map((r: any) => r.id);

    const totalResult: any[] = isShortQuery
      ? await prisma.$queryRaw`
          SELECT COUNT(*)::int as count
          FROM "Product"
          WHERE (
            unaccent(name) ILIKE unaccent(${likePattern})
            OR unaccent(brand) ILIKE unaccent(${likePattern})
            OR unaccent(description) ILIKE unaccent(${likePattern})
            OR array_to_string(tags, ' ') ILIKE ${likePattern}
            OR array_to_string(concerns, ' ') ILIKE ${likePattern}
          )
            AND "isVisible" = true
            AND "isArchived" = false
        `
      : await prisma.$queryRaw`
          SELECT COUNT(*)::int as count
          FROM "Product"
          WHERE (
            "searchVector" @@ to_tsquery('french', unaccent(${orSafe}))
            OR "searchVector" @@ plainto_tsquery('french', unaccent(${query}))
            OR unaccent(name) ILIKE unaccent(${likePattern})
            OR unaccent(brand) ILIKE unaccent(${likePattern})
            OR unaccent(description) ILIKE unaccent(${likePattern})
            OR array_to_string(tags, ' ') ILIKE ${likePattern}
            OR array_to_string(concerns, ' ') ILIKE ${likePattern}
          )
            AND "isVisible" = true
            AND "isArchived" = false
        `;
    const total = totalResult[0]?.count || 0;

    if (ids.length === 0) {
      return res.json({ products: [], pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        collections: { select: { id: true, name: true, slug: true } },
      },
    });

    // Sort by computed score from raw query
    const scoreMap = new Map(rawResults.map((r: any) => [r.id, Number(r.score) || 0]));
    products.sort((a: any, b: any) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));

    const mappedProducts = products.map((p: any) => ({
      ...p,
      category: p.categories?.[0]?.name || 'Visage',
      categorySlug: p.categories?.[0]?.slug || 'visage',
    }));

    const responseData = {
      products: mappedProducts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };

    await redis.setex(cacheKey, 60, JSON.stringify(responseData));
    res.json(responseData);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};