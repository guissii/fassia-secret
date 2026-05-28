import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Starting scraped products seeding...');

  // ── Paths ──
  const productsPath = path.join(process.cwd(), 'prisma', 'products.json');
  const scrapedImagesDir = path.join(process.cwd(), 'scraped_products', 'images');
  const publicProductsDir = path.join(process.cwd(), 'public', 'products');

  if (!fs.existsSync(productsPath)) {
    console.error(`Error: products.json not found at ${productsPath}`);
    process.exit(1);
  }

  // Ensure public/products exists
  if (!fs.existsSync(publicProductsDir)) {
    fs.mkdirSync(publicProductsDir, { recursive: true });
  }

  const fileContent = fs.readFileSync(productsPath, 'utf-8');
  const products = JSON.parse(fileContent);

  console.log(`Found ${products.length} products to process.`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const p of products) {
    try {
      const productName = (p.name_fr || p.name || '').trim();
      if (!productName) {
        console.log('Skipping product with empty name');
        skippedCount++;
        continue;
      }

      // ── 1. Gérer les catégories (upsert pour éviter les doublons) ──
      const categoryNames: string[] = p.categories && p.categories.length > 0
        ? p.categories
        : ['Visage'];

      const categoryRecords = [];
      for (const catName of categoryNames) {
        const slug = slugify(catName);
        const category = await prisma.category.upsert({
          where: { slug },
          update: {},
          create: {
            name: catName,
            nameAr: catName,
            slug,
          },
        });
        categoryRecords.push(category);
      }

      // ── 2. Copier l'image vers public/products ──
      let imagePath = '';
      if (p.image) {
        const srcImg = path.join(scrapedImagesDir, p.image);
        const dstImg = path.join(publicProductsDir, p.image);
        if (fs.existsSync(srcImg)) {
          fs.copyFileSync(srcImg, dstImg);
          imagePath = `/products/${p.image}`;
        }
      }

      const priceNum = parseFloat(p.price);
      const brand = (p.brand || 'Autre').trim();
      const description = (p.description_fr || p.name_fr || '').trim();

      // ── 3. Vérifier si le produit existe déjà (anti-doublon) ──
      const existing = await prisma.product.findFirst({
        where: {
          name: { equals: productName, mode: 'insensitive' },
        },
      });

      if (existing) {
        // Mettre à jour le produit existant
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
              set: [], // Déconnecte les anciennes
              connect: categoryRecords.map(c => ({ id: c.id })),
            },
          },
        });
        console.log(`Updated product: ${productName} (categories: ${categoryNames.join(', ')})`);
        updatedCount++;
      } else {
        // Créer le nouveau produit
        await prisma.product.create({
          data: {
            name: productName,
            brand,
            description,
            price: isNaN(priceNum) ? 0 : priceNum,
            image: imagePath,
            stock: p.stock || 50,
            isVisible: true,
            categories: {
              connect: categoryRecords.map(c => ({ id: c.id })),
            },
          },
        });
        console.log(`Created product: ${productName} (categories: ${categoryNames.join(', ')})`);
        createdCount++;
      }
    } catch (err) {
      console.error(`Error processing product "${p.name_fr}":`, err);
      skippedCount++;
    }
  }

  console.log('\n✅ Seeding finished!');
  console.log(`   Created: ${createdCount}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
