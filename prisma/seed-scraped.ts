import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting scraped products seeding...');

  // Read products.json
  const productsPath = path.join(process.cwd(), 'prisma', 'products.json');
  if (!fs.existsSync(productsPath)) {
    console.error(`Error: products.json not found at ${productsPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(productsPath, 'utf-8');
  const products = JSON.parse(fileContent);

  console.log(`Found ${products.length} products to insert.`);

  for (const p of products) {
    // Determine category based on categories list (fallback to "Visage" if empty)
    const categoryName = p.categories && p.categories.length > 0 ? p.categories[0] : 'Visage';
    
    // Create or connect Category
    const category = await prisma.category.upsert({
      where: { slug: categoryName.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: categoryName,
        nameAr: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    const priceNum = parseFloat(p.price);

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: p.name_fr,
        brand: p.brand || 'Autre',
        description: p.description_fr || p.name_fr,
        price: isNaN(priceNum) ? 0 : priceNum,
        image: `/products/${p.image}`,
        stock: p.stock || 50, // default stock to 50
        isVisible: true,
        categories: {
          connect: { id: category.id }
        }
      },
    });

    console.log(`Created product: ${product.name}`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
