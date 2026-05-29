import fs from 'fs';

const html = await fetch('https://hmizatchezsara.com/collections/vitamines?page=1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html',
  }
}).then(r => r.text());

const cheerio = await import('cheerio');
const $ = cheerio.load(html);

// Debug: show structure around first product link
const firstLink = $('a[href*="/products/"]').first();
console.log('=== First product link structure ===');
console.log('href:', firstLink.attr('href'));
console.log('title:', firstLink.attr('title'));
console.log('text:', firstLink.text().trim().substring(0, 100));
console.log('html:', firstLink.html()?.substring(0, 300));

// Try to find product name from image alt
const img = firstLink.find('img');
console.log('img alt:', img.attr('alt'));
console.log('img src:', img.attr('src'));

// Look for parent container
const parent = firstLink.closest('div, li, article');
console.log('\nParent classes:', parent.attr('class'));
console.log('Parent text:', parent.text().trim().substring(0, 200));

// Find all product containers
console.log('\n=== All product containers ===');
const containers = $('a[href*="/products/"]');
containers.each((i, el) => {
  const $el = $(el);
  const href = $el.attr('href') || '';
  const title = $el.attr('title') || '';
  const alt = $el.find('img').attr('alt') || '';
  const imgSrc = $el.find('img').attr('src') || '';
  
  if (i < 3) {
    console.log(`\nProduct ${i+1}:`);
    console.log('  href:', href);
    console.log('  title:', title);
    console.log('  alt:', alt);
    console.log('  img:', imgSrc);
  }
});
