/**
 * Test scraper universparadiscount.ma (sans DB, juste affichage)
 * Usage: npx tsx scripts/test-scrape-paradiscount.ts
 */

import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://universparadiscount.ma';
const COLLECTION_PATH = '/376-vitamines-et-formes';

function fetchHtml(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode !== 200) { console.log(`   HTTP ${res.statusCode}`); resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (e) => { console.log(`   Error: ${e.message}`); resolve(null); });
  });
}

function parsePrice(priceStr: string): number {
  const match = priceStr.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

async function main() {
  console.log('🚀 Test scraping Univers Paradiscount...\n');

  const url = `${BASE_URL}${COLLECTION_PATH}`;
  console.log(`📄 Fetching: ${url}`);
  const html = await fetchHtml(url);
  if (!html) {
    console.log('❌ Failed to fetch page');
    return;
  }

  const $ = cheerio.load(html);

  // Try multiple PrestaShop selectors
  const selectors = [
    '.product-miniature',
    '.js-product-miniature',
    '.item-product',
    '.product-container',
    '.product-list-item',
    '.thumbnail-container',
    '[data-id-product]',
  ];

  let items: any = null;
  let usedSelector = '';
  for (const sel of selectors) {
    items = $(sel);
    if (items.length > 0) {
      usedSelector = sel;
      break;
    }
  }

  if (!items || items.length === 0) {
    console.log('❌ No products found. Trying fallback...');
    // Fallback: look for any img with product link
    const links = $('a[href*="/produit"], a[href*="/product"], a[href*="/vitamine"], .product-title a');
    console.log(`   Found ${links.length} potential product links`);
    items = links.slice(0, 5);
  }

  console.log(`\n✅ Found ${items.length} products with selector: "${usedSelector}"\n`);

  let count = 0;
  items.each((_: number, el: any) => {
    const $el = $(el);

    // Name
    const name = $el.find('.product-title a, .product-name a, h3 a, h2 a, .product-title, .product-name, .h3').first().text().replace(/\s+/g, ' ').trim();

    // Price
    const priceText = $el.find('.price, .current-price, .product-price, .regular-price, .current-price-display').first().text();
    const price = parsePrice(priceText);

    // Old price
    const oldPriceText = $el.find('.old-price, .regular-price.crossed, .product-discount').first().text();
    const oldPrice = oldPriceText ? parsePrice(oldPriceText) : undefined;

    // Image
    let imageUrl = $el.find('img').attr('data-src') ||
                   $el.find('img').attr('data-original') ||
                   $el.find('img').attr('src') || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = imageUrl.startsWith('/') ? `${BASE_URL}${imageUrl}` : `${BASE_URL}/${imageUrl}`;
    }

    if (name) {
      count++;
      console.log(`--- Product ${count} ---`);
      console.log(`  Name: ${name}`);
      console.log(`  Price: ${price} DH${oldPrice && oldPrice > price ? ` (old: ${oldPrice} DH)` : ''}`);
      console.log(`  Image: ${imageUrl.substring(0, 80)}...`);
      console.log('');
    }
  });

  if (count === 0) {
    console.log('❌ No valid products extracted. Dumping page structure...');
    const bodyText = $('body').text().substring(0, 500);
    console.log('Page text snippet:', bodyText);
  } else {
    console.log(`\n🎉 Successfully extracted ${count} products!`);
  }
}

main();
