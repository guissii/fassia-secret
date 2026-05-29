import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = path.join(__dirname, 'scraped_parabioty');
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

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

  // Description
  let description = '';
  const descSelectors = [
    '.product-description',
    '.description',
    '.short-description',
    '.product-summary',
    '.entry-content',
    '.woocommerce-product-details__short-description',
    '.product-details'
  ];
  for (const sel of descSelectors) {
    const text = $(sel).first().text().trim();
    if (text.length > description.length && text.length < 1000) description = text;
  }

  // Price
  let price = '';
  const priceSelectors = [
    '.woocommerce-Price-amount',
    '.price .amount',
    '.product-price',
    '.price'
  ];
  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim();
    if (text && /\d/.test(text)) {
      price = text;
      break;
    }
  }

  // Main image
  let imageUrl = '';
  const imgSelectors = [
    '.woocommerce-product-gallery__wrapper img',
    '.product-main-image img',
    '.product-image img',
    'meta[property="og:image"]'
  ];
  for (const sel of imgSelectors) {
    if (sel.startsWith('meta')) {
      imageUrl = $(sel).attr('content') || '';
    } else {
      imageUrl = $(sel).first().attr('src') || $(sel).first().attr('data-src') || '';
    }
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

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const results = [];
  for (let i = 0; i < Math.min(PRODUCT_URLS.length, LIMIT); i++) {
    const url = PRODUCT_URLS[i];
    console.log(`\n[${i + 1}/${Math.min(PRODUCT_URLS.length, LIMIT)}] Scraping ${url}`);
    try {
      const details = await scrapeProductPage(url);

      let imageFilename = '';
      if (details.imageUrl) {
        const safeName = (details.title || `product_${i}`).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        imageFilename = `${safeName}_${i}.jpg`;
        const imagePath = path.join(IMAGES_DIR, imageFilename);
        console.log(`  -> Downloading image...`);
        await downloadImage(details.imageUrl, imagePath);
      }

      const priceValue = parsePrice(details.price);

      results.push({
        name: (details.title || `Produit ${i + 1}`).substring(0, 100),
        nameAr: '',
        brand: 'Parabioty',
        description: (details.description || '').substring(0, 500),
        descriptionAr: '',
        price: priceValue || 99,
        oldPrice: priceValue ? Math.round(priceValue * 1.2) : 0,
        image: imageFilename ? `/scraped_parabioty/images/${imageFilename}` : '',
        categories: ['Compléments Alimentaires'],
        collections: [],
        concerns: [],
        isVisible: true,
        isArchived: false,
        isEssential: false,
        salesCount: 0,
        stock: 10,
        tags: ['Complément', 'Alimentaire'],
        koreanBeautyStep: null,
        supplementFocus: 'sleep',
        makeupStep: null
      });

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  // Save JSON for import
  const jsonPath = path.join(OUTPUT_DIR, 'products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`\nDone! ${results.length} products scraped.`);
  console.log(`Images -> ${path.resolve(IMAGES_DIR)}`);
  console.log(`JSON   -> ${path.resolve(jsonPath)}`);

  return results;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
