import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getSiteConfig = async (req: Request, res: Response) => {
  try {
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({ data: {} });
    }
    res.json({ config });
  } catch (error) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ error: 'Failed to fetch site config' });
  }
};

export const updateSiteConfig = async (req: Request, res: Response) => {
  try {
    let config = await prisma.siteConfig.findFirst();
    const data = req.body;

    if (!config) {
      config = await prisma.siteConfig.create({ data });
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data,
      });
    }

    res.json({ config });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ error: 'Failed to update site config' });
  }
};
