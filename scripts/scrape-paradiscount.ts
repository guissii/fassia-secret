/**
 * Scraper universparadiscount.ma/376-vitamines-et-formes → DB Prisma
 * Usage: npx tsx scripts/scrape-paradiscount.ts
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import https from 'https';

const prisma = new PrismaClient();

const BASE_URL = 'https://universparadiscount.ma';
const COLLECTION_PATH = '/376-vitamines-et-formes';
const MAX_PAGES = 10;
const TARGET_COUNT = 30;
const IMAGES_DIR = path.join(process.cwd(), 'public', 'products-paradiscount');

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
const COLLECTION_MAP: Record<string, string[]> = {
  'Immunité & Ruche': ['immunité', 'immunity', 'propolis', 'zinc', 'vitamine c', 'echinacea', 'défense', 'defense', 'vitamine d', 'vitamine d3', 'd3'],
  'Sommeil & Relaxation': ['sommeil', 'sleep', 'magnésium', 'magnesium', 'melatonine', 'melatonin', 'relax', 'calm', 'zen'],
  'Poids & Métabolisme': ['poids', 'weight', 'minceur', 'slimming', 'métbolisme', 'metabolism', 'chrome', 'berberine', 'draineur', 'drainage', 'détox'],
  'Beauté In & Out': ['beauté', 'beauty', 'collagène', 'collagen', 'biotine', 'biotin', 'hyaluronique', 'hyaluronic', 'peau', 'skin', 'ongles', 'cheveux'],
  'Digestion & Probiotiques': ['digestion', 'probiotique', 'probiotic', 'intestin', 'gut', 'enzyme', 'flore', 'bloating', 'ballonnement'],
  'Stress & Humeur': ['stress', 'humeur', 'mood', 'ashwagandha', 'rhodiola', 'theanine', 'l-theanine', 'adaptogène', 'adaptogen'],
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
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(null));
  });
}

async function downloadImage(imageUrl: string, filename: string): Promise<string | null> {
  return new Promise((resolve) => {
    const url = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    const ext = path.extname(url.split('?')[0]) || '.jpg';
    const outputPath = path.join(IMAGES_DIR, `${filename}${ext}`);
    const webpPath = path.join(IMAGES_DIR, `${filename}.webp`);

    const file = fs.createWriteStream(outputPath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { file.destroy(); resolve(null); return; }
      res.pipe(file);
      file.on('finish', async () => {
        file.close();
        try {
          await sharp(outputPath).webp({ quality: 85 }).toFile(webpPath);
          fs.unlinkSync(outputPath);
          console.log(`  ✅ ${filename}.webp`);
          resolve(`/products-paradiscount/${filename}.webp`);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => { file.destroy(); resolve(null); });
  });
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
  const collections: string[] = [];
  for (const [collName, keywords] of Object.entries(COLLECTION_MAP)) {
    if (keywords.some(k => lower.includes(k))) {
      collections.push(collName);
    }
  }
  if (collections.length === 0) collections.push('Compléments Alimentaires');
  return collections;
}

async function scrapeProductList(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_PAGES && products.length < TARGET_COUNT; page++) {
    const url = `${BASE_URL}${COLLECTION_PATH}?page=${page}`;
    console.log(`📄 Page ${page}: ${url}`);
    const html = await fetchHtml(url);
    if (!html) break;

    const $ = cheerio.load(html);

    // UniversParadiscount product selectors (PrestaShop)
    const items = $('.product-miniature, .js-product-miniature, .item-product, .product-container');
    console.log(`   Found ${items.length} product items`);

    let added = 0;
    items.each((_, el) => {
      const $el = $(el);

      // Try multiple selectors for name
      const name = cleanName(
        $el.find('.product-title a, .product-name a, h3 a, h2 a, .product-title, .product-name').first().text()
      );

      // Try multiple selectors for price
      const priceText = $el.find('.price, .current-price, .product-price, .regular-price').first().text();
      const price = parsePrice(priceText);

      // Try old price
      const oldPriceText = $el.find('.old-price, .regular-price.crossed').first().text();
      const oldPrice = oldPriceText ? parsePrice(oldPriceText) : undefined;

      // Try multiple selectors for image
      let imageUrl = $el.find('img').attr('data-src') ||
                     $el.find('img').attr('data-original') ||
                     $el.find('img').attr('src') || '';

      // Fix relative URLs
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.startsWith('/') ? `${BASE_URL}${imageUrl}` : `${BASE_URL}/${imageUrl}`;
      }

      if (name && price > 0 && imageUrl && !seen.has(name)) {
        seen.add(name);
        products.push({
          name,
          price,
          oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined,
          imageUrl,
          brand: name.split(' ')[0] || 'Univers Paradiscount',
        });
        added++;
      }
    });

    console.log(`   Added ${added} unique products`);
    if (added === 0) break;
    await new Promise(r => setTimeout(r, 800));
  }

  return products.slice(0, TARGET_COUNT);
}

async function main() {
  ensureDir(IMAGES_DIR);
  console.log('🚀 Scraping Univers Paradiscount Vitamines...\n');

  const products = await scrapeProductList();
  console.log(`\n📦 ${products.length} products scraped\n`);

  let created = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i+1}/${products.length}] ${p.name}`);

    // Skip duplicates
    const existing = await prisma.product.findFirst({
      where: { name: { equals: p.name, mode: 'insensitive' } }
    });
    if (existing) {
      console.log('   ⏭️ Already exists');
      continue;
    }

    // Download image
    const imagePath = await downloadImage(p.imageUrl, `paradiscount-${Date.now()}-${i}`);
    if (!imagePath) {
      console.log('   ❌ Image download failed');
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

  console.log(`\n🎉 Done! ${created} products created.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
