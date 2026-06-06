import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = status ? { status: status.toUpperCase() } : {};

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        take: limit,
        skip,
        include: {
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
              productId: true,
              // Exclude the full nested product to reduce JSON payload size
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where })
    ]);

    res.json({ orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, phone, city, address, items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Fix Race Condition by generating a unique short ID instead of sequential count
    const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `CMD-${Date.now().toString().slice(-4)}-${uniqueSuffix}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        phone,
        city,
        address,
        total,
        status: 'PENDING',
        deliveryStatus: 'PENDING',
        items: {
          create: items.map((item: { productId: number; name: string; quantity: number; price: number; image: string }) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({ order: newOrder, success: true });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id } });
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() }
    });
    res.json({ order: updated, success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};