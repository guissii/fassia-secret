import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_IMAGES_DIR = path.join(__dirname, 'public', 'images', 'scraped', 'parabioty');

const API_URL = 'http://127.0.0.1:5000/api';

// Auth is bypassed on backend, no token needed
const authHeaders = {};

// Fetch existing categories and collections, create missing ones
async function prepareCategoriesAndCollections() {
  const catRes = await axios.get(`${API_URL}/categories`);
  const collRes = await axios.get(`${API_URL}/collections`);

  const existingCategories = catRes.data.categories || [];
  const existingCollections = collRes.data.collections || [];

  const catMap = new Map(existingCategories.map(c => [c.name, c.id]));
  const collMap = new Map(existingCollections.map(c => [c.name, c.id]));

  // Create missing categories
  for (const catName of ['Compléments Alimentaires', 'Cheveux', 'Santé', 'Visage', 'Préoccupations', 'Premium Hair Care']) {
    if (!catMap.has(catName)) {
      const slug = catName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      try {
        const res = await axios.post(`${API_URL}/categories`, {
          name: catName,
          nameAr: '',
          slug,
          description: `Catégorie ${catName}`
        });
        catMap.set(catName, res.data.category.id);
        console.log(`  Created category: ${catName}`);
      } catch (err) {
        console.error(`  Failed to create category ${catName}:`, err.response?.data?.error || err.message);
      }
    }
  }

  // Create missing collections
  for (const collName of ['Cheveux', 'Ongles', 'Immunité', 'Compléments Alimentaires', 'Visage']) {
    if (!collMap.has(collName)) {
      const slug = collName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      try {
        const res = await axios.post(`${API_URL}/collections`, {
          name: collName,
          slug,
          page: 'general',
          order: 0
        });
        collMap.set(collName, res.data.collection.id);
        console.log(`  Created collection: ${collName}`);
      } catch (err) {
        console.error(`  Failed to create collection ${collName}:`, err.response?.data?.error || err.message);
      }
    }
  }

  return { catMap, collMap };
}

// Product URLs
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

