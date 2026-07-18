import { Product, Order, Review, AdminSettings, OrderStatus } from "../types";
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
  supabaseLogin,
  supabaseUpdateCredentials
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

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to add product");
    return await res.json();
  } catch (err) {
    console.warn("API add product failed, falling back to local storage...", err);
    const products = getFallbackProducts();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: product.name || "Unnamed Product",
      description: product.description || "",
      category: product.category || "Animal Series",
      price: product.price || 150,
      stock: product.stock || 10,
      images: product.images || [],
      rating: 5.0,
      reviewsCount: 0,
      tag: product.tag || "100% Glossy Clay",
    };
    const updated = [...products, newProduct];
    localStorage.setItem("hema_fallback_products", JSON.stringify(updated));
    return newProduct;
  }
}

export async function editProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured()) {
    return await supabaseEditProduct(id, product);
  }

  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to edit product");
    return await res.json();
  } catch (err) {
    console.warn("API edit product failed, falling back to local storage...", err);
    const products = getFallbackProducts();
    let updatedProduct: Product | null = null;
    const updated = products.map((p) => {
      if (p.id === id) {
        updatedProduct = { ...p, ...product } as Product;
        return updatedProduct;
      }
      return p;
    });
    if (!updatedProduct) throw new Error("Product not found");
    localStorage.setItem("hema_fallback_products", JSON.stringify(updated));
    return updatedProduct;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await supabaseDeleteProduct(id);
  }

  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.warn("API delete product failed, falling back to local storage...", err);
    const products = getFallbackProducts();
    const filtered = products.filter((p) => p.id !== id);
    localStorage.setItem("hema_fallback_products", JSON.stringify(filtered));
    return true;
  }
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

  try {
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
  } catch (err) {
    console.warn("API create order failed, falling back to local storage...", err);
    const orders = getFallbackOrders();
    const newOrder: Order = {
      id: `HEMA-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      customMessage: orderData.customMessage,
      paymentMethod: orderData.paymentMethod,
      paymentId: orderData.paymentId,
      paymentStatus: orderData.paymentMethod === "UPI" ? "Pending" : "Verified",
      total: orderData.total,
      status: "Pending",
      items: orderData.items,
      createdAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    localStorage.setItem("hema_fallback_orders", JSON.stringify(updated));
    return newOrder;
  }
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

  try {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return await res.json();
  } catch (err) {
    console.warn("API update order status failed, falling back to local storage...", err);
    const orders = getFallbackOrders();
    let updatedOrder: Order | null = null;
    const updated = orders.map((o) => {
      if (o.id === id) {
        updatedOrder = { 
          ...o, 
          status: status as OrderStatus, 
          paymentStatus: (paymentStatus || o.paymentStatus) as "Pending" | "Verified" | "Refunded"
        };
        return updatedOrder;
      }
      return o;
    });
    if (!updatedOrder) throw new Error("Order not found");
    localStorage.setItem("hema_fallback_orders", JSON.stringify(updated));
    return updatedOrder;
  }
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
    const saved = localStorage.getItem("hema_fallback_settings");
    if (saved) return JSON.parse(saved);
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

  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error("Failed to save settings");
    return await res.json();
  } catch (err) {
    console.warn("API save settings failed, falling back to local storage...", err);
    const current = await fetchSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem("hema_fallback_settings", JSON.stringify(updated));
    return updated;
  }
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

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error("Failed to submit review");
    return await res.json();
  } catch (err) {
    console.warn("API submit review failed, falling back to local storage...", err);
    const reviews = getFallbackReviews();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId,
      productName: reviewData.productName,
      customerName: reviewData.customerName,
      rating: reviewData.rating,
      text: reviewData.text,
      createdAt: new Date().toISOString(),
    };
    const updated = [...reviews, newReview];
    localStorage.setItem("hema_fallback_reviews", JSON.stringify(updated));
    return newReview;
  }
}

export async function login(email: string, password: string): Promise<any> {
  // Always check localStorage for custom admin credentials first to enable static/Vercel persistence!
  const savedCredsStr = localStorage.getItem("hema_custom_admin_creds");
  let adminEmail = "handmade@hemas-keychains.com";
  let adminPassword = "6304702907";
  if (savedCredsStr) {
    try {
      const savedCreds = JSON.parse(savedCredsStr);
      if (savedCreds.email) adminEmail = savedCreds.email;
      if (savedCreds.password) adminPassword = savedCreds.password;
    } catch (e) {
      console.error("Failed to parse saved credentials", e);
    }
  }

  const cleanedEmail = email.trim().toLowerCase();
  const cleanedAdminEmail = adminEmail.trim().toLowerCase();
  
  const isEnteredAdmin = 
    cleanedEmail === "handmade" || 
    cleanedEmail === "handmade@hemas-keychains.com" || 
    cleanedEmail === cleanedAdminEmail ||
    cleanedEmail === cleanedAdminEmail.split("@")[0];

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
      console.warn("Supabase Auth failed, trying local fallback authentication...", err);
      // Fallback: try local/custom auth below if Supabase login fails
    }
  }

  // Check if credentials match our persisted admin credentials
  if (isEnteredAdmin && password === adminPassword) {
    const adminUser = {
      email: adminEmail,
      name: "Hema",
      role: "admin",
      id: "local-admin-id"
    };
    return {
      success: true,
      user: adminUser
    };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid username or password");
    return await res.json();
  } catch (err) {
    console.warn("API login failed, falling back to client-side validation...", err);
    
    if (isEnteredAdmin && password === adminPassword) {
      const adminUser = {
        email: adminEmail,
        name: "Hema",
        role: "admin",
        id: "local-admin-id"
      };
      return {
        success: true,
        user: adminUser
      };
    }
    throw new Error("Invalid email/username or password");
  }
}

export async function updateAdminCredentials(credentials: {
  currentEmail: string;
  currentPassword?: string;
  newEmail: string;
  newPassword?: string;
}): Promise<any> {
  // Read current saved custom admin credentials to verify the update requests
  const savedCredsStr = localStorage.getItem("hema_custom_admin_creds");
  let currentAdminEmail = "handmade@hemas-keychains.com";
  let currentAdminPassword = "6304702907";
  if (savedCredsStr) {
    try {
      const savedCreds = JSON.parse(savedCredsStr);
      if (savedCreds.email) currentAdminEmail = savedCreds.email;
      if (savedCreds.password) currentAdminPassword = savedCreds.password;
    } catch (e) {}
  }

  const enteredEmail = credentials.currentEmail.trim().toLowerCase();
  const isCurrentMatch = 
    (enteredEmail === "handmade" || enteredEmail === "handmade@hemas-keychains.com" || enteredEmail === currentAdminEmail.toLowerCase() || enteredEmail === currentAdminEmail.split("@")[0].toLowerCase()) &&
    (credentials.currentPassword === currentAdminPassword);

  if (!isCurrentMatch) {
    throw new Error("Invalid current username/email or password.");
  }

  // Backup/persist the new credentials inside localStorage immediately for client robustness
  const updatedCreds = {
    email: credentials.newEmail || currentAdminEmail,
    password: credentials.newPassword || currentAdminPassword
  };
  localStorage.setItem("hema_custom_admin_creds", JSON.stringify(updatedCreds));

  if (isSupabaseConfigured()) {
    try {
      return await supabaseUpdateCredentials(credentials);
    } catch (err: any) {
      throw new Error(err.message || "Failed to update credentials in Supabase Auth");
    }
  }

  try {
    const res = await fetch(`${API_BASE}/auth/update-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update credentials");
    }
    return await res.json();
  } catch (err) {
    console.warn("API update credentials failed on static environment, simulated local changes succeeded.", err);
    return { success: true };
  }
}

