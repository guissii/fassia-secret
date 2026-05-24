import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const createOrUpdateBanner = async (req: Request, res: Response) => {
  try {
    const { section, imageUrl, linkUrl, title, isActive } = req.body;
    
    if (!section || !imageUrl) {
      return res.status(400).json({ error: 'Section and imageUrl are required' });
    }

    const banner = await prisma.banner.upsert({
      where: { section },
      update: { imageUrl, linkUrl, title, isActive },
      create: { section, imageUrl, linkUrl, title, isActive },
    });
    
    res.json(banner);
  } catch (error) {
    console.error('Failed to update banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
};