import fs from 'fs';

const html = await fetch('https://hmizatchezsara.com/collections/vitamines?page=1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html',
  }
}).then(r => r.text());

fs.writeFileSync('debug_vitamins.html', html);
console.log('HTML saved to debug_vitamins.html');
console.log('Length:', html.length);

const cheerio = await import('cheerio');
const $ = cheerio.load(html);
console.log('Title:', $('title').text());
console.log('Product links:', $('a[href*="/products/"]').length);

$('a[href*="/products/"]').slice(0, 5).each((i, el) => {
  const text = $(el).text().trim().substring(0, 50);
  console.log(`  ${$(el).attr('href')} - ${text}`);
});
