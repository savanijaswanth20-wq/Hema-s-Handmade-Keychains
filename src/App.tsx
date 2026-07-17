import React, { useState, useEffect } from "react";
import { Sparkles, Heart, RefreshCw, MapPin } from "lucide-react";
import Header from "./components/Header";
import ElegantBackground from "./components/ElegantBackground";
import HomeSection from "./components/HomeSection";
import ProductsSection from "./components/ProductsSection";
import CartSection from "./components/CartSection";
import OrderTrackSection from "./components/OrderTrackSection";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/ContactSection";
import DashboardSection from "./components/DashboardSection";
import { Product, Order, Review, AdminSettings } from "./types";
import * as api from "./utils/api";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [upiSettings, setUpiSettings] = useState<AdminSettings>({
    upiId: "9640653603@ybl",
    upiName: "Hema's Tiny Universe",
    bannerMessage: "✨ EXTRA CUTE HANDMADE CLAY CHARMS & CUSTOMIZABLE CARTOON KEYCHAINS! ✨",
    businessName: "Hema's Handmade Keychains",
    whatsappNumber: "+91 9640653603",
    instagramId: "hemas_tiny_universe",
    qrImageUrl: "",
    logoUrl: ""
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Cart & Wishlist states with local storage sync
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const saved = localStorage.getItem("hema_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem("hema_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("hema_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  // Authenticated user state
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("hema_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem("hema_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("hema_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Apply Dark Mode class to root document element
  useEffect(() => {
    localStorage.setItem("hema_dark_mode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Initial Database load from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodsData, ordersData, reviewsData, settingsData] = await Promise.all([
          api.fetchProducts(),
          api.fetchOrders(),
          api.fetchReviews(),
          api.fetchSettings()
        ]);

        setProducts(prodsData);
        setOrders(ordersData);
        setReviews(reviewsData);
        setUpiSettings(settingsData);

        // Also save a fallback copy locally for robust resilience
        localStorage.setItem("hema_fallback_products", JSON.stringify(prodsData));
        localStorage.setItem("hema_fallback_orders", JSON.stringify(ordersData));
        localStorage.setItem("hema_fallback_reviews", JSON.stringify(reviewsData));
      } catch (err) {
        console.error("Error loading server-side data, fallbacks will be used.", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cart operations handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx !== -1) {
        const newCart = [...prev];
        newCart[idx] = {
          ...newCart[idx],
          quantity: Math.min(product.stock, newCart[idx].quantity + quantity)
        };
        return newCart;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    // Redirect to Cart tab for high conversion
    setCurrentTab("cart");
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.stock, quantity) };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist toggle handler
  const handleAddWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Checkout submit handler
  const handleSubmitOrder = async (orderData: any) => {
    try {
      const newOrder = await api.createOrder(orderData);
      setOrders((prev) => [newOrder, ...prev]);
      
      // Update local product stock levels instantly
      setProducts((prev) =>
        prev.map((p) => {
          const orderedItem = orderData.items.find((item: any) => item.productId === p.id);
          if (orderedItem) {
            return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
          }
          return p;
        })
      );

      // Empty basket upon success
      setCart([]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to submit order. Please try again.");
    }
  };

  // Auth logins
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login(email, pass);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem("hema_user", JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failure", err);
      return false;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hema_user");
    setCurrentTab("home");
  };

  // Admin: Add Product handler
  const handleAddProduct = async (productPayload: Partial<Product>) => {
    try {
      const newProduct = await api.addProduct(productPayload);
      setProducts((prev) => [...prev, newProduct]);
    } catch (err) {
      console.error("Error adding product", err);
    }
  };

  // Admin: Edit Product handler
  const handleEditProduct = async (id: string, productPayload: Partial<Product>) => {
    try {
      const updated = await api.editProduct(id, productPayload);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error("Error editing product", err);
    }
  };

  // Admin: Delete Product handler
  const handleDeleteProduct = async (id: string) => {
    try {
      const success = await api.deleteProduct(id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  // Admin: Update Order Status handler
  const handleUpdateOrderStatus = async (id: string, status: string, payStatus?: string) => {
    try {
      const updated = await api.updateOrderStatus(id, status, payStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  // Admin: Save settings handler
  const handleSaveSettings = async (settingsPayload: Partial<AdminSettings>) => {
    try {
      const updated = await api.saveSettings(settingsPayload);
      setUpiSettings(updated);
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  // Submit Review handler
  const handleSubmitReview = async (reviewData: any) => {
    try {
      const newReview = await api.addReview(reviewData);
      setReviews((prev) => [newReview, ...prev]);

      // Trigger rating count sync inside our local state list of products
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === reviewData.productId) {
            const productReviews = [newReview, ...reviews.filter((r) => r.productId === p.id)];
            const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
            return {
              ...p,
              rating: Number(avg.toFixed(1)),
              reviewsCount: productReviews.length
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Error submitting review", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      {/* Elegant Website Background with Soft Light Pink Gradients, Sparks, Bokeh & Clay Flowers */}
      <ElegantBackground />
      
      {/* Dynamic customizable Top Announcement Marquee Banner (configured by Admin!) */}
      {upiSettings.bannerMessage && (
        <div className="w-full bg-gradient-to-r from-[#E04B73] via-[#FF6B8B] to-[#E04B73] text-white py-2 overflow-hidden relative z-40 border-b border-pink-700/10 shadow-sm select-none">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-[10px] sm:text-xs font-black tracking-widest uppercase">
            <div className="flex items-center gap-12 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
              <span>{upiSettings.bannerMessage}</span>
              <Heart className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
              <span>FREE PHYSICAL PICKUP IN MARATHAHALLI, BENGALURU!</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
              <span>100% WATER-RESISTANT GLOSSY CLAY CHARMS</span>
              <Heart className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
            </div>
            <div className="flex items-center gap-12 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
              <span>{upiSettings.bannerMessage}</span>
              <Heart className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
              <span>FREE PHYSICAL PICKUP IN MARATHAHALLI, BENGALURU!</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
              <span>100% WATER-RESISTANT GLOSSY CLAY CHARMS</span>
              <Heart className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
            </div>
            <div className="flex items-center gap-12 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
              <span>{upiSettings.bannerMessage}</span>
              <Heart className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
              <span>FREE PHYSICAL PICKUP IN MARATHAHALLI, BENGALURU!</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
              <span>100% WATER-RESISTANT GLOSSY CLAY CHARMS</span>
              <Heart className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Shared Storefront Header */}
      <div className="relative z-10">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          cart={cart}
          wishlist={wishlist}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          user={user}
          onLogout={handleLogout}
          upiSettings={upiSettings}
        />
      </div>

      {/* Main Content Sections */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-10 h-10 text-brand-rose animate-spin" />
            <p className="text-sm font-semibold text-gray-500 animate-pulse uppercase tracking-wider">
              Baking Hema's Clay Catalog...
            </p>
          </div>
        ) : (
          <>
            {currentTab === "home" && (
              <HomeSection
                setCurrentTab={setCurrentTab}
                products={products}
                reviews={reviews}
                onAddWishlist={handleAddWishlist}
                wishlist={wishlist}
                upiSettings={upiSettings}
              />
            )}

            {currentTab === "products" && (
              <ProductsSection
                products={products}
                reviews={reviews}
                cart={cart}
                onAddToCart={handleAddToCart}
                onAddWishlist={handleAddWishlist}
                wishlist={wishlist}
                onSubmitReview={handleSubmitReview}
              />
            )}

            {currentTab === "wishlist" && (
              <div className="space-y-8 pb-12">
                <div className="space-y-1.5 text-center">
                  <h3 className="font-serif text-3xl font-bold text-gray-950 dark:text-white">Your Favorite Wishlist</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                    Save the designs you absolutely adore for bulk customized gifts!
                  </p>
                </div>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlist.map((p) => (
                      <div 
                        key={p.id}
                        className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 rounded-2xl overflow-hidden border border-pink-100/60 p-4 relative flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => handleAddWishlist(p)}
                          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white shadow-sm text-brand-rose cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-brand-rose text-brand-rose" />
                        </button>

                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-pink-50">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>

                        <div className="space-y-2 mt-4 text-left">
                          <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white">{p.name}</h4>
                          <span className="font-serif text-xl font-black text-brand-rose block">₹{p.price}</span>
                          <button
                            onClick={() => handleAddToCart(p, 1)}
                            className="w-full py-2 bg-brand-rose hover:bg-brand-rose-dark text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Add to Checkout Basket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel dark:bg-neutral-900 p-12 text-center rounded-2xl border border-pink-100 text-gray-500 max-w-md mx-auto">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-semibold">Your wishlist is empty.</p>
                    <p className="text-xs text-gray-400 mt-1">Browse our products and click the heart icon on any product to save it!</p>
                    <button
                      onClick={() => setCurrentTab("products")}
                      className="mt-4 px-4 py-2 bg-brand-rose text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Browse keychains
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentTab === "track" && (
              <OrderTrackSection orders={orders} />
            )}

            {currentTab === "gallery" && (
              <GallerySection />
            )}

            {currentTab === "contact" && (
              <ContactSection upiSettings={upiSettings} />
            )}

            {currentTab === "cart" && (
              <CartSection
                cart={cart}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveFromCart}
                onSubmitOrder={handleSubmitOrder}
                upiSettings={upiSettings}
                setCurrentTab={setCurrentTab}
              />
            )}

            {currentTab === "dashboard" && (
              <DashboardSection
                products={products}
                orders={orders}
                upiSettings={upiSettings}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSaveSettings={handleSaveSettings}
                user={user}
                onLogin={handleLogin}
              />
            )}
          </>
        )}
      </main>

      {/* Shared Footer Area */}
      <footer className="w-full bg-transparent py-10 text-center text-xs text-gray-500 dark:text-gray-400 space-y-4 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[#E04B73] dark:text-pink-400 font-bold text-xs">
          <span className="flex items-center gap-1">📍 Marathahalli, Bengaluru</span>
          <span>•</span>
          <span className="flex items-center gap-1">📞 {upiSettings.whatsappNumber || "+91 9640653603"}</span>
          <span>•</span>
          <span className="flex items-center gap-1">📸 @{(upiSettings.instagramId || "hemas_tiny_universe").replace(/^@/, "")}</span>
        </div>
        <p className="text-gray-500/80 dark:text-gray-400 font-semibold text-[10px]">
          © 2026 Hema's Handmade Keychains India. All Rights Reserved. Handmade with love.
        </p>
        
        <div className="pt-2">
          <button
            onClick={() => setCurrentTab("dashboard")}
            className="border border-pink-200/80 bg-white/60 dark:bg-neutral-900/60 text-[#E04B73] hover:bg-white dark:hover:bg-neutral-800 text-[10px] font-black uppercase px-4.5 py-2 rounded-full tracking-wider shadow-sm flex items-center justify-center gap-1.5 mx-auto w-fit cursor-pointer transition-all hover:scale-105"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Store Admin Area</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
