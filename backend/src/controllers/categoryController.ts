import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

const invalidateCategoryCache = async () => {
  const keys = await redis.keys('categories:*');
  if (keys.length > 0) await redis.del(keys);
  const productKeys = await redis.keys('category:*:products:*');
  if (productKeys.length > 0) await redis.del(productKeys);
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const page = req.query.page as string;
    const cacheKey = page ? `categories:page:${page}` : 'categories:all';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const where = page ? { page } : {};
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { page: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const responseData = { categories };
    await redis.setex(cacheKey, 3600, JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 24;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const cacheKey = `category:${slug}:products:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          categories: { some: { slug: slugStr } },
          isVisible: true,
          isArchived: false,
        },
        include: {
          categories: { select: { id: true, name: true, slug: true } },
          collections: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count({
        where: {
          categories: { some: { slug: slugStr } },
          isVisible: true,
          isArchived: false,
        },
      }),
    ]);

    const responseData = {
      products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
    await redis.setex(cacheKey, 300, JSON.stringify(responseData));
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({ error: 'Failed to fetch category products' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, nameAr, slug, description, image, page, order } = req.body;

    const newCategory = await prisma.category.create({
      data: { name, nameAr, slug, description, image, page: page || 'general', order: order || 0 },
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
    const id = req.params.id as string;
    const { name, nameAr, slug, description, image, page, order } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: { name, nameAr, slug, description, image, page, order },
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
    const id = req.params.id as string;
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

// Predefined main categories from client menu
const DEFAULT_CATEGORIES = [
  { name: 'Corps', nameAr: 'الجسم', slug: 'corps' },
  { name: 'Visage', nameAr: 'الوجه', slug: 'visage' },
  { name: 'Cheveux', nameAr: 'الشعر', slug: 'cheveux' },
  { name: 'Hygiène Dentaire', nameAr: 'العناية بالأسنان', slug: 'hygiene-dentaire' },
  { name: 'Maquillage', nameAr: 'المكياج', slug: 'maquillage' },
  { name: 'Hygiène & Intimité', nameAr: 'النظافة والحماية', slug: 'hygiene-intimite' },
  { name: 'Santé', nameAr: 'الصحة', slug: 'sante' },
  { name: 'Hommes', nameAr: 'الرجال', slug: 'hommes' },
  { name: 'Préoccupations', nameAr: 'المشاكل', slug: 'preoccupations' },
  { name: 'Compléments Alimentaires', nameAr: 'المكملات الغذائية', slug: 'complements-alimentaires' },
  { name: 'K-Beauty', nameAr: 'كي بيوتي', slug: 'k-beauty' },
  { name: 'Dermo-Corner', nameAr: 'درمو كورنر', slug: 'dermo-corner' },
  { name: 'Accessoires', nameAr: 'إكسسوارات', slug: 'accessoires' },
  { name: 'Minceur', nameAr: 'التخسيس', slug: 'minceur' },
  { name: 'Sport', nameAr: 'رياضة', slug: 'sport' },
  { name: 'Hygiène', nameAr: 'النظافة', slug: 'hygiene' },
  { name: 'Maman & Bébé', nameAr: 'الأم والطفل', slug: 'maman-bebe' },
  { name: 'Premium Hair Care', nameAr: 'العناية الفاخرة بالشعر', slug: 'premium-hair-care' },
  { name: 'Promotions', nameAr: 'تخفيضات', slug: 'promotions' },
];

export const seedCategories = async (req: Request, res: Response) => {
  try {
    const created: any[] = [];
    const skipped: any[] = [];

    for (const cat of DEFAULT_CATEGORIES) {
      try {
        const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
        if (existing) {
          skipped.push({ name: cat.name, slug: cat.slug, reason: 'Already exists' });
          continue;
        }
        const newCat = await prisma.category.create({
          data: {
            name: cat.name,
            nameAr: cat.nameAr,
            slug: cat.slug,
            description: `Catégorie ${cat.name}`,
            page: 'general',
            order: 0,
          },
        });
        created.push(newCat);
      } catch (err: any) {
        skipped.push({ name: cat.name, slug: cat.slug, reason: err.message });
      }
    }

    await invalidateCategoryCache();

    res.json({
      success: true,
      message: `${created.length} catégories créées, ${skipped.length} ignorées`,
      created,
      skipped,
    });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    res.status(500).json({ error: 'Failed to seed categories' });
  }
};