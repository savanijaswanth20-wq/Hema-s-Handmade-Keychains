import React, { useState } from "react";
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, CheckCircle2, MessageSquare, ShieldCheck, Heart, Sparkles, MapPin } from "lucide-react";
import { Product, OrderItem, AdminSettings } from "../types";

interface CartSectionProps {
  cart: { product: Product; quantity: number }[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onSubmitOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    address: string;
    customMessage?: string;
    paymentMethod: "UPI" | "WhatsApp";
    paymentId?: string;
    total: number;
    items: OrderItem[];
  }) => void;
  upiSettings: AdminSettings;
  setCurrentTab: (tab: string) => void;
}

export default function CartSection({
  cart,
  onUpdateQty,
  onRemoveItem,
  onSubmitOrder,
  upiSettings,
  setCurrentTab,
}: CartSectionProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "WhatsApp">("UPI");
  const [upiRefId, setUpiRefId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = 0; // Free shipping pan-India as shown in the image reference!
  const total = subtotal + deliveryCharge;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiSettings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render dynamic UPI QR code URL
  const upiDeepLink = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiName)}&am=${total}&cu=INR`;
  
  // Dynamic high-fidelity QR code with exact amount parameter
  const qrCodeUrl = upiSettings.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}&color=d3455b`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Your basket is empty. Add some lovely keychains first!");
      return;
    }

    if (!customerName || !customerPhone || !address) {
      setErrorMsg("Please fill in your delivery name, phone, and complete home address.");
      return;
    }

    if (paymentMethod === "UPI" && (!upiRefId || upiRefId.trim().length !== 12)) {
      setErrorMsg("Please enter a valid 12-digit UPI Transaction ID or Ref ID to verify payment.");
      return;
    }

    // Map cart items to OrderItems
    const orderItems: OrderItem[] = cart.map((item, idx) => ({
      id: "item-" + idx + "-" + Date.now(),
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0],
      quantity: item.quantity,
      price: item.product.price,
    }));

    try {
      onSubmitOrder({
        customerName,
        customerPhone,
        address,
        customMessage,
        paymentMethod,
        paymentId: paymentMethod === "UPI" ? upiRefId : undefined,
        total,
        items: orderItems,
      });

      // Clear checkout inputs and show success
      setOrderComplete({
        id: "HEMA-" + Math.floor(1000 + Math.random() * 9000), // Visual fallback
        customerName,
        total,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit order. Please try again.");
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto p-8 glass-panel bg-[#FFF0F2]/85 dark:bg-[#2D161B]/40 backdrop-blur-md rounded-3xl border border-pink-200/40 shadow-xl text-center space-y-6 transition-all duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-sm animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 fill-current" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-3xl font-bold text-gray-950 dark:text-white">
            Baked with Love!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
            Order successfully registered
          </p>
        </div>

        <div className="bg-white/50 dark:bg-rose-950/20 p-5 rounded-2xl border border-pink-100/30 text-left space-y-3 font-medium text-xs sm:text-sm">
          <div className="flex justify-between border-b border-pink-50 pb-2">
            <span className="text-gray-500">Customer Name:</span>
            <strong className="text-gray-900 dark:text-white">{orderComplete.customerName}</strong>
          </div>
          <div className="flex justify-between border-b border-pink-50 pb-2">
            <span className="text-gray-500">Total Charged:</span>
            <strong className="text-[#E04B73] dark:text-pink-400">₹{orderComplete.total} INR</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Dispatch Hub:</span>
            <strong className="text-gray-900 dark:text-white">Marathahalli, Bengaluru</strong>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
          🎉 A digital payment confirmation request has been received. Hema will confirm baking status instantly on WhatsApp and share the package tracking code!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => {
              setOrderComplete(null);
              setCurrentTab("track");
            }}
            className="flex-1 py-3.5 bg-neutral-900 hover:bg-black dark:bg-neutral-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Track Order Status
          </button>
          
          <a
            href={`https://wa.me/${(upiSettings.whatsappNumber || "9640653603").replace(/\D/g, "")}?text=Hi!%20I%20just%20placed%20an%20order%20online%20for%20₹${orderComplete.total}.%20Please%20verify%20and%20bake!`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3.5 bg-brand-mint hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            WhatsApp Hema
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 transition-colors duration-300 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
      
      {/* Left Column: Basket summary */}
      <div className="lg:col-span-5 space-y-4 sm:space-y-6">
        
        <div className="glass-panel bg-[#FFF0F2]/85 dark:bg-[#2D161B]/40 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-pink-200/40 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 border-b border-pink-100/50 dark:border-neutral-800 pb-3 sm:pb-4 mb-3 sm:mb-4">
            <ShoppingBag className="w-5 h-5 text-[#E04B73]" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-950 dark:text-white">Checkout Basket</h3>
          </div>

          {cart.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex gap-3 sm:gap-4 items-center bg-white dark:bg-neutral-950 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-pink-100/35 hover:shadow-sm transition-shadow relative"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-pink-100/20 shadow-sm">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white truncate pr-6">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#E04B73] dark:text-pink-300">
                      ₹{item.product.price} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded bg-pink-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-[#FFF0F2] hover:text-[#E04B73] cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 dark:text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded bg-pink-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-[#FFF0F2] hover:text-[#E04B73] cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Right side controls matching image: Trash on top, price on bottom */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-gray-400 hover:text-[#E04B73] dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove from basket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white font-mono">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 text-center space-y-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">Your basket is totally empty!</p>
              <button
                onClick={() => setCurrentTab("products")}
                className="px-4 py-2 bg-[#E04B73] hover:bg-[#C23055] text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-transform"
              >
                Browse products
              </button>
            </div>
          )}

          {/* Pricing summary */}
          <div className="border-t border-pink-100/50 dark:border-neutral-800 pt-3 sm:pt-4 mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">
              <span>Delivery Fee (Pan-India)</span>
              <span className="text-emerald-600 tracking-wider">FREE SHIPPING</span>
            </div>
            <hr className="border-pink-100/30 dark:border-neutral-800" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="font-serif text-base sm:text-lg font-bold text-gray-800 dark:text-white">Grand Total:</span>
              <span className="font-serif text-xl sm:text-2xl font-black text-[#E04B73] dark:text-pink-400">₹{total}</span>
            </div>
          </div>

        </div>

        {/* Marathahalli Delivery Details block */}
        <div className="glass-panel bg-[#FFF0F2]/85 dark:bg-[#2D161B]/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-pink-200/40 text-left text-[11px] sm:text-xs font-medium space-y-2 sm:space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#E04B73] dark:text-pink-400 font-bold border-b border-pink-100/50 dark:border-neutral-800 pb-2">
            <MapPin className="w-4 h-4 text-[#E04B73] fill-[#E04B73]/20" />
            <span>Bengaluru Delivery Information:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 sm:space-y-1.5 text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
            <li>Fast doorstep packaging & dispatch from Marathahalli daily.</li>
            <li>Doorstep deliveries take 1–2 days within Bengaluru.</li>
            <li>Tracking link provided immediately via WhatsApp confirmation.</li>
          </ul>
        </div>

      </div>

      {/* Right Column: Checkout Verification & Form */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmit} className="glass-panel bg-[#FFF0F2]/85 dark:bg-[#2D161B]/40 backdrop-blur-md p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-pink-200/40 space-y-6 sm:space-y-8 text-left shadow-sm relative">
          
          <div className="border-b border-pink-100/50 dark:border-neutral-800 pb-3 sm:pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-850 dark:text-white">Shipping & Payment</h3>
          </div>

          {/* Form errors */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold leading-relaxed animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 1. Address Section */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-black text-[#E04B73] dark:text-pink-300 uppercase tracking-widest border-b border-pink-100/50 dark:border-neutral-800 pb-1">
              1. Delivery Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sowmya Reddy"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white/70 dark:bg-neutral-950/70 dark:text-white rounded-xl sm:rounded-2xl border border-pink-200/20 focus:outline-none focus:ring-1 focus:ring-[#E04B73] focus:border-[#E04B73] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">WhatsApp / Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white/70 dark:bg-neutral-950/70 dark:text-white rounded-xl sm:rounded-2xl border border-pink-200/20 focus:outline-none focus:ring-1 focus:ring-[#E04B73] focus:border-[#E04B73] font-medium font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Shipping Destination Address *</label>
              <textarea
                placeholder="House Number, Street name, Near Landmark, Sector/Area, Bengaluru, PIN code"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white/70 dark:bg-neutral-950/70 dark:text-white rounded-xl sm:rounded-2xl border border-pink-200/20 focus:outline-none focus:ring-1 focus:ring-[#E04B73] focus:border-[#E04B73] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Gift Message / Custom Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Write 'With love Sowmya' on box package"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white/70 dark:bg-neutral-950/70 dark:text-white rounded-xl sm:rounded-2xl border border-pink-200/20 focus:outline-none focus:ring-1 focus:ring-[#E04B73] focus:border-[#E04B73] font-medium"
              />
            </div>
          </div>

          {/* 2. Payment Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center border-b border-pink-100/50 dark:border-neutral-800 pb-1">
              <h4 className="text-xs font-black text-[#E04B73] dark:text-pink-300 uppercase tracking-widest">
                2. Scan Instant UPI QR Code
              </h4>
              <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-[8px] sm:text-[9px] font-mono font-bold text-emerald-600 rounded">
                VERIFIED SECURE MERCHANT
              </span>
            </div>

            {total > 0 ? (
              <div className="bg-white/55 dark:bg-neutral-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-pink-200/30 dark:border-neutral-800 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                
                {/* Visual QR Code Generator */}
                <div className="flex flex-col items-center bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-pink-100 shadow-sm shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Scan UPI QR Code to pay"
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain cursor-pointer hover:scale-102 transition-transform"
                    onClick={() => window.open(upiDeepLink, "_blank")}
                  />
                  <div className="mt-2 px-3 py-1 bg-[#FFF0F2] text-[10px] sm:text-xs font-black text-[#E04B73] rounded-full">
                    Amount: ₹{total}.00
                  </div>
                </div>

                {/* Right side: Payment Steps & Merchant details */}
                <div className="flex-1 space-y-2 sm:space-y-3 text-left w-full">
                  <h5 className="text-[10px] sm:text-xs font-black text-[#E04B73] uppercase tracking-wider">Payment Steps:</h5>
                  <ol className="space-y-1.5 sm:space-y-2 text-xs text-gray-700 dark:text-gray-300 font-medium list-none pl-0">
                    <li className="flex gap-2">
                      <span className="text-[#E04B73] font-bold">1.</span>
                      <span>Open <strong className="font-extrabold text-gray-900 dark:text-white">GPay, PhonePe, Paytm</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#E04B73] font-bold">2.</span>
                      <span>Scan QR to auto-fill: <strong className="font-extrabold text-[#E04B73]">₹{total}</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#E04B73] font-bold">3.</span>
                      <span>Pay & paste the <strong className="font-extrabold text-gray-900 dark:text-white">12-digit UPI reference ID</strong> below!</span>
                    </li>
                  </ol>

                  {/* Copy Merchant ID block */}
                  <div className="bg-[#FFF5F6] dark:bg-neutral-950/60 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-pink-100/30 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">UPI Merchant ID:</p>
                      <p className="text-[10px] sm:text-xs font-bold font-mono text-gray-800 dark:text-gray-200 break-all">{upiSettings.upiId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1.5 sm:p-2 bg-white dark:bg-neutral-900 text-[#E04B73] rounded-lg sm:rounded-xl border border-pink-100 hover:bg-[#FFF0F2] transition-colors cursor-pointer shrink-0"
                      title="Copy Merchant UPI ID"
                    >
                      {copied ? (
                        <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 px-1">Copied!</span>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                    ⚡ Clicking QR on smart devices will trigger mobile UPI apps!
                  </p>
                </div>

              </div>
            ) : (
              <div className="p-4 bg-pink-50/20 rounded-xl text-center text-xs text-gray-500">
                Please add keychains to view dynamic QR sum.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">UPI Transaction ID / Ref ID (12 Digits) *</label>
              <input
                type="text"
                placeholder="e.g. 239481904812"
                required={paymentMethod === "UPI"}
                maxLength={12}
                value={upiRefId}
                onChange={(e) => setUpiRefId(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl sm:rounded-2xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#E04B73] font-bold font-mono tracking-wider"
              />
              <span className="text-[9px] sm:text-[10px] text-gray-400 block font-semibold leading-normal">
                Please double-check this number correctly. Hema compares this reference against her bank statement list.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={cart.length === 0}
            className={`w-full py-3.5 sm:py-4 text-xs sm:text-sm font-black text-white rounded-xl sm:rounded-2xl cursor-pointer transition-all uppercase shadow-md flex items-center justify-center gap-2 ${
              cart.length === 0
                ? "bg-gray-300 dark:bg-neutral-800 cursor-not-allowed shadow-none"
                : "bg-[#E04B73] hover:bg-[#C23055] shadow-rose-200"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            Verify Payment & Place Order
          </button>

          {/* Floating Checkout pill at bottom right, submits the form when clicked */}
          {cart.length > 0 && (
            <button
              type="submit"
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#E04B73] hover:bg-[#C23055] text-white px-4 py-3 sm:px-6 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 shadow-lg shadow-pink-300/40 z-50 hover:scale-105 active:scale-95 transition-all duration-300 font-bold cursor-pointer border border-[#FFF0F2]/10"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 fill-current text-white" />
                <span className="absolute -top-2 -right-2 bg-white text-[#E04B73] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#E04B73] shadow-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <span className="text-xs sm:text-sm tracking-wide">₹{total} Checkout</span>
            </button>
          )}

        </form>
      </div>

    </div>
  );
}

