/**
 * Scraper universparadiscount.ma/376-vitamines-et-formes → DB Prisma
 * Usage: npx tsx scripts/scrape-paradiscount.ts
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import axios from 'axios';

const prisma = new PrismaClient();

const BASE_URL = 'https://universparadiscount.ma';
const COLLECTION_PATH = '/376-vitamines-et-formes';
const MAX_PAGES = 5;
const TARGET_COUNT = 10;
const IMAGES_DIR = path.join(process.cwd(), 'public', 'products-paradiscount');

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
  },
  timeout: 15000,
});

// Mapping supplementFocus par mots-clés dans le nom
const FOCUS_MAP: Record<string, string[]> = {
  'sleep': ['sommeil', 'sleep', 'magnésium', 'magnesium', 'melatonine', 'melatonin', 'relax', 'calm', 'zen'],
  'stress': ['stress', 'humeur', 'mood', 'ashwagandha', 'rhodiola', 'theanine', 'l-theanine', 'adaptogène', 'adaptogen', 'anxiété'],
  'digest': ['digestion', 'probiotique', 'probiotic', 'intestin', 'gut', 'enzyme', 'flore', 'bloating', 'ballonnement'],
  'metabolic': ['poids', 'weight', 'minceur', 'slimming', 'métbolisme', 'metabolism', 'chrome', 'berberine', 'draineur', 'drainage', 'détox'],
  'immunity': ['immunité', 'immunity', 'propolis', 'zinc', 'vitamine c', 'echinacea', 'défense', 'defense', 'vitamine d', 'vitamine d3', 'd3'],
  'beauty': ['beauté', 'beauty', 'collagène', 'collagen', 'biotine', 'biotin', 'hyaluronique', 'hyaluronic', 'peau', 'skin', 'ongles', 'cheveux', 'antioxydant'],
};

// Collections Fassia correspondantes
// Chaque produit est assigné au MAXIMUM de collections qui correspondent
const COLLECTION_MAP: Record<string, string[]> = {
  'Immunité & Ruche': ['immunité', 'immunity', 'propolis', 'zinc', 'echinacea', 'défense', 'defense'],
  'Sommeil & Relaxation': ['sommeil', 'sleep', 'magnésium', 'magnesium', 'melatonine', 'melatonin', 'relax', 'calm', 'zen'],
  'Poids & Métabolisme': ['poids', 'weight', 'minceur', 'slimming', 'métbolisme', 'metabolism', 'chrome', 'berberine', 'draineur', 'drainage', 'détox'],
  'Beauté In & Out': ['beauté', 'beauty', 'collagène', 'collagen', 'biotine', 'biotin', 'hyaluronique', 'hyaluronic', 'peau', 'skin', 'ongles', 'cheveux'],
  'Digestion & Probiotiques': ['digestion', 'probiotique', 'probiotic', 'intestin', 'gut', 'enzyme', 'flore', 'bloating', 'ballonnement'],
  'Stress & Humeur': ['stress', 'humeur', 'mood', 'ashwagandha', 'rhodiola', 'theanine', 'l-theanine', 'adaptogène', 'adaptogen'],
  'Vitamines & Minéraux': ['vitamine', 'vitamin', 'minéral', 'mineral', 'multivitamine', 'complex', 'calcium', 'magnésium', 'zinc', 'fer', 'omega', 'omega 3', 'oméga', 'd3', 'b12', 'vitamine c', 'vitamine d'],
};

interface ScrapedProduct {
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  description?: string;
  brand: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await axiosInstance.get(url);
    return response.data as string;
  } catch (e) {
    console.log(`   ❌ fetchHtml error: ${(e as any).message || 'unknown'}`);
    return null;
  }
}

async function downloadImage(imageUrl: string, filename: string): Promise<string | null> {
  try {
    const url = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    const ext = path.extname(url.split('?')[0]) || '.jpg';
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
    return `/products-paradiscount/${filename}.webp`;
  } catch {
    return null;
  }
}

function cleanName(rawName: string): string {
  return rawName.replace(/\s+/g, ' ').trim();
}

function parsePrice(priceStr: string): number {
  const match = priceStr.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function detectSupplementFocus(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [focus, keywords] of Object.entries(FOCUS_MAP)) {
    if (keywords.some(k => lower.includes(k))) return focus;
  }
  return null;
}

function detectCollections(name: string): string[] {
  const lower = name.toLowerCase();
  const collections: string[] = ['Compléments Alimentaires']; // Toujours présent
  for (const [collName, keywords] of Object.entries(COLLECTION_MAP)) {
    if (keywords.some(k => lower.includes(k))) {
      collections.push(collName);
    }
  }
  return collections;
}

async function main() {
  ensureDir(IMAGES_DIR);
  console.log('🚀 Scraping Univers Paradiscount Vitamines...\n');

  const seen = new Set<string>();
  let created = 0;
  let page = 1;

  while (created < TARGET_COUNT && page <= MAX_PAGES) {
    const url = `${BASE_URL}${COLLECTION_PATH}?page=${page}`;
    console.log(`📄 Page ${page}: ${url}`);
    const html = await fetchHtml(url);
    if (!html) { page++; continue; }

    const products = await extractProductsFromHtml(html, seen);
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
      const imagePath = await downloadImage(p.imageUrl, `paradiscount-${Date.now()}-${created}`);
      if (!imagePath) {
        console.log('   ❌ Image download failed, trying next product...');
        continue;
      }

      // Detect metadata
      const focus = detectSupplementFocus(p.name);
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
              page: 'complements-alimentaires',
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
          description: `Complément alimentaire : ${p.name}`,
          price: p.price,
          oldPrice: p.oldPrice || null,
          image: imagePath,
          stock: 10,
          isVisible: true,
          salesCount: 0,
          tags: [],
          concerns: [],
          supplementFocus: focus,
          collections: { connect: collections },
        }
      });

      console.log(`   ✅ Created (focus: ${focus || 'none'}, collections: ${collectionNames.join(', ')})`);
      created++;
    }

    page++;
    if (created < TARGET_COUNT) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n🎉 Done! ${created} products created.`);
  await prisma.$disconnect();
}

// Extract products from a single page HTML
async function extractProductsFromHtml(html: string, seen: Set<string>): Promise<ScrapedProduct[]> {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  const scripts = $('script').toArray();
  for (const scriptEl of scripts) {
    const text = $(scriptEl).text();
    if (text.includes('cdcDatalayer') && text.includes('"ecommerce"')) {
      try {
        const match = text.match(/cdcDatalayer\s*=\s*(\{[\s\S]*?\});\s*(?:<\/script>|$)/);
        if (match) {
          const data = JSON.parse(match[1]);
          const items = data?.ecommerce?.items || [];
          for (const item of items) {
            const name = cleanName(item.item_name || '');
            const price = parseFloat(item.price) || 0;
            const brand = item.item_brand || name.split(' ')[0] || 'Univers Paradiscount';
            const itemId = item.item_id?.replace('-0', '') || '';
            // PrestaShop image path: /img/p/[digits]/[id]-large_default.jpg
            const imgPath = itemId.split('').join('/'); // e.g. "22630" → "2/2/6/3/0"
            const imageUrl = `${BASE_URL}/img/p/${imgPath}/${itemId}-large_default.jpg`;

            if (name && price > 0 && !seen.has(name)) {
              seen.add(name);
              products.push({ name, price, imageUrl, brand });
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // Fallback to Schema.org JSON-LD
  if (products.length === 0) {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).text());
        if (json['@type'] === 'ItemList' && Array.isArray(json.itemListElement)) {
          for (const item of json.itemListElement) {
            const name = cleanName(item.name || '');
            const url = item.url || '';
            if (name && !seen.has(name)) {
              seen.add(name);
              const idMatch = url.match(/(\d+)-/);
              const itemId = idMatch ? idMatch[1] : '';
              const imgPath = itemId.split('').join('/');
              const imageUrl = itemId ? `${BASE_URL}/img/p/${imgPath}/${itemId}-large_default.jpg` : '';
              products.push({ name, price: 0, imageUrl, brand: name.split(' ')[0] || 'Univers Paradiscount' });
            }
          }
        }
      } catch {
        // ignore
      }
    });
  }

  return products;
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
