const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('test-page.html', 'utf8');
const $ = cheerio.load(html);

const scripts = $('script').toArray();
let found = 0;

for (const el of scripts) {
  const text = $(el).text();
  if (text.includes('"ecommerce"') && text.includes('"items"')) {
    const m = text.match(/cdcDatalayer\s*=\s*(\{.*?\});/s);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const items = data && data.ecommerce && data.ecommerce.items ? data.ecommerce.items : [];
        console.log('Found', items.length, 'items in dataLayer');
        for (const item of items.slice(0, 5)) {
          console.log(' -', item.item_name, '|', item.price, 'DH | brand:', item.item_brand, '| id:', item.item_id);
        }
        found = items.length;
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    }
  }
}

if (found === 0) {
  console.log('No dataLayer found, trying JSON-LD...');
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).text());
      if (json['@type'] === 'ItemList' && Array.isArray(json.itemListElement)) {
        console.log('Found', json.itemListElement.length, 'items in JSON-LD');
        for (const item of json.itemListElement.slice(0, 3)) {
          console.log(' -', item.name, '|', item.url);
        }
        found = json.itemListElement.length;
      }
    } catch (e) {}
  });
}

console.log('\nTotal products found:', found);
