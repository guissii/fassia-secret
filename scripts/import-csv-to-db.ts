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

  // ── Load existing collections & categories from DB ──
  const existingCollections = await prisma.collection.findMany();
  const existingCategories = await prisma.category.findMany();

  const collectionBySlug = new Map(existingCollections.map((c: any) => [c.slug, c]));
  const collectionByPage = new Map(existingCollections.map((c: any) => [c.page, c]));
  const collectionByName = new Map(existingCollections.map((c: any) => [c.name.toLowerCase(), c]));
  const categoryBySlug = new Map(existingCategories.map((c: any) => [c.slug, c]));
  const categoryByName = new Map(existingCategories.map((c: any) => [c.name.toLowerCase(), c]));

  console.log(`DB has ${existingCollections.length} collections, ${existingCategories.length} categories`);
  console.log('Collections:', existingCollections.map((c: any) => `${c.name}(${c.slug},page=${c.page})`).join(', '));
  console.log('Categories:', existingCategories.map((c: any) => `${c.name}(${c.slug})`).join(', '));

  const dataRows = rows.slice(1);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of dataRows) {
    if (row.length < 6) continue;

    const [
      nameRaw, brandRaw, priceText, descRaw, imageRaw, urlRaw,
      collectionSourceRaw, koreanBeautyStepRaw, categoriesRaw
    ] = row;

    const productName = clean(nameRaw);
    if (!productName) continue;

    const productBrand = clean(brandRaw) || 'Autre';
    const productDesc = clean(descRaw);
    const productImage = clean(imageRaw);
    const price = extractPrice(priceText);

    // ── Resolve collection (existing ONLY) ──
    const collectionSource = clean(collectionSourceRaw);
    let collectionConnect: { id: string }[] = [];
    if (collectionSource) {
      const col = (collectionBySlug.get(collectionSource)
        || collectionByPage.get(collectionSource)
        || collectionByName.get(collectionSource.toLowerCase())) as any;
      if (col) {
        collectionConnect.push({ id: col.id });
      } else {
        console.warn(`  [SKIP COLLECTION] "${collectionSource}" not found in DB`);
      }
    }

    // ── Resolve categories (existing ONLY) ──
    const categorySlugs = clean(categoriesRaw)
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    const categoryConnect: { id: string }[] = [];
    for (const slug of categorySlugs) {
      const cat = (categoryBySlug.get(slug) || categoryByName.get(slug)) as any;
      if (cat) {
        categoryConnect.push({ id: cat.id });
      } else {
        console.warn(`  [SKIP CATEGORY] "${slug}" not found in DB`);
      }
    }

    // ── Korean Beauty Step ──
    const stepRaw = clean(koreanBeautyStepRaw);
    const koreanBeautyStep = stepRaw ? parseInt(stepRaw, 10) : null;
    const validStep = (koreanBeautyStep && koreanBeautyStep >= 1 && koreanBeautyStep <= 10) ? koreanBeautyStep : null;

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

    const imagePath = productImage ? `/products/${productImage}` : '';

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          brand: productBrand,
          description: productDesc,
          price,
          image: imagePath || existing.image,
          isVisible: true,
          koreanBeautyStep: validStep ?? existing.koreanBeautyStep,
          categories: { set: [], connect: categoryConnect },
          collections: { set: [], connect: collectionConnect },
        }
      });
      updated++;
      console.log(`[UPDATED] ${productName}${validStep ? ` (step ${validStep})` : ''}`);
    } else {
      await prisma.product.create({
        data: {
          name: productName,
          brand: productBrand,
          description: productDesc,
          price,
          image: imagePath,
          stock: 50,
          isVisible: true,
          koreanBeautyStep: validStep,
          categories: categoryConnect.length > 0 ? { connect: categoryConnect } : undefined,
          collections: collectionConnect.length > 0 ? { connect: collectionConnect } : undefined,
        }
      });
      created++;
      console.log(`[CREATED] ${productName}${validStep ? ` (step ${validStep})` : ''}`);
    }
  }

  console.log(`\nDone! Created: ${created} | Updated: ${updated} | Skipped warnings: see above`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
