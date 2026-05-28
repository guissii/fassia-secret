import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentRow.length > 0 || currentCell.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      }
    } else {
      currentCell += char;
    }
  }

  if (currentRow.length > 0 || currentCell.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

function extractPrice(priceText: string): number {
  const match = priceText.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function clean(value: string): string {
  return value ? value.replace(/^"|"$/g, '').trim() : '';
}

async function main() {
  const csvPath = path.join(process.cwd(), 'scraped_korean_japanese', 'products.csv');
  const imagesDir = path.join(process.cwd(), 'scraped_korean_japanese', 'images');
  const publicProductsDir = path.join(process.cwd(), 'public', 'products');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(publicProductsDir)) {
    fs.mkdirSync(publicProductsDir, { recursive: true });
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  if (rows.length < 2) {
    console.error('CSV is empty or invalid');
    process.exit(1);
  }

  const dataRows = rows.slice(1);
  let created = 0;
  let updated = 0;

  // Default category
  const categorySlug = 'visage';
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: {},
    create: { name: 'Visage', nameAr: 'Visage', slug: categorySlug, page: 'general', order: 0 }
  });

  for (const row of dataRows) {
    if (row.length < 6) continue;

    const [nameRaw, brandRaw, priceText, descRaw, imageRaw, urlRaw] = row;
    const productName = clean(nameRaw);
    if (!productName) continue;

    const productBrand = clean(brandRaw) || 'Autre';
    const productDesc = clean(descRaw);
    const productImage = clean(imageRaw);
    const price = extractPrice(priceText);

    // Copy image to public/products
    if (productImage) {
      const srcPath = path.join(imagesDir, productImage);
      const dstPath = path.join(publicProductsDir, productImage);
      if (fs.existsSync(srcPath) && !fs.existsSync(dstPath)) {
        fs.copyFileSync(srcPath, dstPath);
      }
    }

    const existing = await prisma.product.findFirst({
      where: { name: { equals: productName, mode: 'insensitive' } }
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          brand: productBrand,
          description: productDesc,
          price,
          image: productImage ? `/products/${productImage}` : existing.image,
          isVisible: true,
          categories: { set: [], connect: { id: category.id } }
        }
      });
      updated++;
      console.log(`[UPDATED] ${productName}`);
    } else {
      await prisma.product.create({
        data: {
          name: productName,
          brand: productBrand,
          description: productDesc,
          price,
          image: productImage ? `/products/${productImage}` : '',
          stock: 50,
          isVisible: true,
          categories: { connect: { id: category.id } }
        }
      });
      created++;
      console.log(`[CREATED] ${productName}`);
    }
  }

  console.log(`\nDone! Created: ${created} | Updated: ${updated}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
