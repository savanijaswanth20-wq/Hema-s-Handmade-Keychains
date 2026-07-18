import React, { useState } from "react";
import { 
  TrendingUp, Package, AlertTriangle, Users, FileSpreadsheet, Plus, Trash2, Edit2, CheckCircle2, 
  RefreshCw, QrCode, Lock, Mail, Key, LayoutDashboard, ArrowRight, Eye, Sparkles, AlertCircle, Upload
} from "lucide-react";
import { Product, Order, AdminSettings, OrderStatus } from "../types";
import { updateAdminCredentials } from "../utils/api";
import { supabaseUploadImage } from "../utils/supabaseClient";

interface DashboardSectionProps {
  products: Product[];
  orders: Order[];
  upiSettings: AdminSettings;
  onAddProduct: (p: Partial<Product>) => void;
  onEditProduct: (id: string, p: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: string, payStatus?: string) => void;
  onSaveSettings: (s: Partial<AdminSettings>) => void;
  user: any;
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

export default function DashboardSection({
  products,
  orders,
  upiSettings,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onSaveSettings,
  user,
  onLogin,
}: DashboardSectionProps) {
  const [subTab, setSubTab] = useState<"metrics" | "products" | "orders" | "qr">("metrics");
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // QR Setup state
  const [upiId, setUpiId] = useState(upiSettings.upiId || "9640653603@ybl");
  const [upiName, setUpiName] = useState(upiSettings.upiName || "Hema's Tiny Universe");
  const [bannerMessage, setBannerMessage] = useState(upiSettings.bannerMessage || "EVERY PURCHASE SUPPORTS A LOCAL ARTIST IN MARATHAHALLI!");
  const [businessName, setBusinessName] = useState(upiSettings.businessName || "CuteCharm Keychains");
  const [whatsappNumber, setWhatsappNumber] = useState(upiSettings.whatsappNumber || "+91 9640653603");
  const [instagramId, setInstagramId] = useState(upiSettings.instagramId || "@hemas_tiny_universe");
  const [qrImageUrl, setQrImageUrl] = useState(upiSettings.qrImageUrl || "");
  const [logoUrl, setLogoUrl] = useState(upiSettings.logoUrl || "");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Admin Credentials Update Form State
  const [currEmail, setCurrEmail] = useState("");
  const [currPass, setCurrPass] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [credError, setCredError] = useState("");
  const [credSuccess, setCredSuccess] = useState("");
  const [updatingCreds, setUpdatingCreds] = useState(false);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");
    setCredSuccess("");
    setUpdatingCreds(true);
    try {
      await updateAdminCredentials({
        currentEmail: currEmail,
        currentPassword: currPass,
        newEmail,
        newPassword: newPass
      });
      setCredSuccess("Admin credentials updated successfully!");
      setCurrEmail("");
      setCurrPass("");
      setNewEmail("");
      setNewPass("");
    } catch (err: any) {
      setCredError(err.message || "Failed to update credentials. Check current credentials.");
    } finally {
      setUpdatingCreds(false);
    }
  };

