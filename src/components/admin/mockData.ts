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
  koreanBeautyStep?: number | null;
  supplementFocus?: string | null;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  productCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  page: string;
  order: number;
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

// --- Utility ---
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Helper ---
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`/api${url}`, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  getStats: async (): Promise<Stats> => {
    try {
      const orders = await fetchWithAuth('/orders?limit=10000');
      const orderList = orders.orders || [];
      const products = await fetchWithAuth('/products?limit=1');
      
      const pendingOrders = orderList.filter((o: any) => o.status === 'PENDING').length;
      const processingOrders = orderList.filter((o: any) => o.status === 'PROCESSING').length;
      const totalRevenue = orderList
        .filter((o: any) => o.status !== 'CANCELLED')
        .reduce((sum: number, o: any) => sum + o.total, 0);

      return {
        totalOrders: orderList.length,
        totalRevenue,
        totalViews: 0,
        uniqueVisitors: 0,
        pendingOrders,
        processingOrders,
      };
    } catch {
      return { totalOrders: 0, totalRevenue: 0, totalViews: 0, uniqueVisitors: 0, pendingOrders: 0, processingOrders: 0 };
    }
  },
  getOrders: async () => {
    const data = await fetchWithAuth('/orders?limit=100');
    return data.orders || [];
  },
  getProducts: async () => {
    const data = await fetchWithAuth('/products?limit=1000');
    return data.products || [];
  },
  getCategories: async () => {
    const data = await fetchWithAuth('/categories');
    return data.categories || [];
  },
  getCollections: async () => {
    const data = await fetchWithAuth('/collections');
    return data.collections || [];
  },
  getPromos: async () => {
    return fetchWithAuth('/promos');
  },
  
  // Expose fetchWithAuth for POST/PUT/DELETE
  fetchWithAuth
};
