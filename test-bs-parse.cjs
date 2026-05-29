const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('test-bs.html', 'utf8');
const $ = cheerio.load(html);

console.log('product-item-info:', $('.product-item-info').length);
console.log('item-product:', $('.item-product').length);
console.log('.product:', $('.product').length);
console.log('data-role product-item:', $('[data-role="product-item"]').length);

let items = $('.product-item-info');
if (items.length === 0) items = $('.item-product');

if (items.length > 0) {
  items.slice(0, 5).each((i, el) => {
    const $el = $(el);
    console.log('--- Product ' + (i+1) + ' ---');
    console.log('Name:', $el.find('.product-item-name a, .product-name a, h3 a, h2 a, .product-title, a').first().text().trim());
    console.log('Price:', $el.find('.price, .product-price').first().text().trim());
    const img = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
    console.log('Img:', img.substring(0, 120));
    const href = $el.find('a').first().attr('href') || '';
    console.log('Link:', href.substring(0, 100));
  });
} else {
  console.log('No product items found');
}
