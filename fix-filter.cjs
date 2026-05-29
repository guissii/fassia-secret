const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/ProductsTab.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldFilter = `    const matchesSection = sectionFilter === 'all' || (
      sectionFilter === 'promotions' ? (product.oldPrice && product.oldPrice > product.price) :
      sectionFilter === 'complements-alimentaires' ? product.collections.some((c: any) => (typeof c === 'string' ? c : c.name)?.toLowerCase().includes('complément')) :
      sectionFilter === 'korean-beauty' ? product.collections.some((c: any) => (typeof c === 'string' ? c : c.name)?.toLowerCase().includes('korean')) :
      sectionFilter === 'parfums-maquillage' ? product.collections.some((c: any) => {
        const name = (typeof c === 'string' ? c : c.name)?.toLowerCase() || '';
        return name.includes('maquillage') || name.includes('parfum');
      }) :
      true
    );`;

const newFilter = `    const matchesSection = sectionFilter === 'all' || product.collections.some((c: any) => (typeof c === 'string' ? c : c.name) === sectionFilter);`;

if (content.includes(oldFilter)) {
  content = content.replace(oldFilter, newFilter);
  fs.writeFileSync(filePath, content);
  console.log('✅ Filter updated successfully');
} else {
  console.log('❌ Filter pattern not found');
}
