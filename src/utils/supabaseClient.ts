import { createClient } from "@supabase/supabase-js";
import { Product, Order, Review, AdminSettings } from "../types";

// Read from injected Vite define variables (process.env.SUPABASE_URL etc.)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) return false;
    if (
      supabaseUrl === "MY_SUPABASE_URL" ||
      supabaseUrl === "YOUR_SUPABASE_URL" ||
      supabaseUrl.includes("your-project") ||
      supabaseUrl.includes("placeholder")
    ) {
      return false;
    }
    const url = new URL(supabaseUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
};

// Lazy initialization of Supabase Client to avoid crashes when keys are missing
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// =========================================================================
// REAL-TIME SUBSCRIPTION HELPERS
// =========================================================================
export function subscribeToTableChanges(
  table: "products" | "orders" | "reviews" | "admin_settings",
  callback: (payload: any) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`public:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        console.log(`Realtime update received for ${table}:`, payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime channel status for ${table}:`, status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// =========================================================================
// AUTHENTICATION CODE (Sign up, Login, Reset, Session, Admin Checks)
// =========================================================================
function formatEmail(input: string): string {
  if (!input.includes("@")) {
    return `${input.toLowerCase()}@hemas-keychains.com`;
  }
  return input;
}

export async function supabaseSignUp(email: string, password: string, name: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  
  const formattedEmail = formatEmail(email);
  const isDefaultAdmin = formattedEmail === "handmade@hemas-keychains.com";
  const { data, error } = await supabase.auth.signUp({
    email: formattedEmail,
    password,
    options: {
      data: {
        name,
        role: isDefaultAdmin ? "admin" : "customer"
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function supabaseLogin(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const formattedEmail = formatEmail(email);
  let authData: any = null;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password
    });
    if (error) throw error;
    authData = data;
  } catch (err: any) {
    // If sign in fails and it matches the requested default admin credentials, attempt auto-signup
    if (formattedEmail === "handmade@hemas-keychains.com") {
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formattedEmail,
          password,
          options: {
            data: {
              name: "Hema",
              role: "admin"
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          // Retry signing in
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: formattedEmail,
            password
          });
          if (retryError) throw retryError;
          authData = retryData;
        } else {
          throw err;
        }
      } catch (signUpErr) {
        throw err; // throw original login error if auto-signup fails
      }
    } else {
      throw err;
    }
  }

  // Fetch role and details from customer/profile table
  const { data: customerData, error: profileError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", authData.user?.id)
    .single();

  if (profileError) {
    console.error("Failed to fetch customer profile", profileError);
  }

  return {
    user: authData.user,
    profile: customerData || {
      email: authData.user?.email,
      name: authData.user?.user_metadata?.name || formattedEmail.split("@")[0],
      role: authData.user?.user_metadata?.role || "customer"
    }
  };
}

export async function supabaseLogout() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function supabaseResetPassword(email: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const formattedEmail = formatEmail(email);
  const { error } = await supabase.auth.resetPasswordForEmail(formattedEmail, {
    redirectTo: window.location.origin
  });
  if (error) throw error;
}

// =========================================================================
// PRODUCTS WRAPPERS
// =========================================================================
export async function supabaseFetchProducts(page = 0, limit = 100): Promise<Product[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    category: p.category,
    price: Number(p.price),
    stock: p.stock,
    images: p.images || [],
    rating: Number(p.rating),
    reviewsCount: p.reviews_count,
    tag: p.tag
  }));
}

export async function supabaseAddProduct(product: Partial<Product>): Promise<Product> {
  if (!supabase) throw new Error("Supabase not configured");

  const productData = {
    id: product.id || "prod-" + Date.now(),
    name: product.name,
    description: product.description,
    category: product.category || "Clay Crafts",
    price: Number(product.price) || 150,
    stock: Number(product.stock) || 10,
    images: product.images || [],
    tag: product.tag,
    rating: 5.0,
    reviews_count: 0
  };

  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    category: data.category,
    price: Number(data.price),
    stock: data.stock,
    images: data.images || [],
    rating: Number(data.rating),
    reviewsCount: data.reviews_count,
    tag: data.tag
  };
}

export async function supabaseEditProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (!supabase) throw new Error("Supabase not configured");

  const updateData = {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price !== undefined ? Number(product.price) : undefined,
    stock: product.stock !== undefined ? Number(product.stock) : undefined,
    images: product.images,
    tag: product.tag
  };

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    category: data.category,
    price: Number(data.price),
    stock: data.stock,
    images: data.images || [],
    rating: Number(data.rating),
    reviewsCount: data.reviews_count,
    tag: data.tag
  };
}

export async function supabaseDeleteProduct(id: string): Promise<boolean> {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// =========================================================================
// ORDERS WRAPPERS
// =========================================================================
export async function supabaseFetchOrders(): Promise<Order[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (orderErr) throw orderErr;

  return (orders || []).map((o: any) => ({
    id: o.id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    address: o.address,
    customMessage: o.custom_message,
    paymentMethod: o.payment_method,
    paymentId: o.payment_id,
    paymentStatus: o.payment_status,
    total: Number(o.total),
    status: o.status,
    createdAt: o.created_at,
    items: (o.order_items || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productImage: item.product_image,
      quantity: item.quantity,
      price: Number(item.price)
    }))
  }));
}

