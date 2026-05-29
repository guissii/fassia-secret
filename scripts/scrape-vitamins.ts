/**
 * Scraper hmizatchezsara.com/collections/vitamines → DB Prisma
 * Usage: npx tsx scripts/scrape-vitamins.ts
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

const COLLECTION_URL = 'https://hmizatchezsara.com/collections/vitamines';
const TARGET_COUNT = 20;
const IMAGES_DIR = path.join(process.cwd(), 'public', 'products-vitamins');

// Mapping mots-clés → étape Korean Beauty (1-10)
// Un produit peut appartenir à PLUSIEURS étapes
const STEP_KEYWORDS: Record<number, string[]> = {
  1: ['huile', 'oil', 'cleansing oil', 'démaquillant'],
  2: ['mousse', 'foam', 'gel nettoyant', 'cleanser', 'face wash'],
  3: ['exfoliant', 'peeling', 'scrub', 'aha', 'bha'],
  4: ['toner', 'lotion', 'essence water', 'tonique'],
  5: ['essence', 'ferment', 'first treatment'],
  6: ['sérum', 'ampoule', 'serum', 'concentré'],
  7: ['masque', 'mask', 'sheet mask'],
  8: ['eye cream', 'contour yeux', 'eye'],
  9: ['crème', 'cream', 'moisturizer', 'hydratante'],
  10: ['sunscreen', 'spf', 'solaire', 'sun', 'uv'],
};

// Mapping mots-clés → catégories Fassia
const CATEGORY_MAP: Record<string, string[]> = {
  'Visage': ['crème', 'sérum', 'serum', 'toner', 'nettoyant', 'masque', 'essence', 'moisturizer', 'cleanser', 'pad', 'peeling', 'mousse', 'lotion', 'ampoule'],
  'K-Beauty': ['abib', 'numbuzin', 'celimax', 'cosrx', 'innisfree', 'some by mi', 'pyunkang yul', 'benton', 'dear, klairs', 'heimish', 'iunik', 'isntree', 'one thing', 'purito', 'round lab', 'skin1004'],
  'Cheveux': ['shampooing', 'après-shampooing', 'conditioner', 'masque cheveux', 'huile cheveux', 'sérum cheveux', 'hair', 'shampoo', 'cheveux', 'keratin'],
  'Maquillage': ['fond de teint', 'rouge à lèvres', 'mascara', 'eyeliner', 'concealer', 'blush', 'highlighter', 'makeup', 'bb cream', 'cc cream', 'cushion', 'lip'],
  'Compléments Alimentaires': ['vitamine', 'vitamin', 'collagène', 'collagen', 'probiotique', 'probiotic', 'supplement', 'gummies', 'gummy', 'zinc', 'magnésium', 'magnesium', 'omega', 'fer', 'iron', 'calcium', 'complex', 'multivitamin', 'acide gras', 'b12', 'd3', 'c', 'e'],
};

// Mapping collections par mots-clés
const COLLECTION_MAP: Record<string, string[]> = {
  'Immunité & Ruche': ['immunité', 'immunity', 'propolis', 'zinc', 'vitamine c', 'echinacea', 'défense', 'defense'],
  'Sommeil & Relaxation': ['sommeil', 'sleep', 'magnésium', 'magnesium', 'melatonine', 'melatonin', 'relax', 'calm'],
  'Poids & Métabolisme': ['poids', 'weight', 'minceur', 'slimming', 'métbolisme', 'metabolism', 'chrome', 'berberine'],
  'Beauté In & Out': ['beauté', 'beauty', 'collagène', 'collagen', 'biotine', 'biotin', 'hyaluronique', 'hyaluronic', 'peau', 'skin', 'ongles', 'cheveux'],
  'Digestion & Probiotiques': ['digestion', 'probiotique', 'probiotic', 'intestin', 'gut', 'enzyme', 'flore'],
  'Stress & Humeur': ['stress', 'humeur', 'mood', 'ashwagandha', 'rhodiola', 'theanine', 'l-theanine', 'adaptogène'],
  'Performance & Sport': ['sport', 'performance', 'energie', 'energy', 'creatine', 'protéine', 'protein', 'bcaa'],
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

function detectSteps(name: string, description: string): number[] {
  const text = `${name} ${description}`.toLowerCase();
  const steps: number[] = [];
  
  for (const [stepNum, keywords] of Object.entries(STEP_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        steps.push(parseInt(stepNum));
        break;
      }
    }
  }
  
  // Si pas d'étape détectée et que c'est un produit de soin, mettre étape 9 par défaut (crème)
  if (steps.length === 0) {
    if (text.includes('crème') || text.includes('cream') || text.includes('moisturizer')) {
      steps.push(9);
    }
  }
  
  return [...new Set(steps)]; // dédupliquer
}

function detectCategories(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const categories: string[] = [];
  
  for (const [catName, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        categories.push(catName);
        break;
      }
    }
  }
  
  // Par défaut pour vitamines
  if (categories.length === 0) {
    categories.push('Compléments Alimentaires');
  }
  
  return [...new Set(categories)];
}

function detectCollections(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const collections: string[] = [];
  
  for (const [collName, keywords] of Object.entries(COLLECTION_MAP)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        collections.push(collName);
        break;
      }
    }
  }
  
  // Par défaut
  if (collections.length === 0) {
    collections.push('Compléments Alimentaires');
  }
  
  return [...new Set(collections)];
}

function detectBrand(name: string): string {
  const brands = ['Abib', 'Celimax', 'Cosrx', 'Innisfree', 'Numbuzin', 'Pyunkang Yul', 'Some By Mi', 'Skin1004', 'Heimish', 'Iunik', 'Isntree', 'One Thing', 'Purito', 'Round Lab', 'Benton', 'Dear Klairs', 'Sulwhasoo', 'Laneige', 'Dr. Jart', 'Missha', 'Etude House', 'Tony Moly', 'Holika Holika', 'The Ordinary', 'CeraVe', 'La Roche-Posay', 'Vichy', 'Bioderma', 'Avène', 'Eucerin', 'Ducray', 'Phyto', 'Klorane'];
  
  for (const brand of brands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  const parts = name.split(',');
  if (parts.length > 1) {
    return parts[0].trim();
  }
  
  return 'Inconnu';
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*',
        'Referer': 'https://hmizatchezsara.com/',
      },
    });
    if (!res.ok) return null;
    
    const buffer = Buffer.from(await res.arrayBuffer());
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
    const filepath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filepath, webpBuffer);
    
    return `/products-vitamins/${filename}`;
  } catch (e: any) {
    console.error('   ❌ Image error:', e.message);
    return null;
  }
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
  const seenUrls = new Set<string>();
  let page = 1;
  
  while (products.length < TARGET_COUNT) {
    const url = `${COLLECTION_URL}?page=${page}`;
    console.log(`📄 Scraping page ${page}...`);
    const html = await fetchHtml(url);
    if (!html) break;
    
    const $ = cheerio.load(html);
    
    // Find all product links, extract name from img[alt]
    const allLinks = $('a[href*="/products/"]');
    console.log(`   Found ${allLinks.length} product links`);
    
    let added = 0;
    allLinks.each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      
      // Skip duplicates
      if (!href || seenUrls.has(href)) return;
      
      // Get name from img alt attribute (primary source on hmizatchezsara)
      const img = $el.find('img');
      const name = img.attr('alt') || $el.attr('title') || $el.text().trim() || '';
      const imgSrc = img.attr('src') || img.attr('data-src') || '';
      const priceText = $el.closest('.product-item').find('.price, .product-price, .money').first().text().trim() ||
                        $el.parent().find('.price, .product-price, .money').first().text().trim() || '';
      
      if (name && href) {
        seenUrls.add(href);
        products.push({
          name,
          url: href.startsWith('http') ? href : `https://hmizatchezsara.com${href}`,
          image_url: imgSrc.startsWith('http') ? imgSrc : `https:${imgSrc}`,
          price: priceText,
        });
        added++;
      }
    });
    
    console.log(`   Added ${added} unique products this page`);
    
    if (added === 0) {
      console.log('   No new products found on this page.');
      break;
    }
    
    page++;
    await new Promise(r => setTimeout(r, 500));
  }
  
  return products.slice(0, TARGET_COUNT);
}

async function scrapeProductDetail(url: string): Promise<any> {
  const html = await fetchHtml(url);
  if (!html) return null;
  
  const $ = cheerio.load(html);
  
  const name = $('h1').first().text().trim();
  const priceText = $('.price').first().text().trim() || $('.product-price').first().text().trim() || '';
  const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  
  const brand = detectBrand(name);
  
  let description = '';
  $('.product-description, .description, [data-section-type="product-description"]').each((_, el) => {
    description += $(el).text().trim() + ' ';
  });
  description = description.trim() || name;
  
  const imageUrl = $('.product-main-image img').attr('src') || 
                   $('.product-images img').first().attr('src') || 
                   $('meta[property="og:image"]').attr('content') || '';
  
  return { name, price, description, brand, imageUrl };
}

async function main() {
  console.log('🚀 Scraper Vitamines started!');
  console.log(`   Collection: ${COLLECTION_URL}`);
  console.log(`   Target: ${TARGET_COUNT} products`);
  console.log(`   Images: ${IMAGES_DIR}\n`);
  
  // Créer le dossier images
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  
  // Scraper la liste
  const list = await scrapeProductList();
  console.log(`\n📦 Found ${list.length} products\n`);
  
  let imported = 0;
  let updated = 0;
  let errors = 0;
  
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    console.log(`[${i + 1}/${list.length}] ${item.name}...`);
    
    try {
      const detail = await scrapeProductDetail(item.url);
      if (!detail) {
        console.log('   ❌ Failed to scrape detail\n');
        errors++;
        continue;
      }
      
      const steps = detectSteps(detail.name, detail.description);
      const categories = detectCategories(detail.name, detail.description);
      const collections = detectCollections(detail.name, detail.description);
      
      console.log(`   📌 Categories: ${categories.join(', ')}`);
      console.log(`   📌 Collections: ${collections.join(', ')}`);
      if (steps.length > 0) {
        console.log(`   📌 Korean Beauty Steps: ${steps.join(', ')}`);
      }
      
      // Télécharger l'image
      let imagePath = '/products-vitamins/default.webp';
      if (item.image_url) {
        const safeName = slugify(detail.name).substring(0, 30);
        const filename = `vitamin_${Date.now()}_${i}.webp`;
        const downloaded = await downloadImage(item.image_url, filename);
        if (downloaded) {
          imagePath = downloaded;
        }
      }
      console.log(`   🖼️  Image: ${imagePath}`);
      
      // Upsert catégories
      const categoryIds: string[] = [];
      for (const catName of categories) {
        const catSlug = slugify(catName);
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: { name: catName, nameAr: catName, slug: catSlug, description: `Catégorie ${catName}` },
        });
        categoryIds.push(category.id);
      }
      
      // Upsert collections
      const collectionIds: string[] = [];
      for (const collName of collections) {
        const collSlug = slugify(collName);
        const collection = await prisma.collection.upsert({
          where: { slug: collSlug },
          update: {},
          create: { name: collName, nameAr: collName, slug: collSlug, description: `Collection ${collName}` },
        });
        collectionIds.push(collection.id);
      }
      
      // Si le produit appartient à Korean Beauty, ajouter la collection
      if (steps.length > 0) {
        const kbColl = await prisma.collection.upsert({
          where: { slug: 'korean-beauty' },
          update: {},
          create: { name: 'Korean Beauty', nameAr: 'Korean Beauty', slug: 'korean-beauty', description: 'Routine Korean Beauty' },
        });
        if (!collectionIds.includes(kbColl.id)) {
          collectionIds.push(kbColl.id);
        }
      }
      
      // Créer le produit
      const productData = {
        name: detail.name,
        nameAr: detail.name,
        brand: detail.brand,
        description: detail.description,
        descriptionAr: detail.description,
        price: detail.price,
        oldPrice: null as number | null,
        image: imagePath,
        stock: 50,
        badge: null as string | null,
        tags: [] as string[],
        isVisible: true,
        isArchived: false,
        koreanBeautyStep: steps.length > 0 ? steps[0] : null,
        categories: { connect: categoryIds.map(id => ({ id })) },
        collections: { connect: collectionIds.map(id => ({ id })) },
      };
      
      // Vérifier si le produit existe déjà
      const existing = await prisma.product.findFirst({
        where: { name: { contains: detail.name, mode: 'insensitive' } },
      });
      
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            ...productData,
            categories: { set: categoryIds.map(id => ({ id })) },
            collections: { set: collectionIds.map(id => ({ id })) },
          },
        });
        console.log(`   🔄 Updated product (steps: ${steps.join(', ')})\n`);
        updated++;
      } else {
        await prisma.product.create({ data: productData });
        console.log(`   ✅ Created new product (steps: ${steps.join(', ')})\n`);
        imported++;
      }
      
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