  // Edit/Add Product form state
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCategory, setProdCategory] = useState("Animal Series");
  const [prodPrice, setProdPrice] = useState(150);
  const [prodStock, setProdStock] = useState(10);
  const [prodTag, setProdTag] = useState("100% Glossy Clay");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setLoginError("Invalid email or password.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid email or password.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSaveQRSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({ 
      upiId, 
      upiName, 
      bannerMessage,
      businessName,
      whatsappNumber,
      instagramId,
      qrImageUrl,
      logoUrl
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    setIsUploading(true);
    let uploadedUrl = prodImageUrl;

    try {
      if (prodImageFile) {
        uploadedUrl = await supabaseUploadImage("product-images", prodImageFile);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
      setIsUploading(false);
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      category: prodCategory,
      price: Number(prodPrice),
      stock: Number(prodStock),
      tag: prodTag,
      images: uploadedUrl ? [uploadedUrl] : undefined
    };

    if (editingProd) {
      onEditProduct(editingProd.id, payload);
    } else {
      onAddProduct(payload);
    }

    // Reset Form
    setIsAddingNew(false);
    setEditingProd(null);
    setProdName("");
    setProdDesc("");
    setProdCategory("Animal Series");
    setProdPrice(150);
    setProdStock(10);
    setProdTag("100% Glossy Clay");
    setProdImageUrl("");
    setProdImageFile(null);
    setIsUploading(false);
  };

  const startEditProduct = (p: Product) => {
    setEditingProd(p);
    setIsAddingNew(false);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdStock(p.stock);
    setProdTag(p.tag || "100% Glossy Clay");
    setProdImageUrl(p.images[0] || "");
    setProdImageFile(null);
  };

  const handleExportOrders = () => {
    window.open("/api/orders/export", "_blank");
  };

  // Metrics calculators (screen-accurate metrics!)
  // In our seeded database:
  // - Accumulated Revenue: sum of totals of completed/delivered/verified orders
  const revenueTotal = orders
    .filter((o) => o.status === "Delivered" || o.paymentStatus === "Verified")
    .reduce((sum, o) => sum + o.total, 0);

  const activeStockCount = products.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  const lowStockAlerts = products.filter((p) => p.stock <= 5);

  // Customer List derived dynamically from unique names/phones
  const customersMap = new Map();
  orders.forEach((o) => {
    if (!customersMap.has(o.customerPhone)) {
      customersMap.set(o.customerPhone, {
        name: o.customerName,
        phone: o.customerPhone,
        address: o.address,
        ordersCount: 0,
        totalSpent: 0
      });
    }
    const cust = customersMap.get(o.customerPhone);
    cust.ordersCount += 1;
    cust.totalSpent += o.total;
  });
  const customersList = Array.from(customersMap.values());

  // Dynamic Chart values calculations (Custom SVG layout)
  // Let's count order counts in the last 5 days
  const dateCounts = new Map();
  orders.forEach((o) => {
    const d = new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    dateCounts.set(d, (dateCounts.get(d) || 0) + o.total);
  });
  const chartData = Array.from(dateCounts.entries()).map(([date, revenue]) => ({ date, revenue })).slice(0, 5).reverse();

  // Secure admin wall
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto p-8 glass-panel dark:bg-neutral-900 dark:border-neutral-800 rounded-3xl border border-pink-100 shadow-xl space-y-6 transition-colors duration-300 text-left">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center mx-auto shadow-inner animate-pulse-slow">
          <Lock className="w-5 h-5" />
        </div>

        <div className="space-y-1.5 text-center">
          <h3 className="font-serif text-2xl font-bold text-gray-950 dark:text-white">Admin Secure Vault</h3>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Authorize to manage inventory, track statements & handle payments
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
            ⚠️ {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Admin Username / Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-gray-400" /> Secure Pin / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 bg-brand-rose hover:bg-brand-rose-dark text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform cursor-pointer pt-3"
          >
            {loggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify Identity"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 transition-colors duration-300 text-left">
      
      {/* 1. Admin Header Hub (Matching Screenshot 1 exactly!) */}
      <section className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 p-6 rounded-3xl border border-pink-100/50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-brand-rose dark:text-pink-300 font-extrabold text-base">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="font-serif text-2xl font-bold text-gray-950 dark:text-white">Hema's Admin Hub</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Control inventory, process order shipments & change QRs instantly
          </p>
        </div>

        {/* Dashboard sub-navigation pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSubTab("metrics")}
            className={`px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              subTab === "metrics"
                ? "bg-brand-rose text-white shadow-md shadow-rose-200 dark:shadow-none"
                : "bg-white hover:bg-pink-50 dark:bg-neutral-950 dark:text-gray-300 border border-pink-100 dark:border-neutral-800 text-gray-600"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          
          <button
            onClick={() => setSubTab("products")}
            className={`px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              subTab === "products"
                ? "bg-brand-rose text-white shadow-md shadow-rose-200 dark:shadow-none"
                : "bg-white hover:bg-pink-50 dark:bg-neutral-950 dark:text-gray-300 border border-pink-100 dark:border-neutral-800 text-gray-600"
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Products & Stock
          </button>

          <button
            onClick={() => setSubTab("orders")}
            className={`px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              subTab === "orders"
                ? "bg-brand-rose text-white shadow-md shadow-rose-200 dark:shadow-none"
                : "bg-white hover:bg-pink-50 dark:bg-neutral-950 dark:text-gray-300 border border-pink-100 dark:border-neutral-800 text-gray-600"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Orders
          </button>

          <button
            onClick={() => setSubTab("qr")}
            className={`px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              subTab === "qr"
                ? "bg-brand-rose text-white shadow-md shadow-rose-200 dark:shadow-none"
                : "bg-white hover:bg-pink-50 dark:bg-neutral-950 dark:text-gray-300 border border-pink-100 dark:border-neutral-800 text-gray-600"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> QR Setup
          </button>
        </div>
      </section>

      {/* 2. Metrics blocks row (Accumulated Revenue, Active Stock, Pending, Delivered) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Accumulated Revenue</span>
            <strong className="text-3xl font-serif text-brand-rose dark:text-pink-300">₹{revenueTotal}</strong>
            <span className="text-[9px] text-emerald-600 font-bold block">📈 Checked Out Sales</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-neutral-800 flex items-center justify-center text-brand-rose text-lg font-black font-serif">
            ₹
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Active Stock</span>
            <strong className="text-3xl font-serif text-gray-900 dark:text-white">{activeStockCount} items</strong>
            <span className="text-[9px] text-gray-400 font-semibold block">Distinct catalog listings</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-neutral-800 flex items-center justify-center text-gray-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Pending Orders</span>
            <strong className="text-3xl font-serif text-amber-600">{pendingOrdersCount}</strong>
            <span className="text-[9px] text-amber-500 font-bold block">Needs confirmation & pkg</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-neutral-800 flex items-center justify-center text-amber-500">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Delivered Packages</span>
            <strong className="text-3xl font-serif text-emerald-600">{deliveredCount}</strong>
            <span className="text-[9px] text-emerald-600 font-bold block">Completed and shipped</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-neutral-800 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* 3. Sub tab body renders */}

      {/* SUB-TAB: Dashboard metrics and sales charts */}
      {subTab === "metrics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Custom SVG Sales Chart */}
          <div className="lg:col-span-2 glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-6">
            <div className="flex justify-between items-center border-b border-pink-50 dark:border-neutral-800 pb-3">
              <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Sales Performance Ledger</h4>
              <span className="text-[10px] font-bold text-brand-rose bg-brand-rose-light px-2 py-0.5 rounded uppercase">Daily revenue summary</span>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="relative h-64 bg-pink-50/10 dark:bg-neutral-950/30 rounded-2xl border border-pink-50 dark:border-neutral-800 flex items-end justify-between p-6">
              
              {/* Visual chart guides */}
              <div className="absolute inset-x-0 bottom-12 h-[1px] bg-gray-100 dark:bg-neutral-800"></div>
              <div className="absolute inset-x-0 bottom-24 h-[1px] bg-gray-100 dark:bg-neutral-800"></div>
              <div className="absolute inset-x-0 bottom-36 h-[1px] bg-gray-100 dark:bg-neutral-800"></div>

              {chartData.length > 0 ? (
                chartData.map((d, index) => {
                  // Max height helper
                  const maxRevenue = Math.max(...chartData.map((x) => x.revenue), 300);
                  const barHeightPercent = (d.revenue / maxRevenue) * 75; // max 75% height

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group z-10">
                      
                      {/* Bar Revenue amount indicator on hover */}
                      <span className="text-[10px] font-bold text-brand-rose bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded shadow border border-pink-50 dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ₹{d.revenue}
                      </span>

                      {/* Bar fill */}
                      <div 
                        className="w-10 sm:w-12 bg-gradient-to-t from-pink-300 to-brand-rose rounded-t-lg shadow-sm group-hover:from-brand-rose group-hover:to-brand-rose-dark transition-all duration-500 cursor-pointer"
                        style={{ height: `${Math.max(10, barHeightPercent)}%` }}
                      ></div>

                      {/* Bar date */}
                      <span className="text-[10px] text-gray-400 font-bold font-mono">
                        {d.date}
                      </span>

                    </div>
                  );
                })
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                  No orders generated in this session yet.
                </div>
              )}

            </div>
          </div>

          {/* Right: Low Stock Alerts & Statement Export */}
          <div className="space-y-6">
            
            {/* Low stock alerts panel (User requirement!) */}
            <div className="glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-4">
              <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" /> Low Stock Alerts
              </h4>

              <div className="space-y-3">
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((p) => (
                    <div 
                      key={p.id}
                      className="flex justify-between items-center bg-amber-50/50 dark:bg-neutral-950/30 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30 text-xs font-semibold"
                    >
                      <span className="text-gray-900 dark:text-white truncate max-w-[150px]">{p.name}</span>
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono uppercase text-[9px] tracking-wide animate-pulse">
                        Only {p.stock} left
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-50/50 text-emerald-600 rounded-xl text-center text-xs font-bold uppercase">
                    All stock levels healthy!
                  </div>
                )}
              </div>
            </div>

            {/* Excel Statement Export panel (User requirement!) */}
            <div className="glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-4">
              <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Export Statements
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Generate and download an Excel-compatible CSV file containing all client names, phones, destination addresses, transaction reference IDs, total payments, and baking status records instantly.
              </p>
              <button
                onClick={handleExportOrders}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-100 dark:shadow-none"
              >
                <FileSpreadsheet className="w-4 h-4" /> Download Excel CSV
              </button>
            </div>

          </div>

          {/* Customer list section */}
          <div className="lg:col-span-3 glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-4">
            <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Client Database ({customersList.length} verified buyers)
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-pink-50 dark:border-neutral-800 text-gray-400 font-bold uppercase text-[9px]">
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Recent Address</th>
                    <th className="py-3 px-4 text-center">Orders Count</th>
                    <th className="py-3 px-4 text-right">Accumulated Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50/50 dark:divide-neutral-800 font-medium">
                  {customersList.map((c, idx) => (
                    <tr key={idx} className="hover:bg-pink-50/20 dark:hover:bg-neutral-950/20">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="py-3 px-4 font-mono">{c.phone}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-500">{c.address}</td>
                      <td className="py-3 px-4 text-center font-bold text-brand-rose">{c.ordersCount}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">₹{c.totalSpent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: Products Inventory CRUD */}
      {subTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Product Form (Add / Edit) */}
          <div className="lg:col-span-4 glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-6 h-fit">
            <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-pink-50 pb-2">
              {editingProd ? "Modify Baked Item" : "Sculpt New Item"}
            </h4>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-gray-700 dark:text-gray-300">Keychain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cute Clay Penguin"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 dark:text-gray-300">Description & Sizing</label>
                <textarea
                  placeholder="Hand-sculpted in Marathahalli with high gloss..."
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-700 dark:text-gray-300">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 dark:text-gray-300">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-700 dark:text-gray-300">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  >
                    <option value="Animal Series">Animal Series</option>
                    <option value="Food Series">Food Series</option>
                    <option value="Cosmic Series">Cosmic Series</option>
                    <option value="Custom Initials">Custom Initials</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 dark:text-gray-300">Label Tag</label>
                  <input
                    type="text"
                    value={prodTag}
                    onChange={(e) => setProdTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 dark:text-gray-300">Display Photo URL or Upload File</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    placeholder="Paste image link..."
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProdImageFile(e.target.files[0]);
                          setProdImageUrl(""); // Clear URL if file selected
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-brand-rose/10 text-brand-rose hover:bg-brand-rose/20 rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {prodImageFile ? 'File Selected' : 'Upload'}
                    </button>
                  </div>
                </div>
                {prodImageFile && (
                  <p className="text-xs text-brand-rose mt-1 truncate">
                    Selected: {prodImageFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 bg-brand-rose hover:bg-brand-rose-dark text-white rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isUploading && <RefreshCw className="animate-spin w-4 h-4" />}
                  {editingProd ? "Save Changes" : "Create Item"}
                </button>
                {(editingProd || isAddingNew) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProd(null);
                      setIsAddingNew(false);
                      setProdName("");
                    }}
                    className="px-4 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Products List with Delete & Edit */}
          <div className="lg:col-span-8 glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-4">
            <div className="flex justify-between items-center border-b border-pink-50 dark:border-neutral-800 pb-2">
              <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Active Product Catalog</h4>
              <button
                onClick={() => {
                  setEditingProd(null);
                  setIsAddingNew(true);
                  setProdName("");
                }}
                className="px-3.5 py-1.5 bg-neutral-900 dark:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-pink-50 dark:border-neutral-800 text-gray-400 font-bold uppercase text-[9px]">
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50/50 dark:divide-neutral-800 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-pink-50/20 dark:hover:bg-neutral-950/20">
                      <td className="py-3 px-4">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 dark:text-white block truncate max-w-[150px]">{p.name}</span>
                        <span className="text-[9px] text-gray-400">{p.tag}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-brand-rose">₹{p.price}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded font-bold font-mono ${p.stock <= 5 ? "bg-red-50 text-red-600 animate-pulse" : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800"}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-1.5 hover:bg-pink-100 rounded text-gray-500 hover:text-brand-rose cursor-pointer transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB: Orders Manager with full Dropdowns */}
      {subTab === "orders" && (
        <div className="glass-panel dark:bg-neutral-900 p-6 rounded-3xl border border-pink-100 space-y-4">
          <div className="flex justify-between items-center border-b border-pink-50 dark:border-neutral-800 pb-2">
            <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Active Order Processing List</h4>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{orders.length} total orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pink-50 dark:border-neutral-800 text-gray-400 font-bold uppercase text-[9px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Client Detail</th>
                  <th className="py-3 px-4">Address / Message</th>
                  <th className="py-3 px-4">Items / Total</th>
                  <th className="py-3 px-4">Payment Verification</th>
                  <th className="py-3 px-4">Bake Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50/50 dark:divide-neutral-800 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-pink-50/20 dark:hover:bg-neutral-950/20">
                    
                    <td className="py-4 px-4 font-mono font-bold text-gray-950 dark:text-white">
                      {o.id}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 dark:text-white block">{o.customerName}</span>
                      <span className="text-[10px] text-gray-400 font-mono block">{o.customerPhone}</span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="truncate text-gray-500" title={o.address}>{o.address}</p>
                      {o.customMessage && (
                        <span className="text-[10px] text-pink-500 italic block">
                          📝 Inscription: "{o.customMessage}"
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-gray-900 dark:text-white">
                        {o.items.map((it, idx) => (
                          <span key={idx} className="block truncate max-w-[140px]" title={it.productName}>
                            • {it.productName} ({it.quantity}x)
                          </span>
                        ))}
                      </div>
                      <strong className="text-brand-rose dark:text-pink-300 block pt-1">₹{o.total}</strong>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <select
                          value={o.paymentStatus}
                          onChange={(e) => onUpdateOrderStatus(o.id, o.status, e.target.value)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border outline-none font-sans ${
                            o.paymentStatus === 'Verified'
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          <option value="Pending">Pending verify</option>
                          <option value="Verified">Verified OK</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                        {o.paymentId && (
                          <span className="text-[9px] text-gray-400 font-mono block truncate max-w-[120px]" title={o.paymentId}>
                            Ref: {o.paymentId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border outline-none ${
                          o.status === 'Delivered'
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : o.status === 'Shipped'
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : o.status === 'Cancelled'
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        <option value="Pending">1. Pending Verify</option>
                        <option value="Baking">2. Baking Oven</option>
                        <option value="Glossing">3. Triple Gloss</option>
                        <option value="Shipped">4. Dispatched</option>
                        <option value="Delivered">5. Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: UPI QR Payee Setup */}
      {subTab === "qr" && (
        <div className="max-w-2xl mx-auto glass-panel dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-pink-100 space-y-6 text-left">
          <div className="flex items-center gap-2 border-b border-pink-50 dark:border-neutral-800 pb-3">
            <QrCode className="w-5 h-5 text-brand-rose" />
            <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Store Branding & UPI Config</h4>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold text-center">
              ✔️ Store settings and UPI configurations updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveQRSettings} className="space-y-5 text-xs font-semibold">
            {/* Business Name and Presets */}
            <div className="space-y-2">
              <label className="text-gray-700 dark:text-gray-300">Active Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. CuteCharm Keychains"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
              />
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase">Suggested Names (Click to select):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "CuteCharm Keychains",
                    "KeyCharm Marathahalli",
                    "HappyKey Creations",
                    "Bunny & Friends Keychains",
                    "Kawaii Keychains India",
                    "Hema's Tiny Universe"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBusinessName(preset)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        businessName === preset
                          ? "bg-brand-rose text-white border-brand-rose"
                          : "bg-pink-50/50 hover:bg-pink-100 text-brand-rose border-pink-100 dark:bg-neutral-900 dark:border-neutral-800 dark:text-pink-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-700 dark:text-gray-300">WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 9640653603"
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-700 dark:text-gray-300">Instagram Handle *</label>
                <input
                  type="text"
                  required
                  value={instagramId}
                  onChange={(e) => setInstagramId(e.target.value)}
                  placeholder="@hemas_tiny_universe"
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-700 dark:text-gray-300">Store Top Banner Message</label>
              <input
                type="text"
                value={bannerMessage}
                onChange={(e) => setBannerMessage(e.target.value)}
                placeholder="EVERY PURCHASE SUPPORTS A LOCAL ARTIST IN MARATHAHALLI!"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-700 dark:text-gray-300">UPI ID / Virtual Payee Address *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium font-mono"
                />
                <span className="text-[10px] text-gray-400 font-semibold block">
                  e.g. 9640653603@ybl or paytm merchant address.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-700 dark:text-gray-300">Account / Payee Name *</label>
                <input
                  type="text"
                  required
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-semibold"
                />
                <span className="text-[10px] text-gray-400 font-semibold block">
                  Name registered on merchant UPI.
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-pink-50 dark:border-neutral-800 pt-4">
              <label className="text-gray-700 dark:text-gray-300 font-bold text-[10px] uppercase tracking-wider block">Storefront Logo Icon</label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-3 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-neutral-950 border border-pink-100 dark:border-neutral-800 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Storefront Logo" className="w-full h-full object-cover" />
                    ) : (
                      <LayoutDashboard className="w-6 h-6 text-pink-300" />
                    )}
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold mt-1.5 cursor-pointer underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                
                <div className="sm:col-span-9 space-y-2">
                  {/* Drag-and-drop / manual select */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                    onDragLeave={() => setIsDraggingLogo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingLogo(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = (uploadEvent) => {
                          if (uploadEvent.target?.result) {
                            setLogoUrl(uploadEvent.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDraggingLogo 
                        ? "border-[#E04B73] bg-pink-50/30 dark:bg-pink-950/10" 
                        : "border-pink-100 hover:border-[#E04B73] dark:border-neutral-800"
                    }`}
                    onClick={() => document.getElementById("logo-upload-input")?.click()}
                  >
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            if (uploadEvent.target?.result) {
                              setLogoUrl(uploadEvent.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                      Drag & drop logo file here, or <span className="text-[#E04B73] underline">click to browse</span>
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">PNG, JPG, SVG up to 2MB. Applied across headers instantly.</p>
                  </div>

                  {/* Manual URL Input alternative */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">— OR PASTE IMAGE URL —</span>
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (e.g. from postimg/unsplash)"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-700 dark:text-gray-300">Custom Payment QR Image URL (Optional)</label>
              <input
                type="text"
                value={qrImageUrl}
                onChange={(e) => setQrImageUrl(e.target.value)}
                placeholder="Leave blank to generate dynamic standard QR, or paste custom QR image URL"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-rose hover:bg-brand-rose-dark text-white rounded-xl font-bold text-xs uppercase cursor-pointer transition-all shadow-md hover:shadow-lg"
            >
              Update Storefront Config
            </button>
          </form>

          {/* Admin Security & Credentials Update Form */}
          <div className="border-t border-pink-100 dark:border-neutral-800 pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-brand-rose" />
              <h5 className="font-serif text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Update Admin Login Credentials</h5>
            </div>

            {credSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold text-center">
                ✔️ {credSuccess}
              </div>
            )}

            {credError && (
              <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold text-center">
                ❌ {credError}
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-700 dark:text-gray-300">Current Username/Email *</label>
                  <input
                    type="text"
                    required
                    value={currEmail}
                    onChange={(e) => setCurrEmail(e.target.value)}
                    placeholder="Enter current email or username"
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-700 dark:text-gray-300">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-700 dark:text-gray-300">New Username/Email *</label>
                  <input
                    type="text"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email or username"
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-700 dark:text-gray-300">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingCreds}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-xl font-bold text-xs uppercase cursor-pointer transition-all disabled:opacity-50"
              >
                {updatingCreds ? "Updating Credentials..." : "Change Login Credentials"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
