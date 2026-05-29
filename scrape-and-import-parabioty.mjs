import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const PUBLIC_IMAGES_DIR = path.join(__dirname, 'public', 'images', 'scraped', 'parabioty');

// Known product URLs from parabioty.com (Vitamines et Compléments)
const PRODUCT_URLS = [
  'https://www.parabioty.com/product/acm-novophane-anti-chute-60-gelules',
  'https://www.parabioty.com/product/acm-vitix-30comprime',
  'https://www.parabioty.com/product/allvit-20-gelules',
  'https://www.parabioty.com/product/capiderma-capiphan-ongles-and-cheveux-60-capsules',
  'https://www.parabioty.com/product/ducray-anacaps-reactiv-30-capsules',
  'https://www.parabioty.com/product/ducray-anacaps-progressiv-30-capsules',
  'https://www.parabioty.com/product/ecrinal-compl-ment-alimentaire-cheveux-et-ongles-30-capsules',
  'https://www.parabioty.com/product/forcapil-cheveux-et-ongles-formule-fortifiante-180-gelules',
  'https://www.parabioty.com/product/levure-de-bi-re-au-s-l-nium',
  'https://www.parabioty.com/product/hydra-phyts-vitamine-c-500-mg-36-g-lules',
];

const LIMIT = 10;

async function fetchHTML(url) {
  const res = await axios.get(encodeURI(url), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9'
    },
    timeout: 30000
  });
  return res.data;
}

