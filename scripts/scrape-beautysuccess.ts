/**
 * Scraper beautysuccess.co/maquillage.html → DB Prisma
 * Usage: npx tsx scripts/scrape-beautysuccess.ts
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import axios from 'axios';

const prisma = new PrismaClient();

const BASE_URL = 'https://beautysuccess.co';
const COLLECTION_PATH = '/maquillage.html';
const MAX_PAGES = 3;
const TARGET_COUNT = 9;
const IMAGES_DIR = path.join(process.cwd(), 'public', 'products-beautysuccess');

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  },
  timeout: 15000,
});

// Mapping étapes maquillage par mots-clés dans le nom
const MAKEUP_STEP_MAP: { step: number; keywords: string[] }[] = [
  { step: 1,  keywords: ['primer', 'base', 'fixateur', 'fixing', 'base de teint'] },
  { step: 2,  keywords: ['fond de teint', 'foundation', 'fond-de-teint', 'bb cream', 'cc cream', 'cushion', 'terracota joli teint', 'terracotta le teint', 'parure gold'] },
  { step: 3,  keywords: ['correcteur', 'concealer', 'anticerne', 'anti-cerne', 'cover', 'terracotta correcteur'] },
  { step: 4,  keywords: ['poudre', 'powder', 'compact', 'matifiant', 'setting powder', 'perles de poudre'] },
  { step: 5,  keywords: ['blush', 'bronzer', 'contour', 'highlighter', 'illuminateur', 'enlumineur', 'fard à joues', 'terracotta le fard'] },
  { step: 6,  keywords: ['sourcil', 'eyebrow', 'brow', 'crayon sourcil', 'gel sourcil'] },
  { step: 7,  keywords: ['fard à paupière', 'eyeshadow', 'palette ombre', 'ombre à paupière', 'ombres à paupières'] },
  { step: 8,  keywords: ['eyeliner', 'crayon yeux', 'khol', 'khôl', 'eye liner', 'crayon yeux'] },
  { step: 9,  keywords: ['mascara', 'volume', 'allongeant', 'cils'] },
  { step: 10, keywords: ['rouge à lèvres', 'lipstick', 'gloss', 'baume lèvre', 'crayon lèvre', 'mat lip', 'huile à lèvres', 'kiss kiss'] },
  { step: 11, keywords: ['fixateur', 'fixing spray', 'brume fixatrice', 'makeup fix', 'setting spray'] },
];

function detectMakeupStep(name: string): number | null {
  const lower = name.toLowerCase();
  for (const { step, keywords } of MAKEUP_STEP_MAP) {
    if (keywords.some(k => lower.includes(k))) return step;
  }
  return null;
}

// Collections par mots-clés
const COLLECTION_MAP: Record<string, string[]> = {
  'Teint': ['fond de teint', 'poudre', 'blush', 'bronzer', 'correcteur', 'highlighter', 'contour', 'primer', 'base', 'terracotta', 'parure gold'],
  'Yeux': ['mascara', 'eyeliner', 'fard à paupière', 'crayon yeux', 'khol', 'ombre', 'sourcil', 'brow'],
  'Lèvres': ['rouge à lèvres', 'lipstick', 'gloss', 'baume lèvre', 'crayon lèvre', 'huile à lèvres', 'kiss'],
};

function detectCollections(name: string): string[] {
  const lower = name.toLowerCase();
  const collections: string[] = ['Maquillage'];
  for (const [collName, keywords] of Object.entries(COLLECTION_MAP)) {
    if (keywords.some(k => lower.includes(k))) collections.push(collName);
  }
  return collections;
}

interface ScrapedProduct {
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  brand: string;
  url: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await axiosInstance.get(url);
    return response.data as string;
  } catch (e) {
    console.log(`   ❌ fetch error: ${(e as any).message || 'unknown'}`);
    return null;
  }
}

async function downloadImage(imageUrl: string, filename: string): Promise<string | null> {
  try {
    const url = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    const ext = '.jpg';
    const outputPath = path.join(IMAGES_DIR, `${filename}${ext}`);
    const webpPath = path.join(IMAGES_DIR, `${filename}.webp`);

    const response = await axiosInstance.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);
    (response.data as NodeJS.ReadableStream).pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await sharp(outputPath).webp({ quality: 85 }).toFile(webpPath);
    fs.unlinkSync(outputPath);
    console.log(`  ✅ ${filename}.webp`);
    return `/products-beautysuccess/${filename}.webp`;
  } catch {
    return null;
  }
}

function cleanName(rawName: string): string {
  return rawName.replace(/\s+/g, ' ').trim();
}

// Extract products from dataLayer JSON
function extractProductsFromHtml(html: string, seen: Set<string>): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  // Look for dataLayer with ecommerce items
  $('script').each((_, el) => {
    const text = $(el).text();
    if (text.includes('"view_item_list"') && text.includes('"items"')) {
      try {
        // Find the items array using regex
        const itemsMatch = text.match(/"items"\s*:\s*(\[[\s\S]*?\])\s*\}/);
        if (itemsMatch) {
          let itemsJson = itemsMatch[1];
          // Fix escaped unicode
          itemsJson = itemsJson.replace(/\\u00c8/g, 'È').replace(/\\u00c9/g, 'É').replace(/\\u00c0/g, 'À');
          itemsJson = itemsJson.replace(/\\u00d9/g, 'Ù').replace(/\\u00d4/g, 'Ô').replace(/\\u00ce/g, 'Î');
          // Fix URL escaping
          itemsJson = itemsJson.replace(/\\\//g, '/');
          const items = JSON.parse(itemsJson);
          for (const item of items) {
            const name = cleanName(item.item_name || '');
            const price = parseFloat(item.price) || 0;
            const url = item.item_url || '';
            const itemId = item.item_id || '';

            // Build image URL from item_id (Magento format: cache path + first chars)
            const idClean = itemId.replace(/\D/g, '');
            const imageUrl = idClean
              ? `${BASE_URL}/media/catalog/product/cache/f421fe0f052247c7b48ffd84b7f05cfe/${idClean.substring(0, 1)}/${idClean.substring(1, 2)}/${idClean}.jpg`
              : '';

            if (name && price > 0 && !seen.has(name)) {
              seen.add(name);
              products.push({ name, price, imageUrl, brand: item.item_brand || name.split(' ')[0] || 'Beauty Success', url });
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    }
  });

  return products;
}

async function main() {
  ensureDir(IMAGES_DIR);
  console.log('🚀 Scraping Beauty Success Maquillage...\n');

  const seen = new Set<string>();
  let created = 0;
  let page = 1;

  while (created < TARGET_COUNT && page <= MAX_PAGES) {
    const url = page === 1 ? `${BASE_URL}${COLLECTION_PATH}` : `${BASE_URL}${COLLECTION_PATH}?p=${page}`;
    console.log(`📄 Page ${page}: ${url}`);
    const html = await fetchHtml(url);
    if (!html) { page++; continue; }

    const products = extractProductsFromHtml(html, seen);
    console.log(`   📦 ${products.length} products on this page\n`);

    if (products.length === 0) break;

    for (let i = 0; i < products.length && created < TARGET_COUNT; i++) {
      const p = products[i];
      console.log(`[${created + 1}/${TARGET_COUNT}] ${p.name}`);

      // Skip duplicates
      const existing = await prisma.product.findFirst({
        where: { name: { equals: p.name, mode: 'insensitive' } }
      });
      if (existing) {
        console.log('   ⏭️ Already exists');
        continue;
      }

      // Download image
      const imagePath = await downloadImage(p.imageUrl, `bs-${Date.now()}-${created}`);
      if (!imagePath) {
        console.log('   ❌ Image download failed, trying next product...');
        continue;
      }

      // Detect metadata
      const makeupStep = detectMakeupStep(p.name);
      const collectionNames = detectCollections(p.name);

      // Get or create collections
      const collections = [];
      for (const collName of collectionNames) {
        let coll = await prisma.collection.findFirst({ where: { name: collName } });
        if (!coll) {
          coll = await prisma.collection.create({
            data: {
              name: collName,
              slug: collName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              page: 'maquillage-parfums',
              description: `Collection ${collName}`,
              order: 0,
            }
          });
        }
        collections.push({ id: coll.id });
      }

      // Create product
      await prisma.product.create({
        data: {
          brand: p.brand,
          name: p.name,
          description: `Maquillage : ${p.name}`,
          price: p.price,
          oldPrice: p.oldPrice || null,
          image: imagePath,
          stock: 10,
          isVisible: true,
          salesCount: 0,
          tags: [],
          concerns: [],
          makeupStep: makeupStep,
          collections: { connect: collections },
        }
      });

      console.log(`   ✅ Created (step: ${makeupStep || 'none'}, collections: ${collectionNames.join(', ')})`);
      created++;
    }

    page++;
    if (created < TARGET_COUNT) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  console.log(`\n🎉 Done! ${created} products created.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
