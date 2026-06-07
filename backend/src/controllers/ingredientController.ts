import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getIngredients = async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json({ ingredients });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
};

export const getActiveIngredients = async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json({ ingredients });
  } catch (error) {
    console.error('Error fetching active ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
};

export const createIngredient = async (req: Request, res: Response) => {
  try {
    const { tag, title, subtitle, description, image, icon, accent, searchQuery, order } = req.body;
    const ingredient = await prisma.ingredient.create({
      data: {
        tag,
        title,
        subtitle,
        description,
        image,
        icon: icon || 'sparkles',
        accent: accent || '#e10074',
        searchQuery,
        order: order || 0,
      }
    });
    res.status(201).json({ ingredient, success: true });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
};

export const updateIngredient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { tag, title, subtitle, description, image, icon, accent, searchQuery, order, isActive } = req.body;
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        tag,
        title,
        subtitle,
        description,
        image,
        icon,
        accent,
        searchQuery,
        order,
        isActive,
      }
    });
    res.json({ ingredient, success: true });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
};

export const deleteIngredient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.ingredient.delete({ where: { id } });
    res.json({ success: true, message: 'Ingredient deleted' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
};
