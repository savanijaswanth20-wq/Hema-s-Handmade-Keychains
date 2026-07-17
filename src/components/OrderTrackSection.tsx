import React, { useState } from "react";
import { Search, MapPin, Gift, CreditCard, MessageSquare, AlertCircle, ShoppingBag, Truck, Check, PackageOpen, Hourglass } from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderTrackSectionProps {
  orders: Order[];
}

export default function OrderTrackSection({ orders }: OrderTrackSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundOrders, setFoundOrders] = useState<Order[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setFoundOrders([]);
      return;
    }

    const cleanQuery = searchQuery.trim().toLowerCase();
    
    // Support matching by Order ID (HEMA-XXXX) or by 10-digit Phone Number
    const results = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(cleanQuery) ||
        o.customerPhone.includes(cleanQuery)
    );

    setFoundOrders(results);
  };

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: "Pending", label: "Confirmed", desc: "Ref ID matched & verified" },
    { status: "Baking", label: "Baking Oven", desc: "Clay molding & firing" },
    { status: "Glossing", label: "Triple Glossing", desc: "Resin sealing & glaze coat" },
    { status: "Shipped", label: "Dispatched", desc: "Picked up by local courier" },
    { status: "Delivered", label: "Delivered", desc: "Enjoy your lovely crafts!" },
  ];

  const getStatusIndex = (status: OrderStatus): number => {
    const order: OrderStatus[] = ["Pending", "Baking", "Glossing", "Shipped", "Delivered"];
    return order.indexOf(status);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 transition-colors duration-300">
      
      {/* Search Header panel */}
      <section className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 p-8 rounded-3xl border border-pink-100/50 shadow-sm text-center space-y-4">
        
        <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-rose-950/30 text-brand-rose flex items-center justify-center mx-auto shadow-inner">
          <Truck className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white">Track Your Order</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
            Check the real-time baking, glossing, and delivery status of your handmade box.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2.5 pt-2">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. HEMA-9081) or 10-Digit Phone Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-sm font-semibold bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-rose focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md shadow-rose-200 dark:shadow-none cursor-pointer uppercase"
          >
            Find My Order
          </button>
        </form>

        <p className="text-[10px] sm:text-xs text-gray-400 font-semibold italic">
          💡 Forgot your Order ID? Type your 10-digit phone number to track your recent order instantly.
        </p>

      </section>

      {/* Lookup results */}
      {hasSearched && (
        <div className="space-y-8">
          {foundOrders && foundOrders.length > 0 ? (
            foundOrders.map((order) => {
              const currentStepIdx = getStatusIndex(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-lg space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  
                  {/* Order Top Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pink-50 dark:border-neutral-800 pb-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-brand-rose bg-brand-rose-light px-2 py-0.5 rounded border border-pink-200 tracking-wider">
                        ORDER ID: {order.id}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-gray-950 dark:text-white mt-1">
                        Sourced for {order.customerName}
                      </h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Payment Status</span>
                      <strong className={`text-xs uppercase ${order.paymentStatus === 'Verified' ? "text-emerald-600" : "text-amber-500"}`}>
                        ● {order.paymentStatus} via {order.paymentMethod}
                      </strong>
                    </div>
                  </div>

                  {/* Real-time Custom Steps Tracker */}
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Baking & Craft Progression Meter:
                    </h5>

                    {/* Progress Bar Line */}
                    <div className="relative pt-2">
                      {/* Desktop Progress Bar Line */}
                      <div className="absolute top-7 left-8 right-8 h-1 bg-gray-100 dark:bg-neutral-800 hidden md:block">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-300 via-brand-rose to-brand-rose-dark transition-all duration-1000"
                          style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2">
                        {steps.map((st, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          
                          return (
                            <div key={idx} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-left md:text-center relative">
                              
                              {/* Step circle icon indicator */}
                              <div 
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${
                                  isCompleted
                                    ? "bg-brand-rose border-brand-rose text-white shadow-rose-200"
                                    : "bg-white dark:bg-neutral-950 border-gray-200 text-gray-400"
                                } ${isCurrent ? "ring-4 ring-pink-100 dark:ring-rose-950 animate-pulse-slow" : ""}`}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4 stroke-[3px]" />
                                ) : (
                                  <Hourglass className="w-4 h-4" />
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <h6 className={`text-xs font-bold ${isCurrent ? "text-brand-rose dark:text-pink-300 font-extrabold" : "text-gray-900 dark:text-gray-300"}`}>
                                  {st.label}
                                </h6>
                                <p className="text-[10px] text-gray-400 font-semibold leading-tight">
                                  {st.desc}
                                </p>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Products Details inside tracker */}
                  <div className="border-t border-pink-50 dark:border-neutral-800 pt-6 space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Your Handmade Package contents:
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-pink-50/10 dark:bg-neutral-950/30 p-3 rounded-xl border border-pink-50/50 dark:border-neutral-900 items-center">
                          <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate block max-w-[200px]">{item.productName}</span>
                            <span className="text-[10px] font-medium text-gray-500">Qty: {item.quantity} × ₹{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Courier / Gift metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-pink-50 dark:border-neutral-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                        <MapPin className="w-4 h-4 text-brand-rose" />
                        <span>Delivery Address</span>
                      </div>
                      <p className="pl-6 leading-relaxed text-gray-500">{order.address}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                        <Gift className="w-4 h-4 text-brand-rose" />
                        <span>Inscription Message</span>
                      </div>
                      <p className="pl-6 leading-relaxed italic text-gray-500">
                        {order.customMessage || "No custom message or names submitted."}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="glass-panel dark:bg-neutral-900 p-12 text-center rounded-3xl border border-pink-100 text-gray-500 space-y-4">
              <AlertCircle className="w-8 h-8 text-brand-rose mx-auto" />
              <p className="text-sm font-semibold">Could not find any orders registered with that reference.</p>
              <p className="text-xs text-gray-400">Please check your Order ID (HEMA-XXXX) or the phone number and search again.</p>
            </div>
          )}
        </div>
      )}

      {/* Need customization banner */}
      <section className="glass-panel dark:bg-neutral-900 p-6 rounded-2xl border border-pink-100/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Need customization changes?</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inscribe names or customized clay requests directly on WhatsApp.</p>
        </div>
        <a
          href="https://wa.me/919640653603?text=Hi%20Hema!%20I'd%20love%20to%20add%20customization%20instructions%20to%20my%20recent%20order..."
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-brand-mint hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all uppercase"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          WhatsApp Hema
        </a>
      </section>

    </div>
  );
}
