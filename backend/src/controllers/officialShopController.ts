import { Request, Response } from 'express';
import prisma from '../config/prisma';

const CATEGORIES = [
  { key: 'kbeauty', label: 'Korean Beauty' },
  { key: 'complements', label: 'Compléments Alimentaires' },
  { key: 'maquillage', label: 'Maquillage & Parfums' },
];

export const getOfficialShops = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const where: any = {};
    if (category) where.category = category;

    const shops = await prisma.officialShop.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json({ shops });
  } catch (error) {
    console.error('Error fetching official shops:', error);
    res.status(500).json({ error: 'Failed to fetch official shops' });
  }
};

export const createOfficialShop = async (req: Request, res: Response) => {
  try {
    const { category, name, order } = req.body;

    if (!category || !name) {
      return res.status(400).json({ error: 'Category and name are required' });
    }

    const existing = await prisma.officialShop.findUnique({
      where: { category_name: { category, name } },
    });

    if (existing) {
      return res.status(409).json({ error: 'Cette marque existe déjà dans cette catégorie' });
    }

    const shop = await prisma.officialShop.create({
      data: { category, name, order: order || 0 },
    });

    res.status(201).json({ shop });
  } catch (error) {
    console.error('Error creating official shop:', error);
    res.status(500).json({ error: 'Failed to create official shop' });
  }
};

export const updateOfficialShop = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { category, name, order } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const shop = await prisma.officialShop.update({
      where: { id },
      data: { category, name, order: order || 0 },
    });

    res.json({ shop });
  } catch (error) {
    console.error('Error updating official shop:', error);
    res.status(500).json({ error: 'Failed to update official shop' });
  }
};

export const deleteOfficialShop = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.officialShop.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting official shop:', error);
    res.status(500).json({ error: 'Failed to delete official shop' });
  }
};
