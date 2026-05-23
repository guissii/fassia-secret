import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const isVisible = searchParams.get('isVisible');

    const where: any = {};
    
    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } };
    }
    
    if (isVisible !== null) {
      where.isVisible = isVisible === 'true';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: true,
        collections: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Requires authentication, protected by middleware
  try {
    const body = await request.json();
    const { brand, name, description, price, oldPrice, image, categoryIds, collectionIds, concerns, badge, stock, tags } = body;

    const newProduct = await prisma.product.create({
      data: {
        brand,
        name,
        description,
        price,
        oldPrice,
        image,
        badge,
        stock: stock || 0,
        tags: tags || [],
        concerns: concerns || [],
        categories: {
          connect: (categoryIds || []).map((id: string) => ({ id }))
        },
        collections: {
          connect: (collectionIds || []).map((id: string) => ({ id }))
        }
      },
      include: {
        categories: true,
        collections: true,
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
