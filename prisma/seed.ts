import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ALL_PRODUCTS } from '../src/data/products';
import { mockCategories, mockPromos, mockOrders } from '../src/components/admin/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 0. Seed Admin
  console.log('Seeding admin user...');
  const adminPassword = process.env.ADMIN_SECRET || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.adminUser.upsert({
    where: { email: 'admin@fassia.ma' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@fassia.ma',
      password: hashedPassword,
    },
  });

  // 1. Seed Categories
  console.log('Seeding categories...');
  const categoryMap = new Map<string, string>(); // name -> id
  for (const cat of mockCategories) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameAr: cat.nameAr,
        slug: cat.slug,
      },
    });
    categoryMap.set(cat.name, createdCat.id);
  }

  // 2. Seed Products
  console.log('Seeding products...');
  for (const product of ALL_PRODUCTS) {
    const categoryId = categoryMap.get(product.category);
    if (!categoryId) {
      console.warn(`Category ${product.category} not found for product ${product.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        id: product.id,
        brand: product.brand,
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        categories: {
          connect: { id: categoryId }
        },
        badge: product.badge,
        isVisible: true,
        isArchived: false,
        stock: Math.floor(Math.random() * 100),
        tags: product.badge ? [product.badge] : [],
        concerns: [],
      },
    });
  }

  // 3. Seed Promos
  console.log('Seeding promos...');
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

  // 4. Seed Orders (Optional, but good for testing)
  console.log('Seeding orders...');
  for (const order of mockOrders) {
    await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        phone: order.phone,
        city: order.city,
        address: order.address,
        total: order.total,
        status: order.status.toUpperCase() as any,
        deliveryStatus: order.deliveryStatus.toUpperCase().replace('_', '_') as any, // in_transit -> IN_TRANSIT
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

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
