const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/ProductsTab.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the hardcoded section select with dynamic one
const oldPattern = /              <option value="all">📁 Toutes les sections<\/option>\n              <option value="promotions">🏷️ PROMOTIONS<\/option>\n              <option value="complements-alimentaires">🌿 COMPLÉMENTS ALIMENTAIRES<\/option>\n              <option value="korean-beauty">✨ KOREAN BEAUTY<\/option>\n              <option value="parfums-maquillage">.*?<\/option>/;

const newContent = `              <option value="all">📁 Toutes les collections</option>
              {collections.map(coll => (
                <option key={coll} value={coll}>{coll}</option>
              ))}`;

if (oldPattern.test(content)) {
  content = content.replace(oldPattern, newContent);
  fs.writeFileSync(filePath, content);
  console.log('✅ Section filter updated successfully');
} else {
  console.log('❌ Pattern not found - checking file content...');
  // Log lines around the section
  const lines = content.split('\n');
  for (let i = 295; i < 310; i++) {
    console.log(`Line ${i+1}: ${lines[i]}`);
  }
}
