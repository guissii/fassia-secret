import prisma from './config/prisma';

const DEFAULT_SHOPS = [
  // Korean Beauty
  { category: 'kbeauty', name: 'COSRX' },
  { category: 'kbeauty', name: 'Laneige' },
  { category: 'kbeauty', name: 'Innisfree' },
  { category: 'kbeauty', name: 'Sulwhasoo' },
  { category: 'kbeauty', name: 'Beauty of Joseon' },
  { category: 'kbeauty', name: 'Anua' },
  { category: 'kbeauty', name: 'Mediheal' },
  { category: 'kbeauty', name: 'Dr. Jart+' },
  { category: 'kbeauty', name: 'Banila Co' },
  { category: 'kbeauty', name: 'Etude House' },
  { category: 'kbeauty', name: 'Missha' },
  { category: 'kbeauty', name: 'The Face Shop' },
  { category: 'kbeauty', name: 'Pyunkang Yul' },
  { category: 'kbeauty', name: 'Purito' },
  { category: 'kbeauty', name: 'Benton' },
  // Compléments Alimentaires
  { category: 'complements', name: 'Pure Encapsulations' },
  { category: 'complements', name: 'Optimum Nutrition' },
  { category: 'complements', name: 'Now Foods' },
  { category: 'complements', name: 'Solgar' },
  { category: 'complements', name: 'Garden of Life' },
  { category: 'complements', name: 'Thorne' },
  { category: 'complements', name: 'Life Extension' },
  { category: 'complements', name: "Doctor's Best" },
  { category: 'complements', name: 'Jarrow Formulas' },
  { category: 'complements', name: 'Nordic Naturals' },
  { category: 'complements', name: 'Sports Research' },
  { category: 'complements', name: "Nature's Way" },
  { category: 'complements', name: 'Source Naturals' },
  { category: 'complements', name: 'Country Life' },
  { category: 'complements', name: 'Nutrilite' },
  // Maquillage & Parfums
  { category: 'maquillage', name: 'Chanel' },
  { category: 'maquillage', name: 'Dior' },
  { category: 'maquillage', name: 'YSL' },
  { category: 'maquillage', name: 'Lancôme' },
  { category: 'maquillage', name: 'MAC' },
  { category: 'maquillage', name: 'NARS' },
  { category: 'maquillage', name: 'Fenty Beauty' },
  { category: 'maquillage', name: 'Tarte' },
  { category: 'maquillage', name: 'Urban Decay' },
  { category: 'maquillage', name: 'Estée Lauder' },
  { category: 'maquillage', name: 'Maybelline' },
  { category: 'maquillage', name: "L'Oréal" },
  { category: 'maquillage', name: 'Charlotte Tilbury' },
  { category: 'maquillage', name: 'Huda Beauty' },
  { category: 'maquillage', name: 'Benefit' },
];

async function seed() {
  console.log('Seeding official shops...');
  let created = 0;
  let skipped = 0;
  for (let i = 0; i < DEFAULT_SHOPS.length; i++) {
    const s = DEFAULT_SHOPS[i];
    try {
      await prisma.officialShop.create({
        data: { category: s.category, name: s.name, order: i },
      });
      created++;
    } catch (e: any) {
      if (e.code === 'P2002') {
        skipped++;
      } else {
        console.error('Error creating', s, e.message);
      }
    }
  }
  console.log(`Done: ${created} created, ${skipped} skipped.`);
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
