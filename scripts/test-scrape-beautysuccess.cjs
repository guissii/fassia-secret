/**
 * Test scraper beautysuccess.co/maquillage.html (sans DB, juste affichage)
 */

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://beautysuccess.co';
const URL = `${BASE_URL}/maquillage.html`;

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9',
  },
  timeout: 15000,
});

// Mapping étapes maquillage par mots-clés dans le nom
const MAKEUP_STEP_MAP = [
  { step: 1,  keywords: ['primer', 'base', 'fixateur', 'fixing', 'base de teint'] },
  { step: 2,  keywords: ['fond de teint', 'foundation', 'fond-de-teint', 'bb cream', 'cc cream', 'cushion'] },
  { step: 3,  keywords: ['correcteur', 'concealer', 'anticerne', 'anti-cerne', 'cover'] },
  { step: 4,  keywords: ['poudre', 'powder', 'compact', 'matifiant', 'setting powder'] },
  { step: 5,  keywords: ['blush', 'bronzer', 'contour', 'highlighter', 'illuminateur', 'enlumineur'] },
  { step: 6,  keywords: ['sourcil', 'eyebrow', 'brow', 'crayon sourcil', 'gel sourcil'] },
  { step: 7,  keywords: ['fard à paupière', 'eyeshadow', 'palette ombre', 'ombre à paupière'] },
  { step: 8,  keywords: ['eyeliner', 'crayon yeux', 'khol', 'khôl', 'eye liner'] },
  { step: 9,  keywords: ['mascara', 'volume', 'allongeant', 'cils'] },
  { step: 10, keywords: ['rouge à lèvres', 'lipstick', 'gloss', 'baume lèvre', 'crayon lèvre', 'mat lip'] },
  { step: 11, keywords: ['fixateur', 'fixing spray', 'brume fixatrice', 'makeup fix', 'setting spray'] },
];

function detectMakeupStep(name) {
  const lower = name.toLowerCase();
  for (const { step, keywords } of MAKEUP_STEP_MAP) {
    if (keywords.some(k => lower.includes(k))) return step;
  }
  return null;
}

async function main() {
  console.log('🚀 Test scraping Beauty Success Maquillage...\n');

  try {
    const response = await axiosInstance.get(URL);
    const html = response.data;
    const $ = cheerio.load(html);

    // Try common Magento/Magento2 product selectors
    const selectors = [
      '.product-item-info',
      '.product-item',
      '.item.product',
      '[data-role="product-item"]',
      '.product',
      '.product-list .item',
      '.catalog-product',
    ];

    let items = null;
    let usedSelector = '';
    for (const sel of selectors) {
      items = $(sel);
      if (items.length > 0) {
        usedSelector = sel;
        break;
      }
    }

    console.log(`Selector used: "${usedSelector}" — ${items.length} items found\n`);

    if (items.length === 0) {
      // Fallback: look for any product links
      const links = $('a[href*="/maquillage/"], a[href*="/product/"], .product-name a');
      console.log(`Fallback: ${links.length} product links found`);
    }

    let count = 0;
    items.each((_, el) => {
      const $el = $(el);

      // Try multiple selectors for name
      const name = ($el.find('.product-item-name a, .product-name a, .product-title, h3 a, h2 a, .name a, a.product').first().text() || '').replace(/\s+/g, ' ').trim();

      // Price
      const priceText = $el.find('.price, .special-price .price, .product-price, .old-price .price').first().text().trim();
      const priceMatch = priceText.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

      // Old price
      const oldPriceText = $el.find('.old-price .price, .was-price, .original-price').first().text().trim();
      const oldPriceMatch = oldPriceText.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/);
      const oldPrice = oldPriceMatch ? parseFloat(oldPriceMatch[0]) : undefined;

      // Image
      let imageUrl = $el.find('img').attr('data-src') ||
                     $el.find('img').attr('data-original') ||
                     $el.find('img').attr('src') || '';
      if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      else if (imageUrl && !imageUrl.startsWith('http')) imageUrl = BASE_URL + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;

      // Brand
      const brand = ($el.find('.product-brand, .brand, .manufacturer').first().text() || name.split(' ')[0] || 'Beauty Success').trim();

      if (name) {
        count++;
        const step = detectMakeupStep(name);
        console.log(`--- Product ${count} ---`);
        console.log(`  Name:  ${name}`);
        console.log(`  Brand: ${brand}`);
        console.log(`  Price: ${price} DH${oldPrice && oldPrice > price ? ` (old: ${oldPrice})` : ''}`);
        console.log(`  Image: ${imageUrl.substring(0, 80)}...`);
        console.log(`  Step:  ${step ? `Maquillage Étape ${step}` : 'none'}`);
        console.log('');
        if (count >= 12) return false; // break after 12
      }
    });

    if (count === 0) {
      console.log('No products found. Checking page structure...');
      const bodyText = $('body').text().substring(0, 800);
      console.log('Page text snippet:', bodyText);
    } else {
      console.log(`\n🎉 Found ${count} products`);
    }

  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

main();
