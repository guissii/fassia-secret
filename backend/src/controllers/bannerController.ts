import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany();
    res.json(banners);
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const createOrUpdateBanner = async (req: Request, res: Response) => {
  try {
    const { section, imageUrl, imageData, linkUrl, title, isActive } = req.body;
    
    if (!section) {
      return res.status(400).json({ error: 'Section is required' });
    }

    // Accept either imageData (base64) or imageUrl
    // Priority: imageData (base64) > imageUrl
    const finalImageUrl = imageData || imageUrl;

    if (!finalImageUrl) {
      return res.status(400).json({ error: 'imageData or imageUrl is required' });
    }

    const banner = await prisma.banner.upsert({
      where: { section },
      update: { 
        imageUrl: finalImageUrl, 
        linkUrl: linkUrl || null, 
        title: title || null, 
        isActive: isActive !== false 
      },
      create: { 
        section, 
        imageUrl: finalImageUrl, 
        linkUrl: linkUrl || null, 
        title: title || null, 
        isActive: isActive !== false 
      },
    });
    
    res.json(banner);
  } catch (error) {
    console.error('Failed to update banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
};