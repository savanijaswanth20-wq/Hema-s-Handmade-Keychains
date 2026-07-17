import React, { useState } from "react";
import { Heart, ShoppingBag, Menu, X, Sun, Moon, LayoutDashboard, Star } from "lucide-react";
import { Product, AdminSettings } from "../types";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cart: { product: Product; quantity: number }[];
  wishlist: Product[];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  user: any;
  onLogout: () => void;
  upiSettings: AdminSettings;
}

export default function Header({
  currentTab,
  setCurrentTab,
  cart,
  wishlist,
  darkMode,
  setDarkMode,
  user,
  onLogout,
  upiSettings,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigationItems = [
    { id: "home", label: "Home" },
    { id: "products", label: "Products" },
    { id: "wishlist", label: "Wishlist", count: wishlist.length },
    { id: "track", label: "Track Order" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact Us" },
    { id: "cart", label: "Cart", count: totalCartItems },
    { id: "dashboard", label: "Dashboard", isDashed: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFE3E8]/95 backdrop-blur-md shadow-sm border-b border-pink-200/60 dark:bg-neutral-900/90 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setCurrentTab("home"); setMobileMenuOpen(false); }}
          >
            <div className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              {upiSettings.logoUrl ? (
                <img 
                  src={upiSettings.logoUrl} 
                  alt={upiSettings.businessName} 
                  className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-[#E04B73]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-11 h-11 select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#E04B73" />
                    <path 
                      d="M20 29.3 C19.7 29.3 12 21.5 12 16.5 C12 13.5 14.2 11.3 17.2 11.3 C19.2 11.3 20 12.5 20 12.5 C20 12.5 20.8 11.3 22.8 11.3 C25.8 11.3 28 13.5 28 16.5 C28 21.5 20.3 29.3 20 29.3 Z" 
                      fill="#FFFFFF" 
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-left flex flex-col justify-center">
              <h1 className="font-sans text-[15px] sm:text-[17px] font-black text-[#E04B73] dark:text-pink-400 tracking-tight leading-[1.1]">
                {upiSettings.businessName === "Hema's Handmade Keychains" || !upiSettings.businessName ? (
                  <>
                    Hema's Handmade <br /> Keychains
                  </>
                ) : (
                  upiSettings.businessName
                )}
              </h1>
              <span className="text-[8px] sm:text-[9px] font-black text-[#E04B73]/70 dark:text-gray-400 tracking-widest block mt-1 uppercase">
                HANDMADE WITH LOVE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {navigationItems.map((item) => {
              const isActive = currentTab === item.id;
              if (item.isDashed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`px-4.5 py-2.5 text-xs font-black rounded-full cursor-pointer transition-all border-2 border-dashed uppercase tracking-wider flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md"
                        : "border-indigo-400 text-indigo-700 hover:bg-white/40 dark:text-indigo-300 dark:border-indigo-500/50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative px-4 py-2 text-sm font-bold transition-all rounded-full cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "text-[#E04B73] bg-white dark:bg-rose-950/60 dark:text-pink-300 shadow-sm border border-pink-200/40"
                      : "text-gray-700 hover:text-[#E04B73] dark:text-gray-300 dark:hover:text-pink-300 hover:bg-white/40 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  {item.id === "wishlist" && (
                    <Heart className={`w-4 h-4 shrink-0 ${isActive ? "fill-brand-rose text-brand-rose" : "text-gray-500 dark:text-gray-400"}`} />
                  )}
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E04B73] text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-neutral-900">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-500 hover:text-[#E04B73] hover:bg-white/40 dark:text-gray-400 dark:hover:text-pink-300 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <button
                onClick={onLogout}
                className="text-xs text-gray-500 hover:text-brand-rose dark:text-gray-400 font-semibold px-2.5 py-1 underline cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu & Theme Toggles */}
          <div className="flex lg:hidden items-center gap-2">
          </div>

        </div>
      </div>

      {/* Mobile compact scrolling tab bar */}
      <div className="lg:hidden flex items-center overflow-x-auto pb-3 px-4 scrollbar-none border-t border-pink-200/20 dark:border-neutral-800/40 pt-2.5 bg-[#FFE3E8]/70 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2 w-max">
          {navigationItems.map((item) => {
            const isActive = currentTab === item.id;
            if (item.isDashed) {
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-full cursor-pointer transition-all border-2 border-dashed uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    isActive
                      ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs"
                      : "border-indigo-400 text-indigo-700 hover:bg-white/40 dark:text-indigo-300 dark:border-indigo-500/50"
                  }`}
                >
                  {item.label}
                </button>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isActive
                    ? "text-[#E04B73] bg-white dark:bg-neutral-950 dark:text-pink-300 shadow-xs border border-pink-200/30"
                    : "text-gray-750 hover:text-[#E04B73] bg-white/30 dark:text-gray-300 dark:hover:text-pink-300 dark:bg-neutral-800/30"
                }`}
              >
                {item.id === "wishlist" && (
                  <Heart className={`w-3.5 h-3.5 shrink-0 ${isActive ? "fill-brand-rose text-brand-rose" : "text-gray-500 dark:text-gray-400"}`} />
                )}
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`h-4.5 w-4.5 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs ${
                    isActive ? "bg-[#E04B73] text-white" : "bg-[#E04B73] text-white"
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
