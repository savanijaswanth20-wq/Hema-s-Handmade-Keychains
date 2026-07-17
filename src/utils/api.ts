import { Product, Order, Review, AdminSettings } from "../types";
import {
  isSupabaseConfigured,
  supabaseFetchProducts,
  supabaseAddProduct,
  supabaseEditProduct,
  supabaseDeleteProduct,
  supabaseFetchOrders,
  supabaseCreateOrder,
  supabaseUpdateOrderStatus,
  supabaseFetchSettings,
  supabaseSaveSettings,
  supabaseFetchReviews,
  supabaseAddReview,
  supabaseLogin
} from "./supabaseClient";

const API_BASE = "/api";

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseFetchProducts();
    } catch (err) {
      console.error("Supabase fetch products error, using offline local storage fallback...", err);
      return getFallbackProducts();
    }
  }

  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error("API error, using localStorage fallback...", err);
    return getFallbackProducts();
  }
}

export async function addProduct(product: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured()) {
    return await supabaseAddProduct(product);
  }

  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return await res.json();
}

export async function editProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured()) {
    return await supabaseEditProduct(id, product);
  }

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to edit product");
  return await res.json();
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await supabaseDeleteProduct(id);
  }

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  const data = await res.json();
  return data.success;
}

export async function fetchOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseFetchOrders();
    } catch (err) {
      console.error("Supabase fetch orders error, using offline local storage fallback...", err);
      return getFallbackOrders();
    }
  }

  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  } catch (err) {
    console.error("API error, using localStorage fallback...", err);
    return getFallbackOrders();
  }
}

export async function createOrder(orderData: {
  customerName: string;
  customerPhone: string;
  address: string;
  customMessage?: string;
  paymentMethod: "UPI" | "WhatsApp";
  paymentId?: string;
  total: number;
  items: any[];
  customerId?: string;
}): Promise<Order> {
  if (isSupabaseConfigured()) {
    return await supabaseCreateOrder(orderData);
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.error || "Failed to create order");
  }
  return await res.json();
}

export async function updateOrderStatus(
  id: string,
  status: string,
  paymentStatus?: string
): Promise<Order> {
  if (isSupabaseConfigured()) {
    const data = await supabaseUpdateOrderStatus(id, status, paymentStatus);
    return {
      id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      address: data.address,
      customMessage: data.custom_message,
      paymentMethod: data.payment_method,
      paymentId: data.payment_id,
      paymentStatus: data.payment_status,
      total: Number(data.total),
      status: data.status,
      createdAt: data.created_at,
      items: [] // In the admin table list, we update status inline without needing loaded items
    } as any;
  }

  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, paymentStatus }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return await res.json();
}

export async function fetchSettings(): Promise<AdminSettings> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseFetchSettings();
    } catch (err) {
      console.error("Supabase settings load error, using default fallback...", err);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return await res.json();
  } catch (err) {
    return {
      upiId: "9640653603@ybl",
      upiName: "Hema's Tiny Universe",
      bannerMessage: "EVERY PURCHASE SUPPORTS A LOCAL ARTIST IN MARATHAHALLI!",
      businessName: "CuteCharm Keychains",
      whatsappNumber: "+91 9640653603",
      instagramId: "@hemas_tiny_universe",
      qrImageUrl: ""
    };
  }
}

export async function saveSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  if (isSupabaseConfigured()) {
    return await supabaseSaveSettings(settings);
  }

  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return await res.json();
}

export async function fetchReviews(): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseFetchReviews();
    } catch (err) {
      console.error("Supabase fetch reviews error...", err);
      return getFallbackReviews();
    }
  }

  try {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return await res.json();
  } catch (err) {
    return getFallbackReviews();
  }
}

export async function addReview(reviewData: {
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  text: string;
  customerId?: string;
}): Promise<Review> {
  if (isSupabaseConfigured()) {
    return await supabaseAddReview(reviewData);
  }

  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return await res.json();
}

export async function login(email: string, password: string): Promise<any> {
  if (isSupabaseConfigured()) {
    try {
      const { user, profile } = await supabaseLogin(email, password);
      return {
        success: true,
        user: {
          email: profile.email,
          name: profile.name,
          role: profile.role,
          id: user?.id
        }
      };
    } catch (err: any) {
      throw new Error(err.message || "Invalid credentials in Supabase Auth");
    }
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid username or password");
  return await res.json();
}

// Local Storage Fallbacks to ensure robust offline capability
function getFallbackProducts(): Product[] {
  const saved = localStorage.getItem("hema_fallback_products");
  if (saved) return JSON.parse(saved);
  return [];
}

function getFallbackOrders(): Order[] {
  const saved = localStorage.getItem("hema_fallback_orders");
  if (saved) return JSON.parse(saved);
  return [];
}

function getFallbackReviews(): Review[] {
  const saved = localStorage.getItem("hema_fallback_reviews");
  if (saved) return JSON.parse(saved);
  return [];
}
