import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config as loadEnv } from 'dotenv';

// Load .env explicitly (required outside of Next.js)
loadEnv({ path: '.env' });

const prisma = new PrismaClient();

// Official categories
const CATEGORIES = [
  { name: 'Dermo-Corner',              nameAr: 'ركن ديرمو',             slug: 'dermo-corner' },
  { name: 'Promotions !',              nameAr: 'تخفيضات',               slug: 'promotions' },
  { name: 'K-Beauty',                  nameAr: 'جمال كوري',             slug: 'k-beauty' },
  { name: 'Corps',                     nameAr: 'الجسم',                  slug: 'corps' },
  { name: 'Visage',                    nameAr: 'الوجه',                  slug: 'visage' },
  { name: 'Cheveux',                   nameAr: 'الشعر',                  slug: 'cheveux' },
  { name: 'Hygiène Dentaire',          nameAr: 'صحة الفم',              slug: 'hygiene-dentaire' },
  { name: 'Maquillage',                nameAr: 'مكياج',                  slug: 'maquillage' },
  { name: 'Hygiène & Intimité',        nameAr: 'نظافة وعناية شخصية',   slug: 'hygiene-intimite' },
  { name: 'Hygiène',                   nameAr: 'نظافة',                  slug: 'hygiene' },
  { name: 'Accessoires',               nameAr: 'إكسسوارات',             slug: 'accessoires' },
  { name: 'Minceur',                   nameAr: 'تنحيف',                  slug: 'minceur' },
  { name: 'Sport',                     nameAr: 'رياضة',                  slug: 'sport' },
  { name: 'Maman & Bébé',              nameAr: 'الأم والطفل',           slug: 'maman-bebe' },
  { name: 'Hommes',                    nameAr: 'رجال',                   slug: 'hommes' },
  { name: 'Santé',                     nameAr: 'صحة',                    slug: 'sante' },
  { name: 'Préoccupations',            nameAr: 'اهتمامات',              slug: 'preoccupations' },
  { name: 'Compléments Alimentaires',  nameAr: 'مكملات غذائية',        slug: 'complements-alimentaires' },
  { name: 'Premium Hair Care',         nameAr: 'عناية فائقة للشعر',    slug: 'premium-hair-care' },
  { name: 'Parfums',                   nameAr: 'عطور',                   slug: 'parfums' },
  { name: 'Bien-être',                 nameAr: 'رفاهية',                 slug: 'bien-etre' },
  { name: 'Compléments',               nameAr: 'مكملات',                 slug: 'complements' },
];

// Default collections
const COLLECTIONS = [
  { name: 'Étape 1: Oil Cleanser',       slug: 'oil-cleanser',       page: 'korean-beauty', order: 1 },
  { name: 'Étape 2: Foam Cleanser',      slug: 'foam-cleanser',      page: 'korean-beauty', order: 2 },
  { name: 'Étape 3: Exfoliator',         slug: 'exfoliator',         page: 'korean-beauty', order: 3 },
  { name: 'Étape 4: Toner',              slug: 'toner',              page: 'korean-beauty', order: 4 },
  { name: 'Étape 5: Essence',            slug: 'essence',            page: 'korean-beauty', order: 5 },
  { name: 'Étape 6: Serum & Ampoule',    slug: 'serum-ampoule',      page: 'korean-beauty', order: 6 },
  { name: 'Étape 7: Sheet Mask',         slug: 'sheet-mask',         page: 'korean-beauty', order: 7 },
  { name: 'Étape 8: Eye Cream',          slug: 'eye-cream',          page: 'korean-beauty', order: 8 },
  { name: 'Étape 9: Moisturizer',        slug: 'moisturizer',        page: 'korean-beauty', order: 9 },
  { name: 'Étape 10: Sunscreen',         slug: 'sunscreen',          page: 'korean-beauty', order: 10 },
  { name: 'Sommeil & Relaxation',        slug: 'sommeil-relaxation', page: 'complements',   order: 1 },
  { name: 'Énergie & Vitalité',          slug: 'energie-vitalite',   page: 'complements',   order: 2 },
  { name: 'Accessoires Cheveux',         slug: 'accessoires-cheveux',page: 'accessoires',   order: 1 },
  { name: 'Soins Barbe',                 slug: 'soins-barbe',        page: 'homme',         order: 1 },
];

async function main() {
  console.log('🌱 Début du seed Fassia Secret...\n');

  // ─── 0. Admin ─────────────────────────────────────────────────────────
  console.log('👤 Création admin...');
  
  const adminEmail = 'admin@fassiasecret.com';
  const adminPassword = 'FassiaSecret2026!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: { email: adminEmail, password: hashedPassword },
  });
  
  console.log(`   ✅ Admin: ${adminEmail} / mot de passe: ${adminPassword}\n`);

  // ─── 1. Categories ────────────────────────────────────────────────────
  console.log('📂 Création des catégories...');

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameAr: cat.nameAr },
      create: { name: cat.name, nameAr: cat.nameAr, slug: cat.slug },
    });
  }
  console.log(`   ✅ ${CATEGORIES.length} catégories créées\n`);

  // ─── 2. Collections ───────────────────────────────────────────────────
  console.log('📦 Création des collections...');

  for (const col of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: { name: col.name, page: col.page, order: col.order },
      create: { name: col.name, slug: col.slug, page: col.page, order: col.order },
    });
  }
  console.log(`   ✅ ${COLLECTIONS.length} collections créées\n`);

  // ─── 3. Default promo codes ───────────────────────────────────────────
  console.log('🎟️  Création des codes promo par défaut...');

  const defaultPromos = [
    { code: 'WELCOME10', type: 'PERCENTAGE' as const, value: 10, expiresAt: new Date('2027-12-31'), isActive: true },
    { code: 'FASSIA20', type: 'PERCENTAGE' as const, value: 20, expiresAt: new Date('2027-06-30'), usageLimit: 500, isActive: true },
  ];

  for (const promo of defaultPromos) {
    await prisma.promo.upsert({
      where: { code: promo.code },
      update: {},
      create: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        expiresAt: promo.expiresAt,
        usageLimit: promo.usageLimit || null,
        isActive: promo.isActive,
      },
    });
  }
  console.log(`   ✅ ${defaultPromos.length} codes promo créés\n`);

  console.log('🎉 Seed terminé avec succès !');
  console.log('─────────────────────────────');
  console.log(`   Admin email    : ${adminEmail}`);
  console.log(`   Admin password : ${adminPassword}`);
  console.log('─────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
