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
const MENU_SUBCATEGORIES: Record<string, string[]> = {
  'corps': ['Déodorants', 'Gels Douche', 'Gommage & Exfoliants', 'Hydratation & Nutrition', 'Parfums Femmes', 'Rasage & Épilation', 'Savons', 'Soins des Mains & Pieds', 'Soins des Ongles', 'Soins Minceur & Anti-Cellulite', 'Accessoires de Bain'],
  'visage': ['Crèmes & Soins Hydratants', 'Nettoyants & Démaquillants', 'Protections Solaires', 'Soins des Lèvres', 'Soins Anti-taches & Éclaircissants', 'Soins Anti-âge', 'Soins Anti-Imperfections', 'Soins des Yeux', 'Masques & Gommages'],
  'cheveux': ['Shampoings', 'Après-shampoings', 'Masques & Soins Réparateurs', 'Colorations & Entretien', 'Produits & Accessoires de Coiffure'],
  'hygiene-dentaire': ['Brosses à dents', 'Dentifrices', 'Bains De Bouche & Haleine', 'Soins dentaires'],
  'maquillage': ['Nettoyants & Démaquillants', 'Teint', 'Yeux', 'Lèvres', 'Accessoires Maquillage', 'Trousses de Maquillage'],
  'hygiene-intimite': ['Toilette Intime', 'Serviettes Hygiéniques', 'Tampons', 'Lubrifiants'],
  'hygiene': ['Gel hydroalcoolique', 'Déodorants', 'Soin intime', 'Protections'],
  'sante': ['Auto-Surveillance', 'Compléments alimentaires', 'Premiers Secours', 'Orthopédie & Soutien'],
  'hommes': ['Déodorants', 'Soins visage homme', 'Soins corps homme', 'Rasage', 'Barbe', 'Parfums Homme'],
  'preoccupations': ['Acne & Imperfections', 'Cernes', 'Taches', 'Rosacee & Rougeurs', 'Peau seche', 'Anti-age', 'Chute de cheveux', 'Immunite'],
  'complements-alimentaires': ['Cheveux', 'Ongles', 'Immunité', 'Minceur', 'Énergie', 'Sommeil', 'Vitamines & Mineraux', 'Collagene', 'Omega 3', 'Detox & Drainage'],
  'k-beauty': ['Nettoyants', 'Essence', 'Sérum', 'Masque', 'Crème hydratante', 'SPF'],
  'dermo-corner': ['La Roche-Posay', 'Vichy', 'CeraVe', 'Bioderma', 'SVR', 'Eucerin'],
  'accessoires': ['Accessoires visage', 'Accessoires cheveux', 'Trousses', 'Brosses', 'Eponges'],
  'minceur': ['Brule-graisses', 'Draineurs', 'Collagene', 'Sport & recuperation'],
  'sport': ['Proteines', 'Energie', 'Hydratation', 'Recuperation'],
  'maman-bebe': ['Bebe', 'Maman', 'Solaire bebe', 'Change & toilette', 'Accessoires'],
  'premium-hair-care': ['Shampoing premium', 'Masque premium', 'Huiles & serums', 'Anti-chute'],
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const seedCollections = async (req: Request, res: Response) => {
  try {
    const created: any[] = [];
    const skipped: any[] = [];

    for (const [page, items] of Object.entries(MENU_SUBCATEGORIES)) {
      for (let i = 0; i < items.length; i++) {
        const name = items[i];
        const slug = generateSlug(name);
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