// Seed data definitions for offline client resilience
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Cute Heart Penguin Keychain",
    description: "Super glossy clay penguin holding a tiny red heart. Features a custom metal heart-shaped ring hook. Handcrafted with love in Marathahalli, Bengaluru.",
    category: "Animal Series",
    price: 150,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviewsCount: 3,
    tag: "100% Glossy Clay"
  },
  {
    id: "prod-2",
    name: "handmade bunny charm",
    description: "A super cute chubby white bunny with tiny hand-painted cheeks and a shiny glaze sealer. Elegant pick for phone charms and backpacks.",
    category: "Animal Series",
    price: 150,
    stock: 10,
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviewsCount: 2,
    tag: "100% Glossy Clay"
  },
  {
    id: "prod-3",
    name: "Penguin charm",
    description: "Handmade glossy baby penguin holding a yellow flower. Perfectly polished, water-resistant clay art.",
    category: "Animal Series",
    price: 150,
    stock: 10,
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 4.7,
    reviewsCount: 1,
    tag: "100% Glossy Clay"
  },
  {
    id: "prod-4",
    name: "Miniature Clay Donut",
    description: "Glazed pink chocolate donut with micro sprinkles. Looks delicious but do not eat! Water-resistant coating.",
    category: "Food Series",
    price: 150,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviewsCount: 4,
    tag: "100% Glossy Clay"
  },
  {
    id: "prod-5",
    name: "Dreamy Cloud charm",
    description: "Soft blue clay cloud with golden dangling star charm. Glossy, dreamy and perfect for keys.",
    category: "Cosmic Series",
    price: 150,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 5,
    reviewsCount: 1,
    tag: "100% Glossy Clay"
  },
  {
    id: "prod-6",
    name: "Starry Night Resin Orb",
    description: "Premium crystal resin dome with embedded glitters and dark night blue pigments.",
    category: "Cosmic Series",
    price: 150,
    stock: 7,
    images: [
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 4.6,
    reviewsCount: 2,
    tag: "Premium Resin"
  },
  {
    id: "prod-7",
    name: "Strawberries Clay Bucket",
    description: "A super cute tiny bucket filled with hand-sculpted red strawberries. Finished with glossy high-gloss varnish.",
    category: "Food Series",
    price: 150,
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80"
    ],
    rating: 5,
    reviewsCount: 1,
    tag: "100% Glossy Clay"
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "HEMA-9081",
    customerName: "Sowmya Reddy",
    customerPhone: "9640653603",
    address: "Flat 402, Sai Nilaya, Marathahalli, Bengaluru, 560037",
    customMessage: "Bake a tiny heart next to the name please!",
    paymentMethod: "UPI",
    paymentId: "239481904812",
    paymentStatus: "Verified",
    total: 150,
    status: "Delivered",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Cute Heart Penguin Keychain",
        productImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
        quantity: 1,
        price: 150
      }
    ],
    createdAt: "2026-07-12T17:15:22.690Z"
  },
  {
    id: "HEMA-3482",
    customerName: "Anjali Rao",
    customerPhone: "9876543210",
    address: "No. 12, Spice Garden Layout, Marathahalli, Bengaluru, 560037",
    customMessage: "With love Sowmya written on box",
    paymentMethod: "UPI",
    paymentId: "981273912384",
    paymentStatus: "Verified",
    total: 300,
    status: "Delivered",
    items: [
      {
        id: "item-2",
        productId: "prod-2",
        productName: "handmade bunny charm",
        productImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
        quantity: 2,
        price: 150
      }
    ],
    createdAt: "2026-07-13T17:15:22.690Z"
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    productName: "Cute Heart Penguin Keychain",
    customerName: "Sowmya Reddy",
    rating: 5,
    text: "Absolutely stunning! The gloss finish is superb and the heart hook is so cute! Hema packed it beautifully too.",
    createdAt: "2026-07-13T17:15:22.690Z"
  },
  {
    id: "rev-2",
    productId: "prod-2",
    productName: "handmade bunny charm",
    customerName: "Anjali Rao",
    rating: 5,
    text: "Incredibly cute keychains! My daughter loved the bunny charm. Fast pickup near Outer Ring Rd Marathahalli.",
    createdAt: "2026-07-14T17:15:22.690Z"
  }
];

// Local Storage Fallbacks to ensure robust offline capability
function getFallbackProducts(): Product[] {
  const saved = localStorage.getItem("hema_fallback_products");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("hema_fallback_products", JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

function getFallbackOrders(): Order[] {
  const saved = localStorage.getItem("hema_fallback_orders");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("hema_fallback_orders", JSON.stringify(DEFAULT_ORDERS));
  return DEFAULT_ORDERS;
}

function getFallbackReviews(): Review[] {
  const saved = localStorage.getItem("hema_fallback_reviews");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("hema_fallback_reviews", JSON.stringify(DEFAULT_REVIEWS));
  return DEFAULT_REVIEWS;
}