async function downloadImage(imageUrl, outputPath) {
  if (!imageUrl) return false;
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.parabioty.com${imageUrl}`;
  try {
    const res = await axios.get(encodeURI(fullUrl), {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    fs.writeFileSync(outputPath, Buffer.from(res.data));
    return true;
  } catch (err) {
    console.error(`Image download failed: ${err.message}`);
    return false;
  }
}

async function scrapeProductPage(url) {
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim() || $('h2').first().text().trim();

  let description = '';
  const descSelectors = [
    '.product-description', '.description', '.short-description',
    '.product-summary', '.entry-content',
    '.woocommerce-product-details__short-description', '.product-details'
  ];
  for (const sel of descSelectors) {
    const text = $(sel).first().text().trim();
    if (text.length > description.length && text.length < 1000) description = text;
  }

  let price = '';
  const priceSelectors = ['.woocommerce-Price-amount', '.price .amount', '.product-price', '.price'];
  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim();
    if (text && /\d/.test(text)) { price = text; break; }
  }

  let imageUrl = '';
  const imgSelectors = [
    '.woocommerce-product-gallery__wrapper img',
    '.product-main-image img', '.product-image img',
    'meta[property="og:image"]'
  ];
  for (const sel of imgSelectors) {
    if (sel.startsWith('meta')) imageUrl = $(sel).attr('content') || '';
    else imageUrl = $(sel).first().attr('src') || $(sel).first().attr('data-src') || '';
    if (imageUrl) break;
  }
  if (imageUrl && imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;

  return { title, description, price, imageUrl };
}

function parsePrice(priceText) {
  if (!priceText) return 0;
  const match = priceText.replace(/,/g, '.').match(/(\d+[.,]?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

// Product metadata with corrected categories and focus
const PRODUCT_METADATA = [
  {
    name: 'ACM NOVOPHANE Anti Chute 60 Gelules',
    brand: 'ACM',
    description: 'Complément alimentaire pour la chute de cheveux. Formule fortifiante avec vitamines et minéraux essentiels.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Anti-chute'],
    supplementFocus: 'beauty',
  },
  {
    name: 'ACM Vitix 30Comprime',
    brand: 'ACM',
    description: 'VITIX comprimés aide à protéger les cellules contre le stress oxydatif. Formule originale associant un extrait végétal de melon breveté à un ensemble de vitamines (C, E, B9, B12) et de minéraux (Sélénium, Cuivre, Zinc).',
    categories: ['Compléments Alimentaires', 'Santé', 'Préoccupations'],
    collections: ['Immunité', 'Compléments Alimentaires'],
    concerns: ['Immunité', 'Stress oxydatif'],
    tags: ['Complément', 'Alimentaire', 'Antioxydant', 'Vitamines'],
    supplementFocus: 'immunity',
  },
  {
    name: 'ALLVIT 20 gelules',
    brand: 'ALLVIT',
    description: 'Complexe dynamisant, stimulant et fortifiant à base de vitamines, minéraux, oligo-élément et ginseng. ALLVIT est spécialement formulé pour donner à l\'organisme de l\'énergie, vigueur et vitalité en cas de fatigue.',
    categories: ['Compléments Alimentaires', 'Santé', 'Préoccupations'],
    collections: ['Immunité', 'Compléments Alimentaires'],
    concerns: ['Immunité', 'Fatigue'],
    tags: ['Complément', 'Alimentaire', 'Énergie', 'Ginseng'],
    supplementFocus: 'immunity',
  },
  {
    name: 'Capiderma Capiphan ongles & cheveux 60 capsules',
    brand: 'Capiderma',
    description: 'Supplément vitaminique et minéral, stimule la croissance et régénérescence des phanères. Formule basée sur un complexe riche en vitamines et minéraux.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Ongles', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux', 'Ongles cassants'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Ongles', 'Vitamines'],
    supplementFocus: 'beauty',
  },
  {
    name: 'DUCRAY Anacaps Reactiv 30 Capsules',
    brand: 'DUCRAY',
    description: 'Complément alimentaire pour la chute de cheveux réactive (stress, fatigue, saisonnière). Formule concentrée en vitamines B, fer, zinc et sélénium.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux', 'Cheveux fins'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Anti-chute', 'Reactiv'],
    supplementFocus: 'beauty',
  },
  {
    name: 'DUCRAY Anacaps Progressiv 30 Capsules',
    brand: 'DUCRAY',
    description: 'ANACAPS PROGRESSIV contribue à préserver le capital capillaire en cas de chute de cheveux chronique (hormonale, vasculaire, héréditaire). Formule avec FER, ZINC, SELENIUM, MOLYBDENE et 6 vitamines.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux', 'Cheveux fins'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Anti-chute', 'Progressiv'],
    supplementFocus: 'beauty',
  },
  {
    name: 'Ecrinal Complément Alimentaire Cheveux et Ongles 30 Capsules',
    brand: 'Ecrinal',
    description: 'Complément alimentaire pour la force et beauté des ongles et cheveux. Formule riche en cystine, silicium, vitamines B3, B5, B6, B8 et huile de bourrache.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Ongles', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux', 'Ongles cassants'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Ongles', 'Ecrinal'],
    supplementFocus: 'beauty',
  },
  {
    name: 'Forcapil Cheveux et Ongles Formule Fortifiante 180 GELULES',
    brand: 'Forcapil',
    description: 'Complément alimentaire fortifiant pour cheveux et ongles. Formule riche en vitamines du groupe B, minéraux et acides aminés essentiels.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Ongles', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux', 'Ongles cassants'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Ongles', 'Fortifiant'],
    supplementFocus: 'beauty',
  },
  {
    name: 'Levure de bière au sélénium',
    brand: 'Gayelord Hauser',
    description: 'Levure de Bière et Sélénium avec germes de blé, vitamine E et sélénium. Contribue à l\'éclat des cheveux et ongles. Antioxydants pour préserver le capital jeunesse de la peau.',
    categories: ['Compléments Alimentaires', 'Cheveux', 'Visage', 'Préoccupations', 'Premium Hair Care'],
    collections: ['Cheveux', 'Visage', 'Compléments Alimentaires'],
    concerns: ['Chute de cheveux', 'Ongles cassants', 'Peau sèche'],
    tags: ['Complément', 'Alimentaire', 'Cheveux', 'Peau', 'Antioxydant'],
    supplementFocus: 'beauty',
  },
  {
    name: 'Hydra Phyt\'s Vitamine C 500 mg - 36 gélules',
    brand: 'Hydra Phyt\'s',
    description: 'Vitamine C 500 mg. Réputée pour son action contre la fatigue et soutient le système immunitaire. Puissant antioxydant pour l\'éclat de la peau.',
    categories: ['Compléments Alimentaires', 'Santé', 'Visage', 'Préoccupations'],
    collections: ['Immunité', 'Visage', 'Compléments Alimentaires'],
    concerns: ['Immunité', 'Fatigue', 'Teint terne'],
    tags: ['Complément', 'Alimentaire', 'Vitamine C', 'Immunité', 'Antioxydant'],
    supplementFocus: 'immunity',
  },
];

async function getOrCreateCategory(name) {
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { name, nameAr: '', slug, description: `Catégorie ${name}`, page: 'general', order: 0 }
    });
    console.log(`  -> Created category: ${name}`);
  }
  return cat;
}

async function getOrCreateCollection(name) {
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let coll = await prisma.collection.findUnique({ where: { slug } });
  if (!coll) {
    coll = await prisma.collection.create({
      data: { name, slug, description: `Collection ${name}`, page: 'general', order: 0 }
    });
    console.log(`  -> Created collection: ${name}`);
  }
  return coll;
}

async function main() {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < Math.min(PRODUCT_URLS.length, LIMIT); i++) {
    const url = PRODUCT_URLS[i];
    const meta = PRODUCT_METADATA[i];

    console.log(`\n[${i + 1}/${Math.min(PRODUCT_URLS.length, LIMIT)}] Scraping ${url}`);
    try {
      const details = await scrapeProductPage(url);
      const scrapedTitle = details.title || meta.name;
      const priceValue = parsePrice(details.price);

      // Download image
      let imageFilename = '';
      let imageRelPath = '';
      if (details.imageUrl) {
        const safeName = scrapedTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        imageFilename = `${safeName}_${i}.jpg`;
        const imagePath = path.join(PUBLIC_IMAGES_DIR, imageFilename);
        console.log(`  -> Downloading image...`);
        const ok = await downloadImage(details.imageUrl, imagePath);
        if (ok) {
          imageRelPath = `/images/scraped/parabioty/${imageFilename}`;
          console.log(`  -> Image saved: ${imageRelPath}`);
        }
      }

      // Get or create categories
      const categoryIds = [];
      for (const catName of meta.categories) {
        const cat = await getOrCreateCategory(catName);
        categoryIds.push({ id: cat.id });
      }

      // Get or create collections
      const collectionIds = [];
      for (const collName of meta.collections) {
        const coll = await getOrCreateCollection(collName);
        collectionIds.push({ id: coll.id });
      }

      // Check if product already exists
      const existing = await prisma.product.findFirst({
        where: { name: scrapedTitle.substring(0, 100) }
      });
      if (existing) {
        console.log(`  -> Product already exists: ${scrapedTitle}`);
        skipped++;
        continue;
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          name: scrapedTitle.substring(0, 100),
          nameAr: '',
          brand: meta.brand,
          description: (details.description || meta.description).substring(0, 500),
          descriptionAr: '',
          price: priceValue || 99,
          oldPrice: priceValue ? Math.round(priceValue * 1.2) : null,
          stock: 10,
          image: imageRelPath,
          isVisible: true,
          isArchived: false,
          isEssential: false,
          salesCount: 0,
          tags: meta.tags,
          concerns: meta.concerns,
          koreanBeautyStep: null,
          supplementFocus: meta.supplementFocus,
          makeupStep: null,
          categories: { connect: categoryIds },
          collections: { connect: collectionIds },
        }
      });

      console.log(`  -> Created product: ${product.name} (ID: ${product.id})`);
      imported++;

      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Done! ${imported} imported, ${failed} failed.`);
  console.log(`Images -> ${path.resolve(PUBLIC_IMAGES_DIR)}`);
  console.log(`========================================`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