const PRODUCT_METADATA = [
  { name: 'ACM NOVOPHANE Anti Chute 60 Gelules', brand: 'ACM', description: 'Complément alimentaire pour la chute de cheveux.', categories: ['Compléments Alimentaires', 'Cheveux'], collections: ['Cheveux'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: 'ACM Vitix 30Comprime', brand: 'ACM', description: 'VITIX protège les cellules contre le stress oxydatif.', categories: ['Compléments Alimentaires', 'Santé'], collections: ['Immunité'], tags: ['Complément', 'Antioxydant'], supplementFocus: 'immunity' },
  { name: 'ALLVIT 20 gelules', brand: 'ALLVIT', description: 'Complexe dynamisant avec ginseng.', categories: ['Compléments Alimentaires', 'Santé'], collections: ['Immunité'], tags: ['Complément', 'Énergie'], supplementFocus: 'immunity' },
  { name: 'Capiderma Capiphan ongles & cheveux 60 capsules', brand: 'Capiderma', description: 'Stimule la croissance des cheveux et ongles.', categories: ['Compléments Alimentaires', 'Cheveux'], collections: ['Cheveux', 'Ongles'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: 'DUCRAY Anacaps Reactiv 30 Capsules', brand: 'DUCRAY', description: 'Chute de cheveux réactive.', categories: ['Compléments Alimentaires', 'Cheveux'], collections: ['Cheveux'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: 'DUCRAY Anacaps Progressiv 30 Capsules', brand: 'DUCRAY', description: 'Chute de cheveux chronique.', categories: ['Compléments Alimentaires', 'Cheveux'], collections: ['Cheveux'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: 'Ecrinal Complément Alimentaire Cheveux et Ongles 30 Capsules', brand: 'Ecrinal', description: 'Force et beauté des ongles et cheveux.', categories: ['Compléments Alimentaires', 'Cheveux'], collections: ['Cheveux', 'Ongles'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: 'Forcapil Cheveux et Ongles Formule Fortifiante 180 GELULES', brand: 'Forcapil', description: 'Fortifiant cheveux et ongles.', categories: ['Compléments Alimentaires', 'Cheveux'], collections: ['Cheveux', 'Ongles'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: 'Levure de bière au sélénium', brand: 'Gayelord Hauser', description: 'Éclat cheveux, ongles et peau.', categories: ['Compléments Alimentaires', 'Cheveux', 'Visage'], collections: ['Cheveux', 'Visage'], tags: ['Complément', 'Cheveux'], supplementFocus: 'beauty' },
  { name: "Hydra Phyt's Vitamine C 500 mg - 36 gélules", brand: "Hydra Phyt's", description: 'Immunité et éclat de la peau.', categories: ['Compléments Alimentaires', 'Santé', 'Visage'], collections: ['Immunité', 'Visage'], tags: ['Complément', 'Vitamine C'], supplementFocus: 'immunity' },
];

async function fetchHTML(url) {
  const res = await axios.get(encodeURI(url), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Referer': 'https://www.parabioty.com/'
    },
    timeout: 30000
  });
  return res.data;
}

async function downloadImage(imageUrl, outputPath) {
  if (!imageUrl) return false;

  let fullUrl;
  if (imageUrl.startsWith('http')) fullUrl = imageUrl;
  else if (imageUrl.startsWith('//')) fullUrl = `https:${imageUrl}`;
  else if (imageUrl.startsWith('/')) fullUrl = `https://www.parabioty.com${imageUrl}`;
  else fullUrl = `https://www.parabioty.com/${imageUrl}`;

  try {
    const res = await axios.get(encodeURI(fullUrl), {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.parabioty.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });

    await sharp(Buffer.from(res.data))
      .webp({ quality: 85 })
      .toFile(outputPath);

    return true;
  } catch (err) {
    console.error(`  Image download failed: ${err.message}`);
    return false;
  }
}

async function scrapeProductPage(url) {
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim() || $('h2').first().text().trim();

  let description = '';
  const descSelectors = ['.product-description', '.description', '.short-description', '.product-summary', '.entry-content', '.woocommerce-product-details__short-description', '.product-details'];
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
  const imgSelectors = ['.woocommerce-product-gallery__wrapper img', '.product-main-image img', '.product-image img', 'meta[property="og:image"]'];
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

async function importProduct(product) {
  try {
    const res = await axios.post(`${API_URL}/products`, product, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`  -> Created: ${product.name} (ID: ${res.data.product?.id})`);
    return res.data;
  } catch (err) {
    console.error(`  ERROR creating product: ${err.response?.data?.error || err.message}`);
    return null;
  }
}

async function main() {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

  // Prepare categories and collections
  console.log('Preparing categories and collections...');
  const { catMap, collMap } = await prepareCategoriesAndCollections();
  console.log(`  Categories ready: ${catMap.size}`);
  console.log(`  Collections ready: ${collMap.size}\n`);

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < PRODUCT_URLS.length; i++) {
    const url = PRODUCT_URLS[i];
    const meta = PRODUCT_METADATA[i];

    console.log(`[${i + 1}/${PRODUCT_URLS.length}] Scraping ${meta.name}`);
    try {
      const details = await scrapeProductPage(url);
      const scrapedTitle = details.title || meta.name;
      const priceValue = parsePrice(details.price);

      // Download image
      let imageRelPath = '';
      if (details.imageUrl) {
        const safeName = scrapedTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const imageFilename = `${safeName}_${i}.webp`;
        const imagePath = path.join(PUBLIC_IMAGES_DIR, imageFilename);
        console.log(`  -> Downloading image...`);
        const ok = await downloadImage(details.imageUrl, imagePath);
        if (ok) {
          imageRelPath = `/images/scraped/parabioty/${imageFilename}`;
          console.log(`  -> Image saved: ${imageRelPath}`);
        }
      }

      // Map names to IDs
      const categoryIds = meta.categories.map(name => catMap.get(name)).filter(Boolean);
      const collectionIds = meta.collections.map(name => collMap.get(name)).filter(Boolean);

      // Prepare product payload
      const payload = {
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
        concerns: [],
        koreanBeautyStep: null,
        supplementFocus: meta.supplementFocus,
        makeupStep: null,
        categoryIds,
        collectionIds,
      };

      // Import via API
      const result = await importProduct(payload);
      if (result) imported++;
      else failed++;

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
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
