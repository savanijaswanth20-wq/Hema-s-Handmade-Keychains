export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  tag?: string; // e.g. "100% Glossy Clay"
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Baking' | 'Glossing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  customMessage?: string;
  paymentMethod: 'UPI' | 'WhatsApp';
  paymentId?: string; // UPI transaction ID
  paymentStatus: 'Pending' | 'Verified' | 'Refunded';
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface GalleryItem {
  id?: string;
  title: string;
  desc: string;
  category: string;
  url: string;
}

export interface AdminSettings {
  upiId: string;
  upiName: string;
  bannerMessage: string;
  businessName: string;
  whatsappNumber: string;
  instagramId: string;
  qrImageUrl?: string;
  logoUrl?: string;
  heroTitle?: string;
  heroDescription?: string;
  galleryImages?: GalleryItem[];
}
