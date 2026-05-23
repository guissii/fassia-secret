import { ALL_PRODUCTS } from '../../data/products';

// Re-export shared utilities so components can import from either file
export { getOrderStatusLabel, getOrderStatusColor } from './shared';
export { Skeleton } from './shared';

// --- Shared Types ---
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'failed';

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  syncedToSheets: boolean;
}

export interface AdminProduct {
  id: number;
  brand: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  categories: string[];
  collections: string[];
  concerns: string[];
  badge?: string;
  isVisible: boolean;
  isArchived: boolean;
  salesCount: number;
  stock: number;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  productCount: number;
}

export interface Promo {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  expiresAt: string;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalViews: number;
  uniqueVisitors: number;
  pendingOrders: number;
  processingOrders: number;
}

// --- Mock Data ---

// Simulate network delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockStats: Stats = {
  totalOrders: 1248,
  totalRevenue: 485000,
  totalViews: 45200,
  uniqueVisitors: 12500,
  pendingOrders: 14,
  processingOrders: 28,
};

export const mockOrders: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'CMD-1001',
    customerName: 'Youssef Alaoui',
    phone: '06 12 34 56 78',
    city: 'Casablanca',
    address: '15 Rue des Fleurs, Maarif',
    items: [
      { productId: 1, name: 'Derma Hydrating Serum', quantity: 2, price: 180, image: '19bd7403-d2ac-49a4-a584-be5895add421.png' },
    ],
    total: 360,
    status: 'pending',
    deliveryStatus: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    syncedToSheets: false,
  },
  {
    id: 'ord_2',
    orderNumber: 'CMD-1002',
    customerName: 'Amina Bennani',
    phone: '06 98 76 54 32',
    city: 'Rabat',
    address: 'Appt 4, Immeuble 12, Agdal',
    items: [
      { productId: 2, name: 'Hydra Boost Gel Cream', quantity: 1, price: 199, image: 'Gemini_Generated_Image_souwz3souwz3souw.png' },
      { productId: 3, name: 'Detox & Drainage', quantity: 1, price: 129, image: '5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png' },
    ],
    total: 328,
    status: 'processing',
    deliveryStatus: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    syncedToSheets: true,
  },
  {
    id: 'ord_3',
    orderNumber: 'CMD-1003',
    customerName: 'Karim Tazi',
    phone: '06 55 44 33 22',
    city: 'Marrakech',
    address: 'Villa 5, Palmeraie',
    items: [
      { productId: 13, name: 'Rose Velvet Eau de Parfum', quantity: 1, price: 349, image: '19bd7403-d2ac-49a4-a584-be5895add421.png' },
    ],
    total: 349,
    status: 'shipped',
    deliveryStatus: 'in_transit',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    syncedToSheets: true,
  },
  {
    id: 'ord_4',
    orderNumber: 'CMD-1004',
    customerName: 'Sara Chraibi',
    phone: '06 11 22 33 44',
    city: 'Tanger',
    address: 'Rue de la Kasbah',
    items: [
      { productId: 6, name: 'Centella Ampoule Foam', quantity: 1, price: 129, image: 'ca  quon va utiiser.png' },
    ],
    total: 129,
    status: 'delivered',
    deliveryStatus: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    syncedToSheets: true,
  },
  {
    id: 'ord_5',
    orderNumber: 'CMD-1005',
    customerName: 'Omar El Fassi',
    phone: '06 66 77 88 99',
    city: 'Fès',
    address: 'Médina',
    items: [
      { productId: 9, name: 'Perfect Glow Foundation', quantity: 2, price: 219, image: '19bd7403-d2ac-49a4-a584-be5895add421.png' },
    ],
    total: 438,
    status: 'cancelled',
    deliveryStatus: 'failed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    syncedToSheets: false,
  },
];

export const mockAdminProducts: AdminProduct[] = ALL_PRODUCTS.map(p => {
  const { category, ...rest } = p as any;
  return {
    ...rest,
    categories: category ? [category] : [],
    collections: [],
    concerns: [],
    isVisible: true,
    isArchived: false,
    salesCount: Math.floor(Math.random() * 500),
    stock: Math.floor(Math.random() * 100),
    tags: p.badge ? [p.badge] : [],
  };
});

export const mockCategories: Category[] = [
  { id: 'cat_1', name: 'Visage', nameAr: 'الوجه', slug: 'visage', productCount: 45 },
  { id: 'cat_2', name: 'Compléments', nameAr: 'مكملات غذائية', slug: 'complements', productCount: 32 },
  { id: 'cat_3', name: 'Maquillage', nameAr: 'مكياج', slug: 'maquillage', productCount: 28 },
  { id: 'cat_4', name: 'Parfums', nameAr: 'عطور', slug: 'parfums', productCount: 15 },
  { id: 'cat_5', name: 'K-Beauty', nameAr: 'جمال كوري', slug: 'k-beauty', productCount: 12 },
  { id: 'cat_6', name: 'Santé', nameAr: 'صحة', slug: 'sante', productCount: 8 },
];

export const mockCollections = [
  { id: 'col_1', name: 'Étape 1: Oil Cleanser', page: 'korean-beauty' },
  { id: 'col_2', name: 'Étape 2: Foam Cleanser', page: 'korean-beauty' },
  { id: 'col_3', name: 'Sommeil & Relaxation', page: 'complements' },
  { id: 'col_4', name: 'Énergie & Vitalité', page: 'complements' },
  { id: 'col_5', name: 'Accessoires Cheveux', page: 'accessoires' },
  { id: 'col_6', name: 'Soins Barbe', page: 'homme' },
];

export const mockPromos: Promo[] = [
  { id: 'pro_1', code: 'WELCOME10', type: 'percentage', value: 10, expiresAt: '2026-12-31T23:59:59Z', usageLimit: null, usageCount: 450, isActive: true },
  { id: 'pro_2', code: 'SUMMER50', type: 'fixed', value: 50, expiresAt: '2026-08-31T23:59:59Z', usageLimit: 1000, usageCount: 120, isActive: true },
  { id: 'pro_3', code: 'FLASH20', type: 'percentage', value: 20, expiresAt: new Date(Date.now() - 100000).toISOString(), usageLimit: 100, usageCount: 100, isActive: false },
];

// --- Mock API Fetchers ---

export const api = {
  getStats: async () => {
    await delay(600);
    return mockStats;
  },
  getOrders: async () => {
    await delay(800);
    return [...mockOrders];
  },
  getProducts: async () => {
    await delay(700);
    return [...mockAdminProducts];
  },
  getCategories: async () => {
    await delay(400);
    return [...mockCategories];
  },
  getCollections: async () => {
    await delay(400);
    return [...mockCollections];
  },
  getPromos: async () => {
    await delay(500);
    return [...mockPromos];
  },
};
