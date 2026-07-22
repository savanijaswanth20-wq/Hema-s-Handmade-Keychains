import React, { useState, useEffect } from "react";
import { Camera, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { AdminSettings } from "../types";

export default function GallerySection({ upiSettings }: { upiSettings: AdminSettings }) {
  const items = upiSettings?.galleryImages || [];
  const [activeIdx, setActiveIdx] = useState(0);

  const nextSlide = () => {
    if (items.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    if (items.length === 0) return;
    setActiveIdx((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [items.length]);

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

      {/* Animated Image Slider or Empty State */}
      <section className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-pink-100/40 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-[280px] sm:h-[420px] group flex items-center justify-center">
        {items.length > 0 ? (
          <>
            {/* Slides */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={items[activeIdx]?.url}
                alt={items[activeIdx]?.title}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
                <span className="text-[10px] font-bold text-white bg-brand-rose px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-2">
                  {items[activeIdx]?.category}
                </span>
                <h4 className="font-serif text-lg sm:text-2xl font-black text-white">
                  {items[activeIdx]?.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 font-medium max-w-xl">
                  {items[activeIdx]?.desc}
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
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400 space-y-3">
            <ImageIcon className="w-10 h-10 opacity-50" />
            <p className="text-sm font-semibold">Gallery is currently empty.</p>
            <p className="text-xs opacity-75">Upload photos from the admin dashboard.</p>
          </div>
        )}
      </section>

    </div>
  );
}
