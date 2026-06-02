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

    // Validation
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code promo requis' });
    }
    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Type requis (CLIENT ou WHOLESALE)' });
    }
    if (!expiresAt) {
      return res.status(400).json({ error: 'Date d\'expiration requise' });
    }

    const validTypes = ['FIXED', 'PERCENTAGE', 'CLIENT', 'WHOLESALE'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type invalide: ${type}. Valeurs acceptées: ${validTypes.join(', ')}` });
    }

    const promo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        type: type as any,
        value: value ?? 0,
        expiresAt: new Date(expiresAt),
        usageLimit: usageLimit || null,
        isActive: isActive !== false,
      },
    });

    res.status(201).json({ promo });
  } catch (error: any) {
    console.error('Error creating promo:', error);
    // Return actual error message for debugging
    const message = error?.message || 'Failed to create promo';
    const code = error?.code;
    res.status(500).json({ error: message, code });
  }
};

export const updatePromo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { code, type, value, expiresAt, usageLimit, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID promo requis' });
    }

    const updateData: any = {
      code: code?.toUpperCase(),
      value: value ?? 0,
      isActive: isActive !== false,
    };

    if (type) {
      const validTypes = ['FIXED', 'PERCENTAGE', 'CLIENT', 'WHOLESALE'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Type invalide: ${type}` });
      }
      updateData.type = type;
    }

    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt);
    }

    if (usageLimit !== undefined) {
      updateData.usageLimit = usageLimit || null;
    }

    const promo = await prisma.promo.update({
      where: { id },
      data: updateData,
    });

    res.json({ promo });
  } catch (error: any) {
    console.error('Error updating promo:', error);
    const message = error?.message || 'Failed to update promo';
    const code = error?.code;
    res.status(500).json({ error: message, code });
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

// Public endpoint to validate a promo code (used in cart)
export const validatePromo = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, error: 'Code promo requis' });
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return res.status(404).json({ valid: false, error: 'Code promo invalide' });
    }

    if (!promo.isActive) {
      return res.status(400).json({ valid: false, error: 'Code promo désactivé' });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: 'Code promo expiré' });
    }

    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return res.status(400).json({ valid: false, error: 'Code promo épuisé' });
    }

    res.json({
      valid: true,
      promo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
      },
    });
  } catch (error) {
    console.error('Error validating promo:', error);
    res.status(500).json({ valid: false, error: 'Erreur de validation' });
  }
};
