/**
 * Scraper hmizatchezsara.com → DB Prisma
 * Usage: npx ts-node scripts/scrape-and-import.ts
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

const COLLECTION_URL = 'https://hmizatchezsara.com/collections/korean-japanese-shop-2';
const TARGET_COUNT = 20;
const IMAGES_DIR = path.join(process.cwd(), 'public', 'products');

// Mapping mots-clés → étape Korean Beauty (1-10)
const STEP_KEYWORDS: Record<number, string[]> = {
  1: ['huile', 'oil', 'cleansing oil', 'démaquillant', 'makeup remover'],
  2: ['mousse', 'foam', 'gel nettoyant', 'cleanser', 'face wash'],
  3: ['exfoliant', 'peeling', 'scrub', 'aha', 'bha', 'exfoliator'],
  4: ['toner', 'lotion', 'essence water', 'tonique'],
  5: ['essence', 'ferment', 'first treatment'],
  6: ['sérum', 'ampoule', 'serum', 'concentré'],
  7: ['masque', 'mask', 'sheet mask', 'face mask'],
  8: ['eye cream', 'contour yeux', 'eye', 'anti-cernes'],
  9: ['crème', 'cream', 'moisturizer', 'lotion hydratante'],
  10: ['sunscreen', 'spf', 'solaire', 'sun', 'uv', 'protection'],
};

// Mapping mots-clés → catégories Fassia
const CATEGORY_MAP: Record<string, string[]> = {
  'Visage': ['crème', 'sérum', 'serum', 'toner', 'nettoyant', 'masque', 'contour des yeux', 'essence', 'moisturizer', 'hydratant', 'cleanser', 'pad', 'peeling', 'mousse', 'lotion', 'ampoule', 'bifida', 'bakuchiol', 'pore', 'calming', 'glutathiosome'],
  'K-Beauty': ['abib', 'numbuzin', 'celimax', 'cosrx', 'innisfree', 'some by mi', 'pyunkang yul', 'benton', 'dear, klairs', 'heimish', 'iunik', 'isntree', 'one thing', 'purito', 'round lab', 'skin1004', 'sulwhasoo'],
  'Cheveux': ['shampooing', 'après-shampooing', 'conditioner', 'masque cheveux', 'huile cheveux', 'sérum cheveux', 'hair', 'shampoo', 'cheveux', 'keratin'],
  'Maquillage': ['fond de teint', 'rouge à lèvres', 'mascara', 'eyeliner', 'concealer', 'blush', 'highlighter', 'makeup', 'bb cream', 'cc cream', 'cushion', 'lip'],
  'Compléments Alimentaires': ['vitamine', 'collagène', 'collagen', 'probiotique', 'probiotic', 'supplement', 'gummies', 'gummy', 'zinc', 'magnésium', 'omega'],
};

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

function detectKoreanBeautyStep(name: string, description: string = ''): number | null {
  const text = `${name} ${description}`.toLowerCase();
  for (const [step, keywords] of Object.entries(STEP_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) return parseInt(step);
    }
  }
  return null;
}

function detectCategories(name: string, description: string = ''): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const found = new Set<string>();
  
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        found.add(cat);
        break;
      }
    }
  }
  
  // Par défaut pour cette collection
  found.add('K-Beauty');
  if (!found.has('Visage') && !found.has('Maquillage') && !found.has('Cheveux')) {
    found.add('Visage');
  }
  
  return Array.from(found);
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr,en;q=0.9',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e: any) {
    console.error('Fetch error:', url, e.message);
    return null;
  }
}

async function scrapeProductList(): Promise<{ name: string; url: string; image_url: string; price: string }[]> {
  const products: any[] = [];
  let page = 1;
  
  while (products.length < TARGET_COUNT) {
    const url = `${COLLECTION_URL}?page=${page}`;
    const html = await fetchHtml(url);
    if (!html) break;
    
    const $ = cheerio.load(html);
    const items = $('.product-item, .grid__item, [data-product-handle]');
    
    if (items.length === 0) break;
    
    items.each((_, el) => {
      const $el = $(el);
      const link = $el.find('a[href*="/products/"]').first();
      const name = $el.find('.product-card__title, .product-item__title, h3, .card__heading').first().text().trim();
      const href = link.attr('href') || '';
      const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
      const priceText = $el.find('.price, .money, .product-price').first().text().trim();
      
      if (name && href) {
        products.push({
          name,
          url: href.startsWith('http') ? href : `https://hmizatchezsara.com${href}`,
          image_url: img.startsWith('http') ? img : `https:${img}`,
          price: priceText,
        });
      }
    });
    
    page++;
    if (page > 5) break; // Safety limit
  }
  
  return products.slice(0, TARGET_COUNT);
}

async function scrapeProductDetail(url: string): Promise<{
  description: string;
  brand: string;
  fullImage: string;
}> {
  const html = await fetchHtml(url);
  if (!html) return { description: '', brand: '', fullImage: '' };
  
  const $ = cheerio.load(html);
  
  // Description
  const desc = $('.product-description, .rte, .product__description, [data-product-description]')
    .first().text().trim();
  
  // Brand depuis JSON-LD
  let brand = '';
  let fullImage = '';
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      const json = JSON.parse($(script).text() || '{}');
      if (json['@type'] === 'Product') {
        brand = json.brand?.name || json.brand || '';
        const img = json.image;
        if (typeof img === 'string') fullImage = img;
        else if (Array.isArray(img) && img.length) fullImage = img[0];
      }
    } catch {}
  });
  
  // Fallback brand
  if (!brand) {
    brand = $('.product-vendor, .product-brand, .vendor').first().text().trim();
  }
  
  // Fallback image
  if (!fullImage) {
    fullImage = $('meta[property="og:image"]').attr('content') || '';
  }
  
  return { description: desc, brand, fullImage };
}

async function downloadAndConvertToWebp(imageUrl: string, filename: string): Promise<string | null> {
  try {
    if (!imageUrl) return null;
    
    // Fix Shopify image URL
    const cleanUrl = imageUrl.replace(/\?v=\d+/, '').replace(/\.jpg\?.*$/, '.jpg');
    
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!res.ok) return null;
    
    const buffer = Buffer.from(await res.arrayBuffer());
    
    // Convert to WebP
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();
    
    const outputPath = path.join(IMAGES_DIR, `${filename}.webp`);
    fs.writeFileSync(outputPath, webpBuffer);
    
    return `/products/${filename}.webp`;
  } catch (e) {
    console.error('Image conversion error:', e);
    return null;
  }
}

async function upsertCategory(name: string) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: {
      name,
      nameAr: name,
      slug,
    },
  });
}

async function upsertCollection(name: string, page: string) {
  const slug = slugify(name);
  return prisma.collection.upsert({
    where: { slug },
    update: {},
    create: {
      name,
      slug,
      page,
    },
  });
}

async function main() {
  console.log('🚀 Starting scraper...\n');
  
  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  
  // 1. Scrape product list
  console.log(`📄 Scraping product list from ${COLLECTION_URL}...`);
  const products = await scrapeProductList();
  console.log(`✅ Found ${products.length} products\n`);
  
  if (products.length === 0) {
    console.log('❌ No products found');
    return;
  }
  
  // 2. Prepare collections
  const koreanBeautyCollection = await upsertCollection('Korean Beauty', 'korean-beauty');
  
  // 3. Scrape details and import
  let imported = 0;
  let updated = 0;
  let errors = 0;
  
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    console.log(`[${i + 1}/${products.length}] ${item.name.slice(0, 50)}...`);
    
    try {
      // Scrape details
      const details = await scrapeProductDetail(item.url);
      
      // Detect step and categories
      const step = detectKoreanBeautyStep(item.name, details.description);
      const categories = detectCategories(item.name, details.description);
      
      console.log(`   📌 Categories: ${categories.join(', ')}`);
      if (step) console.log(`   📌 Korean Beauty Step: ${step}`);
      
      // Download and convert image
      const safeName = slugify(item.name).slice(0, 30);
      const imagePath = await downloadAndConvertToWebp(
        details.fullImage || item.image_url,
        `scraped_${Date.now()}_${i}`
      );
      
      if (imagePath) {
        console.log(`   🖼️  Image: ${imagePath}`);
      }
      
      // Parse price
      const priceMatch = item.price.match(/[\d,.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
      
      // Upsert categories
      const categoryRecords = await Promise.all(categories.map(c => upsertCategory(c)));
      
      // Check existing product
      const existing = await prisma.product.findFirst({
        where: {
          name: { contains: item.name, mode: 'insensitive' },
        },
      });
      
      const productData = {
        brand: details.brand || item.name.split(' ')[0] || 'Unknown',
        name: item.name,
        nameAr: item.name, // Using same name for AR for now
        description: details.description || item.name,
        descriptionAr: details.description || item.name,
        price,
        oldPrice: null as number | null,
        image: imagePath || '',
        stock: 50,
        isVisible: true,
        koreanBeautyStep: step,
        tags: [],
        concerns: [],
        categories: {
          connect: categoryRecords.map(c => ({ id: c.id })),
        },
        collections: {
          connect: { id: koreanBeautyCollection.id },
        },
      };
      
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            ...productData,
            categories: {
              set: [],
              connect: categoryRecords.map(c => ({ id: c.id })),
            },
          },
        });
        console.log(`   🔄 Updated existing product\n`);
        updated++;
      } else {
        await prisma.product.create({
          data: productData,
        });
        console.log(`   ✅ Created new product\n`);
        imported++;
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 800));
      
    } catch (e: any) {
      console.error(`   ❌ Error:`, e.message);
      errors++;
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Created: ${imported}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📁 Images saved to: ${IMAGES_DIR}`);
}

main()
  .catch((e: any) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
