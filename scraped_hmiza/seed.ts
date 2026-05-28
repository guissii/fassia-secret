import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync('./scraped_hmiza/products.json', 'utf-8');
  const products = JSON.parse(raw);

  // Catégories et collections à créer
  const categories = ['K-Beauty', 'Soins', 'Nettoyants', 'Sérums', 'Crèmes'];
  const collections = ['Korean Beauty'];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: cat,
        nameAr: cat,
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: col,
        slug: col.toLowerCase().replace(/\s+/g, '-'),
        page: 'korean-beauty',
        order: 1,
      },
    });
  }

  for (const p of products) {
    // Évite les doublons
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (existing) {
      console.log(`Skip duplicate: ${p.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        brand: p.brand,
        name: p.name,
        nameAr: p.nameAr || null,
        description: p.descriptionAr || p.description || '',
        descriptionAr: p.descriptionAr || null,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.image,
        stock: p.stock || 10,
        badge: p.badge,
        isVisible: p.isVisible,
        isArchived: p.isArchived,
        salesCount: p.salesCount || 0,
        tags: p.tags || [],
        concerns: p.concerns || [],
        categories: {
          connect: p.categories.map((c: string) => ({ slug: c.toLowerCase().replace(/\s+/g, '-') })),
        },
        collections: {
          connect: p.collections.map((c: string) => ({ slug: c.toLowerCase().replace(/\s+/g, '-') })),
        },
      },
    });
    console.log(`Created: ${p.name}`);
  }

  console.log(`\n✅ ${products.length} produits traités`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
