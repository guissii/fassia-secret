import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configs = await prisma.sectionConfig.findMany();
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  try {
    const { sectionKey, bannerImage } = await request.json();
    
    const config = await prisma.sectionConfig.upsert({
      where: { sectionKey },
      update: { bannerImage },
      create: { sectionKey, bannerImage },
    });
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section config' }, { status: 500 });
  }
}
