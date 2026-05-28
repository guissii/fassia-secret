import { z } from 'zod';

export const productSchema = z.object({
  body: z.object({
    brand: z.string().min(1, "Brand is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    oldPrice: z.number().min(0).optional().nullable(),
    image: z.string().min(1, "Image is required"),
    categoryIds: z.array(z.string()).optional(),
    collectionIds: z.array(z.string()).optional(),
    concerns: z.array(z.string()).optional(),
    badge: z.string().optional().nullable(),
    stock: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
  })
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    nameAr: z.string().min(1, "Arabic name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    page: z.string().optional().nullable(),
    order: z.number().int().optional(),
  })
});

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().min(0),
  image: z.string().min(1)
});

export const orderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, "Customer name is required"),
    phone: z.string().min(1, "Phone is required"),
    city: z.string().min(1, "City is required"),
    address: z.string().min(1, "Address is required"),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    total: z.number().min(0, "Total must be positive")
  })
});
