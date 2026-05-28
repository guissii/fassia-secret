import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'public/images/banners';
const filesToUpdate = [
  'app/(shop-group)/korean-beauty/page.tsx',
  'app/(shop-group)/maquillage-parfums/page.tsx',
  'src/lib/bannersConfig.ts'
];

async function run() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const oldPath = path.join(dir, file);
      const newFile = file.replace(/\.(png|jpg|jpeg)$/, '.webp');
      const newPath = path.join(dir, newFile);
      
      console.log(`Converting ${file} to ${newFile}...`);
      await sharp(oldPath).webp({ quality: 80 }).toFile(newPath);
      fs.unlinkSync(oldPath);
    }
  }

  // Update source files
  for (const filePath of filesToUpdate) {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updated = content.replace(/\/images\/banners\/([^'"\s]+\.(png|jpg|jpeg))/g, (match, p1) => {
        return match.replace(/\.(png|jpg|jpeg)$/, '.webp');
      });
      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated references in ${filePath}`);
      }
    }
  }
  
  console.log("Done!");
}

run().catch(console.error);
