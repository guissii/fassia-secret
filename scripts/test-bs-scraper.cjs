/**
 * Test local du scraper Beauty Success (sans DB)
 */

const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('test-bs.html', 'utf8');
const $ = cheerio.load(html);

const MAKEUP_STEP_MAP = [
  { step: 1,  keywords: ['primer', 'base', 'fixateur', 'fixing', 'base de teint'] },
  { step: 2,  keywords: ['fond de teint', 'foundation', 'bb cream', 'cc cream', 'cushion', 'terracota joli teint', 'terracotta le teint', 'parure gold'] },
  { step: 3,  keywords: ['correcteur', 'concealer', 'anticerne', 'anti-cerne', 'cover', 'terracotta correcteur'] },
  { step: 4,  keywords: ['poudre', 'powder', 'compact', 'matifiant', 'setting powder', 'perles de poudre'] },
  { step: 5,  keywords: ['blush', 'bronzer', 'contour', 'highlighter', 'illuminateur', 'enlumineur', 'fard à joues', 'terracotta le fard'] },
  { step: 6,  keywords: ['sourcil', 'eyebrow', 'brow', 'crayon sourcil', 'gel sourcil'] },
  { step: 7,  keywords: ['fard à paupière', 'eyeshadow', 'palette ombre', 'ombre à paupière', 'ombres à paupières'] },
  { step: 8,  keywords: ['eyeliner', 'crayon yeux', 'khol', 'khôl', 'eye liner', 'crayon yeux'] },
  { step: 9,  keywords: ['mascara', 'volume', 'allongeant', 'cils'] },
  { step: 10, keywords: ['rouge à lèvres', 'lipstick', 'gloss', 'baume lèvre', 'crayon lèvre', 'mat lip', 'huile à lèvres', 'kiss kiss'] },
  { step: 11, keywords: ['fixateur', 'fixing spray', 'brume fixatrice', 'makeup fix', 'setting spray'] },
];

function detectMakeupStep(name) {
  const lower = name.toLowerCase();
  for (const { step, keywords } of MAKEUP_STEP_MAP) {
    if (keywords.some(k => lower.includes(k))) return step;
  }
  return null;
}

function detectCollections(name) {
  const lower = name.toLowerCase();
  const collections = ['Maquillage'];
  const COLLECTION_MAP = {
    'Teint': ['fond de teint', 'poudre', 'blush', 'bronzer', 'correcteur', 'highlighter', 'contour', 'primer', 'base', 'terracotta', 'parure gold'],
    'Yeux': ['mascara', 'eyeliner', 'fard à paupière', 'crayon yeux', 'khol', 'ombre', 'sourcil', 'brow'],
    'Lèvres': ['rouge à lèvres', 'lipstick', 'gloss', 'baume lèvre', 'crayon lèvre', 'huile à lèvres', 'kiss'],
  };
  for (const [collName, keywords] of Object.entries(COLLECTION_MAP)) {
    if (keywords.some(k => lower.includes(k))) collections.push(collName);
  }
  return collections;
}

const products = [];
const seen = new Set();

// Approach: find the script containing dataLayer and extract items array manually
const scripts = $('script').toArray();
for (const el of scripts) {
  const text = $(el).text();
  if (text.includes('"view_item_list"') && text.includes('"items"')) {
    try {
      // Find the items array using regex
      const itemsMatch = text.match(/"items"\s*:\s*(\[[\s\S]*?\])\s*\}/);
      if (itemsMatch) {
        let itemsJson = itemsMatch[1];
        // Fix escaped unicode
        itemsJson = itemsJson.replace(/\\u00c8/g, 'È').replace(/\\u00c9/g, 'É').replace(/\\u00c0/g, 'À');
        itemsJson = itemsJson.replace(/\\u00d9/g, 'Ù').replace(/\\u00d4/g, 'Ô').replace(/\\u00ce/g, 'Î');
        // Fix URL escaping
        itemsJson = itemsJson.replace(/\\\//g, '/');
        const items = JSON.parse(itemsJson);
        for (const item of items) {
          const name = (item.item_name || '').replace(/\s+/g, ' ').trim();
          const price = parseFloat(item.price) || 0;
          const itemId = item.item_id || '';
          const idClean = itemId.replace(/\D/g, '');
          const imageUrl = idClean
            ? `https://beautysuccess.co/media/catalog/product/cache/f421fe0f052247c7b48ffd84b7f05cfe/${idClean.substring(0, 1)}/${idClean.substring(1, 2)}/${idClean}.jpg`
            : '';

          if (name && price > 0 && !seen.has(name)) {
            seen.add(name);
            const step = detectMakeupStep(name);
            const cols = detectCollections(name);
            products.push({ name, price, imageUrl, step, collections: cols });
          }
        }
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  }
}

console.log(`Found ${products.length} unique products\n`);
for (const p of products.slice(0, 12)) {
  console.log(`Name:  ${p.name}`);
  console.log(`Price: ${p.price} DH`);
  console.log(`Step:  ${p.step ? 'Maquillage Étape ' + p.step : 'none'}`);
  console.log(`Coll:  ${p.collections.join(', ')}`);
  console.log(`Img:   ${p.imageUrl.substring(0, 100)}`);
  console.log('');
}
