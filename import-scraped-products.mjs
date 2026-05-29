import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load scraped products
const productsJson = fs.readFileSync(path.join(__dirname, 'scraped_parabioty', 'products.json'), 'utf8');
const products = JSON.parse(productsJson);

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

async function importProduct(product) {
  try {
    const payload = {
      name: product.name,
      nameAr: product.nameAr || '',
      brand: product.brand || 'Parabioty',
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      price: product.price,
      oldPrice: product.oldPrice || null,
      stock: product.stock || 10,
      image: product.image,
      categories: product.categories || [],
      collections: product.collections || [],
      tags: product.tags || [],
      isVisible: true,
      isArchived: false,
      isEssential: false,
      supplementFocus: product.supplementFocus || null,
      koreanBeautyStep: product.koreanBeautyStep || null,
      makeupStep: product.makeupStep || null,
    };

    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ADMIN_TOKEN ? { 'Authorization': `Bearer ${ADMIN_TOKEN}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ Imported: ${product.name} (ID: ${data.product?.id})`);
    return data;
  } catch (err) {
    console.error(`❌ Failed to import ${product.name}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log(`Importing ${products.length} products...\n`);

  let imported = 0;
  let failed = 0;

  for (const product of products) {
    const result = await importProduct(product);
    if (result) imported++;
    else failed++;

    // Small delay to avoid overwhelming the server
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone! ${imported} imported, ${failed} failed.`);
}

main().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
