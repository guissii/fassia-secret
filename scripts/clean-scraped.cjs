const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function clean() {
  const prods = await prisma.product.findMany({
    where: { image: { contains: 'paradiscount' } }
  });
  console.log(`Found ${prods.length} scraped products to delete`);

  for (const p of prods) {
    await prisma.product.delete({ where: { id: p.id } });
    console.log('Deleted from DB:', p.name);

    // Delete image file if exists
    try {
      const imgPath = path.join('/root/fassia-secret/public', p.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        console.log('Deleted image:', p.image);
      }
    } catch (e) {}
  }

  await prisma.$disconnect();
  console.log('Clean done');
}

clean().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
