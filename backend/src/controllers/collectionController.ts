import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

const invalidateCollectionCache = async () => {
  const keys = await redis.keys('collections:*');
  if (keys.length > 0) await redis.del(keys);
  const productKeys = await redis.keys('collection:*:products:*');
  if (productKeys.length > 0) await redis.del(productKeys);
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const page = req.query.page as string;
    const cacheKey = page ? `collections:page:${page}` : 'collections:all';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const where = page ? { page } : {};
    const collections = await prisma.collection.findMany({
      where,
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

export const getCollectionProducts = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 24;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const cacheKey = `collection:${slug}:products:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          collections: { some: { slug: slugStr } },
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
          collections: { some: { slug: slugStr } },
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
    console.error('Error fetching collection products:', error);
    res.status(500).json({ error: 'Failed to fetch collection products' });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, page, order } = req.body;

    const newCollection = await prisma.collection.create({
      data: { name, slug, description, image, page: page || 'general', order: order || 0 },
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

// Predefined subcategories from client menu (Collections)
// Structure finale: Catégorie → Collections (sous-sections)
// Tous les sous-éléments du menu mobile sont mappés ici.
const MENU_SUBCATEGORIES: Record<string, string[]> = {
  'dermo-corner': ['La Roche-Posay', 'Vichy', 'CeraVe', 'Bioderma', 'SVR', 'Eucerin'],
  'promotions': ['Offres du moment', 'Bons plans', 'Dernières promotions'],
  'k-beauty': ['Nettoyants', 'Sérums', 'Crème hydratante', 'Masques', 'SPF'],
  'corps': ['Corps & bain', 'Hydratation', 'Gommage', 'Rasage & épilation', 'Minceur'],
  'visage': [
    'Solaire: Protection solaire', 'Solaire: Auto-bronzant', 'Solaire: Soin après-soleil',
    'Type: Nettoyant visage', 'Type: Sérum', 'Type: Crème de jour', 'Type: Crème de nuit', 'Type: Contour des yeux', 'Type: Eau micellaire', 'Type: Masque visage',
    'Besoins: Anti-imperfections', 'Besoins: Anti-âge', 'Besoins: Hydratant & nourrissant', 'Besoins: Anti-taches', 'Besoins: Anti-rougeurs', 'Besoins: Éclat & anti-fatigue', 'Besoins: Peaux sensibles',
  ],
  'cheveux': ['Shampoing', 'Après-shampoing', 'Masque cheveux', 'Soins réparateurs', 'Huiles & sérums'],
  'hygiene-dentaire': ['Dentifrices', 'Brosses à dents', 'Bains de bouche', 'Blanchiment'],
  'maquillage': ['Teint', 'Yeux', 'Lèvres', 'Démaquillant', 'Accessoires maquillage'],
  'hygiene-intimite': ['Toilette Intime', 'Serviettes Hygiéniques', 'Tampons', 'Lubrifiants'],
  'hygiene': ['Gel hydroalcoolique', 'Déodorants', 'Soin intime', 'Protections'],
  'accessoires': ['Accessoires visage', 'Accessoires cheveux', 'Trousses', 'Brosses', 'Éponges'],
  'minceur': ['Brûle-graisses', 'Draineurs', 'Collagène', 'Sport & récupération'],
  'sport': ['Protéines', 'Énergie', 'Hydratation', 'Récupération'],
  'maman-bebe': ['Bébé', 'Maman', 'Solaire bébé', 'Change & toilette', 'Accessoires'],
  'hommes': ['Soins visage homme', 'Soins corps homme', 'Déodorants', 'Rasage', 'Barbe'],
  'sante': ['Auto-surveillance', 'Premiers secours', 'Orthopédie', 'Bien-être'],
  'complements-alimentaires': ['Vitamines & Minéraux', 'Collagène', 'Oméga 3', 'Détox & Drainage'],
  'premium-hair-care': ['Shampoing premium', 'Masque premium', 'Huiles & sérums', 'Anti-chute'],
  'preoccupations': ['Acné & imperfections', 'Cernes', 'Taches', 'Rosacée & rougeurs', 'Peau sèche', 'Anti-âge', 'Chute de cheveux', 'Immunité'],
};

// Génère un slug unique en préfixant avec la page pour éviter les doublons
// Ex: "visage" + "Sérum" → "visage-serum"
function generateSlug(page: string, name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${page}-${base}`;
}

export const seedCollections = async (req: Request, res: Response) => {
  try {
    const created: any[] = [];
    const skipped: any[] = [];

    for (const [page, items] of Object.entries(MENU_SUBCATEGORIES)) {
      for (let i = 0; i < items.length; i++) {
        const name = items[i];
        const slug = generateSlug(page, name);
        try {
          const existing = await prisma.collection.findUnique({ where: { slug } });
          if (existing) {
            skipped.push({ name, slug, reason: 'Already exists' });
            continue;
          }
          const coll = await prisma.collection.create({
            data: {
              name,
              slug,
              description: `Collection pour ${page}`,
              page,
              order: i,
            },
          });
          created.push(coll);
        } catch (err: any) {
          skipped.push({ name, slug, reason: err.message });
        }
      }
    }

    await invalidateCollectionCache();

    res.json({
      success: true,
      message: `${created.length} collections créées, ${skipped.length} ignorées`,
      created,
      skipped,
    });
  } catch (error: any) {
    console.error('Error seeding collections:', error);
    res.status(500).json({ error: 'Failed to seed collections' });
  }
};
