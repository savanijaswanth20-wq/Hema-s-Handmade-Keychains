import React, { useState } from "react";
import { motion } from "motion/react";
import { ShoppingBag, MessageSquare, Star, Sparkles, CheckCircle2, ShieldAlert, Award, MapPin, Instagram, ExternalLink, Heart } from "lucide-react";
import { Product, Review, AdminSettings } from "../types";

// Animated floating hearts background for a cute and playful aesthetic
const FloatingHearts = () => {
  const [hearts, setHearts] = React.useState<{ id: number; left: number; delay: number; scale: number; size: number }[]>([]);

  React.useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95, // 0 to 95% of container width
      delay: Math.random() * 6, // staggered up to 6 seconds
      scale: 0.6 + Math.random() * 0.8, // size scale 0.6x to 1.4x
      size: 16 + Math.floor(Math.random() * 14), // 16px to 30px size
    }));
    setHearts(list);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute bottom-[-40px] text-brand-rose dark:text-pink-400 opacity-20"
          style={{ left: `${heart.left}%` }}
          animate={{
            y: [-20, -600],
            x: [0, Math.sin(heart.id) * 40, -Math.sin(heart.id) * 20],
            opacity: [0, 0.4, 0.3, 0],
            scale: [heart.scale * 0.7, heart.scale, heart.scale * 0.8],
          }}
          transition={{
            duration: 7 + Math.random() * 5,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
        >
          <svg
            className="fill-current"
            viewBox="0 0 24 24"
            style={{ width: `${heart.size}px`, height: `${heart.size}px` }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

interface HomeSectionProps {
  setCurrentTab: (tab: string) => void;
  products: Product[];
  reviews: Review[];
  onAddWishlist: (p: Product) => void;
  wishlist: Product[];
  upiSettings: AdminSettings;
}

export default function HomeSection({
  setCurrentTab,
  products,
  reviews,
  onAddWishlist,
  wishlist,
  upiSettings,
}: HomeSectionProps) {
  const [showHero, setShowHero] = useState(false);

  // Featured keychains to show in slider
  const featured = products.slice(0, 4);

  const whyChooseUs = [
    {
      icon: <Sparkles className="w-5 h-5 text-[#E04B73]" />,
      bgClass: "bg-[#FFE3E8] text-[#E04B73]",
      title: "101% Hand-Sculpted",
      desc: "No molds used! Each duckling, penguin, and bunny is shaped by Hema's hands with premium polymer clay, painted, and heavily glazed.",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-[#E04B73]" />,
      bgClass: "bg-[#FFE3E8] text-[#E04B73]",
      title: "High gloss glazed finish",
      desc: "Coated in high-gloss waterproof ceramic resin varnish. High durability, water resistant, dust resistant, and scratch resistant.",
    },
    {
      icon: <MapPin className="w-5 h-5 text-[#E04B73]" />,
      bgClass: "bg-[#FFE3E8] text-[#E04B73]",
      title: "Marathahalli Local Pride",
      desc: "Direct pickup and speedy doorstep deliveries in Outer Ring Road, Munnekolala, and across Bengaluru with direct tracking.",
    },
  ];

  return (
    <div className="space-y-16 pb-12 transition-colors duration-300">
      
      {/* 
        "remove section give me main option if i m clike"
        If showHero is false (default), the hero section is removed, and we present 
        beautiful interactive "main option" cards. Clicking "View Welcome Banner & Story" (or the close option) 
        switches the view seamlessly.
      */}
      {!showHero ? (
        <div className="max-w-4xl mx-auto text-center px-4 py-8 space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3">
            <h2 className="font-serif italic text-4xl sm:text-5xl text-gray-800 dark:text-white font-normal">
              {upiSettings.businessName || "Hema's Handmade Keychains"}
            </h2>
            <p className="text-xs font-black tracking-widest text-[#E04B73] dark:text-pink-300 uppercase">
              ✨ 100% Handcrafted Polymer Clay Accessories • Bengaluru ✨
            </p>
          </div>

          {/* Grid of Main Navigation Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto pt-4">
            <button
              onClick={() => setCurrentTab("products")}
              className="bg-white/80 dark:bg-[#2D161B]/40 p-4 sm:p-6 rounded-3xl border border-pink-200/40 hover:bg-[#FFF0F2] dark:hover:bg-rose-950/20 transition-all text-center flex flex-col items-center gap-3 cursor-pointer group shadow-xs hover:scale-103"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFE3E8] dark:bg-rose-950/50 flex items-center justify-center text-[#E04B73] group-hover:scale-110 transition-transform shadow-xs">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-[#E04B73]/20" />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Browse Shop</span>
            </button>

            <button
              onClick={() => setCurrentTab("gallery")}
              className="bg-white/80 dark:bg-[#2D161B]/40 p-4 sm:p-6 rounded-3xl border border-pink-200/40 hover:bg-[#FFF0F2] dark:hover:bg-rose-950/20 transition-all text-center flex flex-col items-center gap-3 cursor-pointer group shadow-xs hover:scale-103"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFE3E8] dark:bg-rose-950/50 flex items-center justify-center text-[#E04B73] group-hover:scale-110 transition-transform shadow-xs">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#E04B73]" />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">View Gallery</span>
            </button>

            <button
              onClick={() => setCurrentTab("track")}
              className="bg-white/80 dark:bg-[#2D161B]/40 p-4 sm:p-6 rounded-3xl border border-pink-200/40 hover:bg-[#FFF0F2] dark:hover:bg-rose-950/20 transition-all text-center flex flex-col items-center gap-3 cursor-pointer group shadow-xs hover:scale-103"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFE3E8] dark:bg-rose-950/50 flex items-center justify-center text-[#E04B73] group-hover:scale-110 transition-transform shadow-xs">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E04B73] fill-current text-[#E04B73]/20" />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Track Order</span>
            </button>

            <button
              onClick={() => setCurrentTab("contact")}
              className="bg-white/80 dark:bg-[#2D161B]/40 p-4 sm:p-6 rounded-3xl border border-pink-200/40 hover:bg-[#FFF0F2] dark:hover:bg-rose-950/20 transition-all text-center flex flex-col items-center gap-3 cursor-pointer group shadow-xs hover:scale-103"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFE3E8] dark:bg-rose-950/50 flex items-center justify-center text-[#E04B73] group-hover:scale-110 transition-transform shadow-xs">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#E04B73] fill-current text-[#E04B73]/20" />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Contact Us</span>
            </button>
          </div>

          {/* Interactive banner view option */}
          <div className="pt-4 animate-pulse">
            <button
              onClick={() => setShowHero(true)}
              className="px-6 py-2.5 bg-[#FFF0F2] dark:bg-[#2D161B]/40 text-[#E04B73] hover:text-white hover:bg-[#E04B73] rounded-full border border-pink-200/50 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              ✨ View Welcome Banner & Shop Intro ✨
            </button>
          </div>
        </div>
      ) : (
        <section className="relative overflow-hidden py-12 sm:py-20 bg-white/45 dark:bg-neutral-900/50 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-14 border border-white/60 dark:border-neutral-800 shadow-md animate-in slide-in-from-top-4 duration-300">
          
          {/* Close Banner button */}
          <button
            onClick={() => setShowHero(false)}
            className="absolute top-6 right-6 z-20 px-4 py-2 bg-white/90 dark:bg-neutral-900/95 text-[#E04B73] rounded-full border border-pink-200/60 hover:bg-pink-50 text-[10px] font-black uppercase cursor-pointer shadow-sm transition-transform hover:scale-105"
          >
            ✕ Hide Banner
          </button>

          {/* Dynamic cute floating hearts background */}
          <FloatingHearts />

          {/* Decorative Corner Sparkles directly from Mockup */}
          <div className="absolute top-8 left-8 text-brand-rose opacity-40 animate-pulse z-10">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-8 right-8 text-brand-rose opacity-40 animate-pulse z-10" style={{ animationDelay: "1.5s" }}>
            <Sparkles className="w-8 h-8" />
          </div>
          
          <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center z-10">
            
            {/* Animated Hanging Keychain Illustration */}
            <div className="relative flex flex-col items-center mb-8">
              {/* Heart Metal Keychain Loop/Ring Hook */}
              <svg
                className="w-12 h-12 text-gray-300 dark:text-neutral-600 drop-shadow-sm animate-bounce-slow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              
              {/* Metallic Hanging Chain Links */}
              <div className="w-1.5 h-6 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-200 dark:from-neutral-600 dark:to-neutral-700 rounded-full shadow-sm -mt-1.5 z-10"></div>
              <div className="w-1.5 h-6 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-200 dark:from-neutral-600 dark:to-neutral-700 rounded-full shadow-sm -mt-2.5 z-10"></div>

              {/* Main Spotlight Spotlight Circle with Keychain Charm */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[10px] border-white dark:border-neutral-800 bg-brand-pink shadow-xl overflow-hidden flex items-center justify-center -mt-2"
              >
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
                  alt="Baby Penguin holding a heart clay keychain"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Cute Slanted Price Tag Bubble */}
              <div
                className="absolute top-1/2 -right-8 bg-[#E04B73] text-white text-xs sm:text-sm font-black tracking-wider px-3 py-1 rounded-full shadow-md select-none transform rotate-[-12deg] hover:scale-110 transition-transform cursor-pointer"
              >
                ₹150
              </div>
            </div>

            {/* Heading - Elegant Serif Italic */}
            <h2
              className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-gray-800 dark:text-white tracking-tight leading-none text-center font-normal"
            >
              {upiSettings.businessName || "Hema's Handmade Keychains"}
            </h2>

            {/* Subtitle / Sub-badge in deep pink uppercase */}
            <div
              className="text-[10px] sm:text-xs font-black tracking-widest text-[#E04B73] dark:text-pink-300 uppercase mt-4 flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#E04B73] fill-[#E04B73]" />
              Handmade Keychain With Love
              <Heart className="w-3.5 h-3.5 text-[#E04B73] fill-[#E04B73]" />
            </div>

            {/* Description Paragraph with highlighted location */}
            <p
              className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-300 max-w-xl mx-auto mt-6 leading-relaxed font-medium"
            >
              Bespoke, glossy, oven-baked miniature clay keychains lovingly handcrafted in{" "}
              <span className="text-[#E04B73] dark:text-pink-400 font-bold">Marathahalli, Bengaluru</span>
              ! Add a touch of absolute sweetness to your house keys, backpacks, or give the most cute gift to someone you love.
            </p>

            {/* Action Buttons Centered Layout */}
            <div
              className="flex gap-4 justify-center items-center pt-8 w-full sm:w-auto"
            >
              <button
                onClick={() => setCurrentTab("products")}
                className="px-7 py-3.5 bg-[#E04B73] hover:bg-[#C23055] text-white rounded-full font-bold text-sm sm:text-base tracking-wide transition-all transform hover:scale-105 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Buy Now</span>
                <span className="text-lg">→</span>
              </button>
              
              <button
                onClick={() => setCurrentTab("gallery")}
                className="px-7 py-3.5 bg-white hover:bg-pink-50/50 text-gray-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-white rounded-full font-bold text-sm sm:text-base tracking-wide transition-all transform hover:scale-105 border border-pink-100 dark:border-neutral-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <svg
                  className="w-4 h-4 text-[#E04B73]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>View Gallery</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="max-w-5xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {whyChooseUs.map((w, idx) => (
            <div 
              key={idx}
              className="bg-[#FFF0F2]/80 dark:bg-[#2D161B]/40 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] border border-pink-200/40 text-center space-y-2 sm:space-y-3 md:space-y-4 hover:shadow-lg hover:bg-[#FFE3E8]/90 transition-all duration-300 flex flex-col items-center justify-center"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 ${w.bgClass}`}>
                {w.icon}
              </div>
              <h4 className="font-sans font-bold text-gray-800 dark:text-white text-sm sm:text-md md:text-lg">{w.title}</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Testimonial block from Mockup */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white/45 dark:bg-neutral-900/50 backdrop-blur-md border border-white/60 dark:border-neutral-800 p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#FFE3E8] dark:bg-rose-950/40 flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
            <Heart className="text-brand-rose fill-brand-rose" />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-gray-600 dark:text-gray-300 italic text-xs sm:text-sm md:text-base leading-relaxed font-medium">
              "I bought the Cute Heart Penguin keychain and Dolly the duckling. They are incredibly shiny and light, they feel like porcelain! I get comments on my keys every time I take them out in public!"
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-brand-rose tracking-wider uppercase">
              — DEEPA K., BENGALURU LOCAL BUYER
            </p>
          </div>
        </div>
      </section>

      {/* Featured Keychains Slider */}
      {featured.length > 0 && (
        <section className="space-y-8 px-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-rose dark:text-pink-300 uppercase tracking-wider block">
                Trending designs
              </span>
              <h3 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
                Featured Keychains
              </h3>
            </div>
            <button 
              onClick={() => setCurrentTab("products")}
              className="text-xs font-bold text-brand-rose hover:text-brand-rose-dark dark:text-pink-400 flex items-center gap-1 underline cursor-pointer"
            >
              View All Catalog →
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featured.map((p, index) => {
              const inWishlist = wishlist.some((w) => w.id === p.id);

              const bgs = [
                "bg-[#E1F5FE] dark:bg-sky-950/20", // Light blue
                "bg-[#FCE8E6] dark:bg-rose-950/20", // Light pink
                "bg-[#F3E5F5] dark:bg-purple-950/20", // Light purple
              ];
              const pastelBg = bgs[index % bgs.length];

              return (
                <div 
                  key={p.id}
                  className="bg-[#FFF0F2] dark:bg-neutral-900/60 rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-pink-100/50 dark:border-neutral-800/80 p-3 sm:p-5 relative group flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  
                  {/* Image container inside cute Pastel Box */}
                  <div 
                    onClick={() => setCurrentTab("products")}
                    className={`w-full aspect-square rounded-xl sm:rounded-[2rem] ${pastelBg} relative cursor-pointer flex items-center justify-center p-3 sm:p-5 overflow-hidden`}
                  >
                    {/* Visual Label Tag */}
                    <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 text-[8px] sm:text-[10px] font-bold text-[#E04B73] bg-white dark:bg-neutral-900 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-pink-100 dark:border-neutral-800 shadow-sm flex items-center gap-0.5">
                      <span className="text-[#E04B73] font-black">+</span> {p.tag || "Clay"}
                    </span>

                    {/* Wishlist Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddWishlist(p);
                      }}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-white dark:bg-neutral-900 shadow-sm hover:scale-110 transition-transform cursor-pointer text-gray-400 hover:text-[#E04B73] border border-pink-50 dark:border-neutral-800 flex items-center justify-center"
                    >
                      <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? "fill-brand-rose text-brand-rose" : ""}`} />
                    </button>

                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-[85%] h-[85%] sm:w-[75%] sm:h-[75%] aspect-square rounded-lg sm:rounded-[1.25rem] object-cover border-2 sm:border-[3px] border-white dark:border-neutral-800 shadow-xs sm:shadow-md transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-1.5 sm:space-y-2 mt-3 text-left">
                    <h4 
                      onClick={() => setCurrentTab("products")}
                      className="font-sans text-sm sm:text-base font-extrabold text-gray-800 dark:text-white cursor-pointer hover:text-[#E04B73] transition-colors truncate"
                    >
                      {p.name}
                    </h4>
                    
                    <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 sm:line-clamp-2">
                      {p.description}
                    </p>

                    <div className="flex justify-between items-center pt-2 sm:pt-2.5 border-t border-pink-50/50 dark:border-neutral-800/60">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-sans text-base sm:text-lg font-black text-[#E04B73] dark:text-pink-400">
                          ₹{p.price}
                        </span>
                        <span className="text-[9px] text-gray-400 dark:text-neutral-500 font-semibold uppercase">/pc</span>
                      </div>

                      <button
                        onClick={() => setCurrentTab("products")}
                        className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[11px] font-black text-white bg-[#E04B73] hover:bg-brand-rose-dark rounded-full cursor-pointer transition-all hover:scale-105"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}



      {/* Contact Section Header */}
      <div className="text-center space-y-2 max-w-4xl mx-auto pt-8">
        <h2 className="font-serif italic text-4xl sm:text-5xl text-gray-800 dark:text-white font-normal">
          Get in Touch with Hema
        </h2>
        <p className="text-[10px] sm:text-xs font-black tracking-widest text-[#E04B73] dark:text-pink-300 uppercase mt-2">
          ORDER CUSTOM CHARACTERS, INQUIRE ABOUT BULK RATES, OR SCHEDULE A PHYSICAL PICKUP!
        </p>
      </div>

      {/* Contact Section & Google Maps */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Contact Info Card */}
        <div className="bg-white/45 dark:bg-neutral-900/50 backdrop-blur-md border border-white/60 dark:border-neutral-800 p-8 sm:p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-6 text-left">
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-gray-800 dark:text-white text-xl sm:text-2xl">
              Hema's Tiny Universe
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 leading-relaxed font-medium mt-3">
              I handcraft cute accessories in my home unit located in{" "}
              <strong className="text-brand-rose dark:text-pink-400">Marathahalli, Bengaluru</strong>. 
              Have a customized idea? Just drop a message! I can sculpt custom cartoons, replicate your pet, or make personalized anniversary gifts.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageSquare className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">WHATSAPP CHATTING:</span>
                <a 
                  href={`https://wa.me/${(upiSettings.whatsappNumber || "9640653603").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-gray-800 dark:text-white underline hover:text-[#E04B73]"
                >
                  {upiSettings.whatsappNumber || "+91 9640653603"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-rose-950/30 flex items-center justify-center text-[#E04B73] shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">INSTAGRAM HANDLE:</span>
                <a 
                  href="https://instagram.com/hemas_tiny_universe"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-gray-800 dark:text-white underline hover:text-[#E04B73]"
                >
                  @{upiSettings.instagramId || "hemas_tiny_universe"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/30 flex items-center justify-center text-sky-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">PHYSICAL WORKSHOP:</span>
                <strong className="text-xs sm:text-sm text-gray-800 dark:text-white font-bold leading-normal">
                  Outer Ring Rd, Marathahalli, Bengaluru, Karnataka 560037
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={`https://wa.me/${(upiSettings.whatsappNumber || "9640653603").replace(/\D/g, "")}?text=Hi!%20I%20visited%20your%20website%20and%20would%20love%20to%20order%20some%2520custom%2520handmade%252520keychains!`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-[#00C26E] hover:bg-[#00A85F] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Chat on WhatsApp
            </a>
            
            <a
              href="https://instagram.com/hemas_tiny_universe"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-[#8134AF] via-[#DD2A7B] to-[#F58529] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-105"
            >
              <Instagram className="w-4 h-4" />
              Follow Instagram
            </a>
          </div>
        </div>

        {/* Static Map Mockup Card */}
        <div className="bg-white/45 dark:bg-neutral-900/50 backdrop-blur-md border border-white/60 dark:border-neutral-800 p-8 sm:p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between text-left">
          <div className="space-y-1 mb-4">
            <h3 className="font-sans font-bold text-gray-800 dark:text-white text-xl sm:text-2xl">Our Location</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Convenient pickup point near Marathahalli Outer Ring Road</p>
          </div>

          {/* Simulated beautiful responsive Google Maps block */}
          <div className="flex-1 min-h-[280px] bg-[#E1F5FE] dark:bg-neutral-950 rounded-[2rem] relative overflow-hidden border border-sky-100/50 dark:border-neutral-800 flex items-center justify-center">
            
            {/* Visual map roads grid */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Pastel Building blocks from Mockup */}
            <div className="absolute top-4 left-4 w-1/4 h-1/3 bg-[#E2F6F0] dark:bg-emerald-950/20 rounded-xl border border-emerald-200/20"></div>
            <div className="absolute top-4 right-4 w-1/2 h-1/3 bg-[#FCE8E6] dark:bg-rose-950/20 rounded-xl border border-rose-200/20"></div>
            <div className="absolute bottom-4 left-4 w-1/4 h-1/4 bg-[#FFF5CC] dark:bg-amber-950/20 rounded-xl border border-amber-200/20"></div>

            {/* Map Roads lines mock */}
            <div className="absolute inset-x-0 bottom-[33%] h-12 bg-white/80 dark:bg-neutral-900/90 border-y border-pink-100/40 dark:border-neutral-800 flex items-center justify-end pr-8 select-none">
              <span className="text-[9px] font-black tracking-widest text-[#90A4AE] dark:text-neutral-500 uppercase font-mono">Outer Ring Road</span>
            </div>
            <div className="absolute left-[33%] inset-y-0 w-12 bg-white/80 dark:bg-neutral-900/90 border-x border-pink-100/40 dark:border-neutral-800 flex items-center justify-center select-none">
              <span className="text-[9px] font-black tracking-widest text-[#90A4AE] dark:text-neutral-500 uppercase font-mono [writing-mode:vertical-lr] pl-1.5 whitespace-nowrap">Old Airport Rd</span>
            </div>

            {/* Elegant Map Card Overlay matching mockup */}
            <div className="absolute bottom-4 inset-x-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-white dark:border-neutral-800 flex items-center justify-between shadow-md">
              <div className="text-left">
                <span className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-white block">Hema's Handmade Keychains</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5 font-medium">Outer Ring Road, Marathahalli, Bangalore</span>
              </div>
              <a
                href="https://maps.google.com/?q=Marathahalli,Bengaluru"
                target="_blank"
                rel="noreferrer"
                className="bg-[#E04B73] hover:bg-brand-rose-dark text-white text-[10px] sm:text-xs font-black uppercase px-4 py-2.5 rounded-full tracking-wider cursor-pointer transition-all hover:scale-105 shadow-sm inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Open Maps</span>
              </a>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
