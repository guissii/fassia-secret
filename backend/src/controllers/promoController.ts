import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getPromos = async (req: Request, res: Response) => {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(promos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ error: 'Failed to fetch promos' });
  }
};

export const createPromo = async (req: Request, res: Response) => {
  try {
    const { code, type, value, expiresAt, usageLimit, isActive } = req.body;

    const promo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        expiresAt: new Date(expiresAt),
        usageLimit: usageLimit || null,
        isActive: isActive !== false,
      },
    });

    res.status(201).json({ promo });
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(500).json({ error: 'Failed to create promo' });
  }
};

export const updatePromo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { code, type, value, expiresAt, usageLimit, isActive } = req.body;

    const promo = await prisma.promo.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        type,
        value,
        expiresAt: new Date(expiresAt),
        usageLimit: usageLimit || null,
        isActive: isActive !== false,
      },
    });

    res.json({ promo });
  } catch (error) {
    console.error('Error updating promo:', error);
    res.status(500).json({ error: 'Failed to update promo' });
  }
};

export const deletePromo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.promo.delete({ where: { id } });
    res.json({ success: true, message: 'Promo deleted' });
  } catch (error) {
    console.error('Error deleting promo:', error);
    res.status(500).json({ error: 'Failed to delete promo' });
  }
};
