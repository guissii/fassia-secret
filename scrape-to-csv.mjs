import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const COLLECTION_URL = 'https://hmizatchezsara.com/collections/korean-japanese-shop-2';
const COLLECTION_SOURCE = 'korean-japanese-shop-2'; // matches existing Collection.slug or page
const OUTPUT_DIR = 'scraped_korean_japanese';
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');
const CSV_FILE = path.join(OUTPUT_DIR, 'products.csv');
const LIMIT = 10;

async function fetchHTML(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    timeout: 30000
  });
  return res.data;
}

function extractProductsFromCollection(html) {
  const $ = cheerio.load(html);
  const products = [];
  const seenUrls = new Set();

  // Try multiple common Shopify selectors
  const itemSelectors = [
    '.product-card',
    '.card--product',
    '.grid__item .card',
    '.product-item',
    '[data-product-id]',
    '.product-list .product',
    '#product-grid .grid__item',
    '.collection-grid .grid__item'
  ];

  for (const sel of itemSelectors) {
    $(sel).each((i, el) => {
      if (products.length >= LIMIT) return false;
      const $el = $(el);
      const linkEl = $el.find('a[href*="/products/"]').first();
      let href = linkEl.attr('href');
      if (!href) {
        href = $el.find('a').first().attr('href');
      }
      if (!href || !href.includes('/products/')) return;

      const url = href.startsWith('http') ? href : `https://hmizatchezsara.com${href}`;
      if (seenUrls.has(url)) return;
      seenUrls.add(url);

      const title = $el.find('.product-card__title, .card__heading, h3, .product-item__title, .product-card-title').text().trim() ||
                    linkEl.find('img').attr('alt') ||
                    $el.find('img').attr('alt');
      let img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || linkEl.find('img').attr('src');
      if (img && img.startsWith('//')) img = `https:${img}`;
      const priceText = $el.find('.price, .price-item, .money, .product-price, .current-price, [class*="price"]').first().text().trim();

      if (title) {
        products.push({ title, url, imageUrl: img, priceText });
      }
    });
    if (products.length >= LIMIT) break;
  }

  // Fallback: scrape all product links from the page
  if (products.length === 0) {
    $('a[href*="/products/"]').each((i, el) => {
      if (products.length >= LIMIT) return false;
      const href = $(el).attr('href').split('?')[0];
      const url = href.startsWith('http') ? href : `https://hmizatchezsara.com${href}`;
      if (seenUrls.has(url)) return;
      seenUrls.add(url);

      const title = $(el).text().trim() || $(el).find('img').attr('alt');
      let img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
      if (img && img.startsWith('//')) img = `https:${img}`;

      if (title && title.length > 3) {
        products.push({ title, url, imageUrl: img, priceText: '' });
      }
    });
  }

  return products.slice(0, LIMIT);
}

async function scrapeProductPage(url) {
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim();

  // Brand: usually a link to a vendor/collections page
  let brand = '';
  $('a[href*="/collections/"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    // Brand links are usually /collections/brand-name with single path segment
    const parts = href.split('/').filter(Boolean);
    if (parts.length === 1 && parts[0] !== 'korean-japanese-shop-2') {
      const txt = $(el).text().trim();
      if (txt && txt.length < 50) brand = txt;
    }
  });

  // Description
  let description = '';
  const descSelectors = [
    '.product__description',
    '.product-description',
    '[data-product-description]',
    '.description',
    '.rte',
    '#product-description',
    '.product-details__block',
    '.product-info__description'
  ];
  for (const sel of descSelectors) {
    const text = $(sel).first().text().trim();
    if (text.length > description.length) description = text;
  }

  // Price
  let price = '';
  const priceSelectors = [
    '.price-item--regular',
    '.price__regular .price-item',
    '.product-price__regular',
    '.price:not(.price--on-sale) .price-item',
    '.current-price',
    '.money',
    '[class*="price"]'
  ];
  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim();
    if (text && (text.includes('DZD') || text.includes('DA') || /\d/.test(text))) {
      price = text;
      break;
    }
  }
  if (!price) {
    price = $('.price').first().text().trim();
  }

  // Main image - try high-res first
  let imageUrl = '';
  const imgSelectors = [
    '.product__media img',
    '.product-media img',
    '.product-single__media img',
    '.product-main-image img',
    '.product-featured-media',
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

  return { title, brand, description, price, imageUrl };
}

async function downloadAndConvertToWebp(imageUrl, outputPath) {
  if (!imageUrl) return false;
  // Get full resolution by removing size suffix
  const fullUrl = imageUrl.replace(/_\d+x\.(jpg|jpeg|png|webp)/i, '.$1').replace(/_crop_center\?v=/, '?v=');
  const res = await axios.get(fullUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  await sharp(Buffer.from(res.data)).webp({ quality: 85 }).toFile(outputPath);
  return true;
}

function escapeCsv(value) {
  if (value == null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  console.log('Fetching collection page...');
  const html = await fetchHTML(COLLECTION_URL);

  console.log('Extracting product list...');
  const products = extractProductsFromCollection(html);
  console.log(`Found ${products.length} products`);

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${p.title}`);
    try {
      const details = await scrapeProductPage(p.url);
      const imageUrl = details.imageUrl || p.imageUrl;

      let imageFilename = '';
      if (imageUrl) {
        const safeName = (details.title || p.title).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 40);
        imageFilename = `${safeName}_${i}.webp`;
        const imagePath = path.join(IMAGES_DIR, imageFilename);
        console.log(`  -> Downloading image...`);
        await downloadAndConvertToWebp(imageUrl, imagePath);
      }

      results.push({
        name: details.title || p.title,
        brand: details.brand,
        price: details.price || p.priceText,
        description: details.description,
        image: imageFilename,
        url: p.url,
        collectionSource: COLLECTION_SOURCE,
        koreanBeautyStep: '', // fill manually after scraping: 1-10
        categories: ''       // fill manually: comma-separated existing category slugs
      });

      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  // Write CSV
  const headers = ['name', 'brand', 'price', 'description', 'image', 'url', 'collection_source', 'korean_beauty_step', 'categories'];
  const rows = results.map(r => [
    escapeCsv(r.name),
    escapeCsv(r.brand),
    escapeCsv(r.price),
    escapeCsv(r.description),
    escapeCsv(r.image),
    escapeCsv(r.url),
    escapeCsv(r.collectionSource),
    escapeCsv(r.koreanBeautyStep),
    escapeCsv(r.categories)
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(CSV_FILE, '\uFEFF' + csv, 'utf8'); // BOM for Excel

  console.log(`\nDone! ${results.length} products scraped.`);
  console.log(`Images -> ${path.resolve(IMAGES_DIR)}`);
  console.log(`CSV    -> ${path.resolve(CSV_FILE)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
