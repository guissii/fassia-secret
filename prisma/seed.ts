import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ALL_PRODUCTS } from '../src/data/products';
import { mockPromos, mockOrders } from '../src/components/admin/mockData';
import { config as loadEnv } from 'dotenv';

// Charger le .env explicitement (requis hors de Next.js)
loadEnv({ path: '.env' });

const prisma = new PrismaClient();

// Toutes les catégories officielles du projet
const CATEGORIES = [
  { name: 'Dermo-Corner',           nameAr: 'ركن ديرمو',             slug: 'dermo-corner' },
  { name: 'Promotions !',           nameAr: 'تخفيضات',               slug: 'promotions' },
  { name: 'K-Beauty',               nameAr: 'جمال كوري',             slug: 'k-beauty' },
  { name: 'Corps',                  nameAr: 'الجسم',                  slug: 'corps' },
  { name: 'Visage',                 nameAr: 'الوجه',                  slug: 'visage' },
  { name: 'Cheveux',                nameAr: 'الشعر',                  slug: 'cheveux' },
  { name: 'Hygiène Dentaire',       nameAr: 'صحة الفم',              slug: 'hygiene-dentaire' },
  { name: 'Maquillage',             nameAr: 'مكياج',                  slug: 'maquillage' },
  { name: 'Hygiène & Intimité',     nameAr: 'نظافة وعناية شخصية',   slug: 'hygiene-intimite' },
  { name: 'Hygiène',                nameAr: 'نظافة',                  slug: 'hygiene' },
  { name: 'Accessoires',            nameAr: 'إكسسوارات',             slug: 'accessoires' },
  { name: 'Minceur',                nameAr: 'تنحيف',                  slug: 'minceur' },
  { name: 'Sport',                  nameAr: 'رياضة',                  slug: 'sport' },
  { name: 'Maman & Bébé',           nameAr: 'الأم والطفل',           slug: 'maman-bebe' },
  { name: 'Hommes',                 nameAr: 'رجال',                   slug: 'hommes' },
  { name: 'Santé',                  nameAr: 'صحة',                    slug: 'sante' },
  { name: 'Préoccupations',         nameAr: 'اهتمامات',              slug: 'preoccupations' },
  { name: 'Compléments Alimentaires', nameAr: 'مكملات غذائية',      slug: 'complements-alimentaires' },
  { name: 'Premium Hair Care',      nameAr: 'عناية فائقة للشعر',    slug: 'premium-hair-care' },
  { name: 'Parfums',                nameAr: 'عطور',                   slug: 'parfums' },
  { name: 'Bien-être',              nameAr: 'رفاهية',                 slug: 'bien-etre' },
  // Aliases pour les produits existants
  { name: 'Compléments',            nameAr: 'مكملات',                 slug: 'complements' },
];

async function main() {
  console.log('🌱 Début du seed Fassia Secret...\n');

  // ─── 0. Admin ─────────────────────────────────────────────────────────
  console.log('👤 Création admin...');
  const adminPassword = process.env.ADMIN_SECRET || 'fassia2025!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminEmail = process.env.ADMIN_EMAIL || 'fassiasecret@gmail.com';

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: { email: adminEmail, password: hashedPassword },
  });
  console.log(`   ✅ Admin: ${adminEmail} / mot de passe: ${adminPassword}\n`);

  // ─── 1. Catégories ────────────────────────────────────────────────────
  console.log('📂 Création des catégories...');
  const categoryMap = new Map<string, string>(); // name → id

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameAr: cat.nameAr },
      create: { name: cat.name, nameAr: cat.nameAr, slug: cat.slug },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`   ✅ ${CATEGORIES.length} catégories créées\n`);

  // ─── 2. Produits ──────────────────────────────────────────────────────
  console.log('📦 Migration des produits...');
  let created = 0;
  let skipped = 0;

  for (const product of ALL_PRODUCTS) {
    // Trouver la catégorie (exact ou alias)
    const catId = categoryMap.get(product.category);

    if (!catId) {
      console.warn(`   ⚠️  Catégorie "${product.category}" introuvable pour "${product.name}" — ignoré`);
      skipped++;
      continue;
    }

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        brand: product.brand,
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        image: product.image,
        badge: product.badge ?? null,
        tags: product.badge ? [product.badge] : [],
        categories: { set: [{ id: catId }] },
      },
      create: {
        id: product.id,
        brand: product.brand,
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        image: product.image,
        badge: product.badge ?? null,
        isVisible: true,
        isArchived: false,
        stock: 50,
        salesCount: 0,
        tags: product.badge ? [product.badge] : [],
        concerns: [],
        categories: { connect: { id: catId } },
      },
    });
    created++;
  }
  console.log(`   ✅ ${created} produits migrés, ${skipped} ignorés\n`);

  // ─── 3. Codes Promo ───────────────────────────────────────────────────
  console.log('🎟️  Création des codes promo...');
  for (const promo of mockPromos) {
    await prisma.promo.upsert({
      where: { code: promo.code },
      update: {},
      create: {
        code: promo.code,
        type: promo.type.toUpperCase() as any,
        value: promo.value,
        expiresAt: new Date(promo.expiresAt),
        usageLimit: promo.usageLimit,
        usageCount: promo.usageCount,
        isActive: promo.isActive,
      },
    });
  }
  console.log(`   ✅ ${mockPromos.length} codes promo créés\n`);

  // ─── 4. Commandes test ────────────────────────────────────────────────
  console.log('🛒 Création des commandes test...');
  for (const order of mockOrders) {
    const exists = await prisma.order.findUnique({ where: { orderNumber: order.orderNumber } });
    if (exists) { continue; }

    await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        phone: order.phone,
        city: order.city,
        address: order.address,
        total: order.total,
        status: order.status.toUpperCase() as any,
        deliveryStatus: (order.deliveryStatus.toUpperCase().replace('-', '_')) as any,
        syncedToSheets: order.syncedToSheets,
        createdAt: new Date(order.createdAt),
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        },
      },
    });
  }
  console.log(`   ✅ ${mockOrders.length} commandes test créées\n`);

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
