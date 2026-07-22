import React, { useState, useEffect } from "react";
import { Sparkles, Heart, Camera, Award, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminSettings } from "../types";

export default function GallerySection({ upiSettings }: { upiSettings: AdminSettings }) {
  const defaultItems = [
    {
      id: "1",
      title: "Baby Penguin holding a heart",
      desc: "Freshly glossed baby clay penguin. Completely baked and scratch-proof.",
      category: "Glossy Clay",
      url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "2",
      title: "Pressed Flower Initial Charm",
      desc: "Delicate alphabet filled with real dried lavender flowers and gold foil flakes.",
      category: "Resin Art",
      url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "3",
      title: "Sleeping Cat on Pastel Cloud",
      desc: "A custom order requested by a customer in spice garden Marathahalli.",
      category: "Custom Order",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "4",
      title: "Chubby Clay Cupcake Set",
      desc: "Glazed and sprinkled mini cupcakes designed as dynamic friends souvenirs.",
      category: "Food Crafts",
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "5",
      title: "Starry Sky Resin Cube",
      desc: "A combination of translucent dark pigments and gold glitter powder.",
      category: "Resin Art",
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "6",
      title: "Clay Cheeseburger Figurine",
      desc: "Extremely realistic sesame seeds, melted cheddar, and lettuce slices.",
      category: "Food Crafts",
      url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const items = upiSettings?.galleryImages?.length ? upiSettings.galleryImages : defaultItems;

  const [activeIdx, setActiveIdx] = useState(0);

  const nextSlide = () => {
    setActiveIdx((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setActiveIdx((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-10 pb-12 transition-colors duration-300">
      
      {/* Banner Area */}
      <section className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 p-8 rounded-3xl border border-pink-100/50 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-rose-950/30 text-brand-rose flex items-center justify-center mx-auto shadow-inner animate-float">
          <Camera className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-serif text-3xl font-bold text-gray-950 dark:text-white">The Artisan Gallery</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
            A visual showcase of baking, glossing, and hand packaging in Marathahalli daily.
          </p>
        </div>
      </section>

      {/* Animated Image Slider */}
      <section className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-pink-100/40 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-[280px] sm:h-[420px] group">
        {/* Slides */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={items[activeIdx].url}
            alt={items[activeIdx].title}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
            <span className="text-[10px] font-bold text-white bg-brand-rose px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-2">
              {items[activeIdx].category}
            </span>
            <h4 className="font-serif text-lg sm:text-2xl font-black text-white">
              {items[activeIdx].title}
            </h4>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 font-medium max-w-xl">
              {items[activeIdx].desc}
            </p>
          </div>
        </div>

        {/* Carousel buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white dark:bg-neutral-900/80 dark:hover:bg-neutral-900 text-gray-800 dark:text-white shadow-md cursor-pointer transition-all hover:scale-105 z-10 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white dark:bg-neutral-900/80 dark:hover:bg-neutral-900 text-gray-800 dark:text-white shadow-md cursor-pointer transition-all hover:scale-105 z-10 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                i === activeIdx ? "bg-brand-rose w-6" : "bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Bento Grid layout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {items.map((it, index) => (
          <div 
            key={index}
            className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-md border border-pink-100/40 dark:border-neutral-800 flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div className="w-full aspect-square bg-pink-50 overflow-hidden relative">
              <img
                src={it.url}
                alt={it.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 text-brand-rose dark:text-pink-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-pink-100/40">
                {it.category}
              </div>
            </div>

            <div className="p-5 text-left space-y-2">
              <h4 className="font-serif text-lg font-bold text-gray-950 dark:text-white group-hover:text-brand-rose transition-colors">
                {it.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {it.desc}
              </p>
              
              <div className="flex items-center justify-between border-t border-pink-50 dark:border-neutral-800 pt-3 mt-4 text-[10px] font-bold text-gray-400">
                <span>By Hema's Tiny Universe</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Hand-sculpted
                </span>
              </div>
            </div>

          </div>
        ))}
      </section>

    </div>
  );
}