export async function supabaseCreateOrder(orderData: {
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
  if (!supabase) throw new Error("Supabase not configured");

  const orderId = "HEMA-" + Math.floor(1000 + Math.random() * 9000);

  // Insert main order record
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        id: orderId,
        customer_id: orderData.customerId || null,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        address: orderData.address,
        custom_message: orderData.customMessage,
        payment_method: orderData.paymentMethod,
        payment_id: orderData.paymentId,
        payment_status: orderData.paymentMethod === "UPI" ? "Verified" : "Pending",
        total: orderData.total,
        status: "Pending"
      }
    ])
    .select()
    .single();

  if (orderErr) throw orderErr;

  // Insert order items
  const dbItems = orderData.items.map(item => ({
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    product_image: item.productImage,
    quantity: item.quantity,
    price: Number(item.price)
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(dbItems);

  if (itemsErr) throw itemsErr;

  // Update Stock levels
  for (const item of orderData.items) {
    const { data: currentProd } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .single();

    if (currentProd) {
      const newStock = Math.max(0, currentProd.stock - item.quantity);
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.productId);
    }
  }

  return {
    id: orderId,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    address: orderData.address,
    customMessage: orderData.customMessage,
    paymentMethod: orderData.paymentMethod,
    paymentId: orderData.paymentId,
    paymentStatus: orderData.paymentMethod === "UPI" ? "Verified" : "Pending",
    total: orderData.total,
    status: "Pending",
    createdAt: order.created_at,
    items: orderData.items
  };
}

export async function supabaseUpdateOrderStatus(
  id: string,
  status: string,
  paymentStatus?: string
): Promise<any> {
  if (!supabase) throw new Error("Supabase not configured");

  const updates: any = { status };
  if (paymentStatus) updates.payment_status = paymentStatus;

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =========================================================================
// REVIEWS WRAPPERS
// =========================================================================
export async function supabaseFetchReviews(): Promise<Review[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    customerName: r.customer_name,
    rating: r.rating,
    text: r.text || "",
    createdAt: r.created_at
  }));
}

export async function supabaseAddReview(reviewData: {
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  text: string;
  customerId?: string;
}): Promise<Review> {
  if (!supabase) throw new Error("Supabase not configured");

  const reviewId = "rev-" + Date.now();

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        id: reviewId,
        product_id: reviewData.productId,
        product_name: reviewData.productName,
        customer_name: reviewData.customerName,
        customer_id: reviewData.customerId || null,
        rating: Number(reviewData.rating),
        text: reviewData.text
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    productId: data.product_id,
    productName: data.product_name,
    customerName: data.customer_name,
    rating: data.rating,
    text: data.text || "",
    createdAt: data.created_at
  };
}

// =========================================================================
// ADMIN SETTINGS WRAPPERS
// =========================================================================
export async function supabaseFetchSettings(): Promise<AdminSettings> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("admin_settings")
    .select("*")
    .eq("id", "global_settings")
    .single();

  if (error) throw error;

  return {
    upiId: data.upi_id,
    upiName: data.upi_name,
    bannerMessage: data.banner_message,
    businessName: data.business_name,
    whatsappNumber: data.whatsapp_number,
    instagramId: data.instagram_id,
    qrImageUrl: data.qr_image_url || "",
    logoUrl: data.logo_url || ""
  };
}

export async function supabaseSaveSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  if (!supabase) throw new Error("Supabase not configured");

  const updateData = {
    upi_id: settings.upiId,
    upi_name: settings.upiName,
    banner_message: settings.bannerMessage,
    business_name: settings.businessName,
    whatsapp_number: settings.whatsappNumber,
    instagram_id: settings.instagramId,
    qr_image_url: settings.qrImageUrl,
    logo_url: settings.logoUrl
  };

  const { data, error } = await supabase
    .from("admin_settings")
    .update(updateData)
    .eq("id", "global_settings")
    .select()
    .single();

  if (error) throw error;

  return {
    upiId: data.upi_id,
    upiName: data.upi_name,
    bannerMessage: data.banner_message,
    businessName: data.business_name,
    whatsappNumber: data.whatsapp_number,
    instagramId: data.instagram_id,
    qrImageUrl: data.qr_image_url || "",
    logoUrl: data.logo_url || ""
  };
}

// =========================================================================
// IMAGE UPLOAD CODE
// =========================================================================
export async function supabaseUploadImage(
  bucket: "product-images" | "customer-uploads" | "banners",
  file: File
): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  // Format file name safely
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function supabaseUpdateCredentials(credentials: {
  currentEmail: string;
  currentPassword?: string;
  newEmail: string;
  newPassword?: string;
}) {
  if (!supabase) throw new Error("Supabase is not configured.");

  // Verify credentials first by signing in with the current password
  const currentFormattedEmail = formatEmail(credentials.currentEmail);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentFormattedEmail,
    password: credentials.currentPassword || ""
  });
  if (signInError) {
    throw new Error("Verification failed: " + signInError.message);
  }

  const updateAttrs: any = {};
  if (credentials.newEmail) {
    updateAttrs.email = formatEmail(credentials.newEmail);
  }
  if (credentials.newPassword) {
    updateAttrs.password = credentials.newPassword;
  }

  const { error: updateError } = await supabase.auth.updateUser(updateAttrs);
  if (updateError) {
    throw updateError;
  }

  // Sync profile details to the public.customers table
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error: profileError } = await supabase
      .from("customers")
      .update({
        email: updateAttrs.email || user.email,
        name: credentials.newEmail ? credentials.newEmail.split("@")[0] : undefined
      })
      .eq("id", user.id);
    if (profileError) {
      console.error("Profile sync error on customers table:", profileError);
    }
  }

  return { success: true };
}
