import React, { useEffect, useState } from "react";

interface FloatElement {
  id: number;
  type: "heart" | "flower" | "sparkle" | "bokeh";
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  delay: number; // seconds
  duration: number; // seconds
  color: string;
}

export default function ElegantBackground() {
  const [elements, setElements] = useState<FloatElement[]>([]);

  useEffect(() => {
    const types: ("heart" | "flower" | "sparkle" | "bokeh")[] = [
      "heart",
      "flower",
      "sparkle",
      "bokeh",
    ];
    
    const colors = [
      "rgba(224, 75, 115, 0.12)",   // soft brand-rose
      "rgba(255, 107, 139, 0.15)",  // warm rose pink
      "rgba(255, 255, 255, 0.45)",  // bright white highlights
      "rgba(253, 226, 228, 0.25)",  // soft peach pastel
      "rgba(255, 214, 231, 0.3)",   // candy pink
    ];

    // Generate limited lightweight particles to ensure fast load and 0 mobile lag
    const list: FloatElement[] = Array.from({ length: 28 }).map((_, idx) => {
      const type = types[idx % types.length];
      let size = 16;
      if (type === "bokeh") {
        size = Math.floor(Math.random() * 120 + 80); // larger bokeh bubbles
      } else if (type === "sparkle") {
        size = Math.floor(Math.random() * 14 + 10);
      } else {
        size = Math.floor(Math.random() * 18 + 12);
      }

      return {
        id: idx,
        type,
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        size,
        delay: Math.random() * 6,
        duration: Math.random() * 12 + 10, // 10s to 22s
        color: colors[idx % colors.length],
      };
    });

    setElements(list);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 
        Luxury base background: Soft Light Pink gradient (#FDE2E4 to #FFD6E7)
        with white ambient studio highlights 
      */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#FDE2E4] via-[#FFE3E8] to-[#FFD6E7] dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-all duration-700" 
        id="elegant-gradient-bg"
      />

      {/* Luminous subtle studio highlights */}
      <div className="absolute top-[10%] left-[5%] w-[60vw] h-[60vw] rounded-full bg-white/40 dark:bg-neutral-900/10 opacity-70 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-white/50 dark:bg-neutral-800/5 opacity-80 blur-[140px] pointer-events-none" />
      <div className="absolute top-[50%] left-[45%] w-[35vw] h-[35vw] rounded-full bg-white/30 dark:bg-neutral-950/20 opacity-60 blur-[100px] pointer-events-none" />

      {/* Render floating decorative layers */}
      {elements.map((el) => {
        const itemStyle: React.CSSProperties = {
          left: `${el.x}%`,
          top: `${el.y}%`,
          width: `${el.size}px`,
          height: `${el.size}px`,
          animationDelay: `${el.delay}s`,
          animationDuration: `${el.duration}s`,
        };

        if (el.type === "bokeh") {
          return (
            <div
              key={el.id}
              className="absolute rounded-full animate-pulse-slow blur-3xl pointer-events-none"
              style={{
                ...itemStyle,
                backgroundColor: el.color,
                opacity: 0.2,
              }}
            />
          );
        }

        if (el.type === "heart") {
          return (
            <svg
              key={el.id}
              viewBox="0 0 24 24"
              className="absolute animate-float text-[#E04B73]/20 dark:text-pink-500/15 fill-current pointer-events-none"
              style={itemStyle}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          );
        }

        if (el.type === "flower") {
          return (
            <svg
              key={el.id}
              viewBox="0 0 24 24"
              className="absolute animate-float text-[#FF6B8B]/20 dark:text-pink-400/10 fill-current pointer-events-none"
              style={{
                ...itemStyle,
                animationDirection: el.id % 2 === 0 ? "normal" : "reverse",
              }}
            >
              {/* Cute 5-petal flower charm pattern perfect for keychains */}
              <path d="M12,2A3,3,0,0,0,9,5a3,3,0,0,0,.08.68,3,3,0,0,0-3.4,3.4A3,3,0,0,0,5,9a3,3,0,0,0,0,6,3,3,0,0,0,.68-.08,3,3,0,0,0,3.4,3.4,3,3,0,0,0,5.84,0,3,3,0,0,0,3.4-3.4,3,3,0,0,0,.68.08,3,3,0,0,0,0-6,3,3,0,0,0-.68.08,3,3,0,0,0-3.4-3.4A3,3,0,0,0,15,5,3,3,0,0,0,12,2Zm0,7a3,3,0,1,1-3,3A3,3,0,0,1,12,9Z" />
            </svg>
          );
        }

        // Sparkle Star Shape
        return (
          <svg
            key={el.id}
            viewBox="0 0 24 24"
            className="absolute animate-pulse text-[#FF6B8B]/30 dark:text-yellow-200/10 fill-current pointer-events-none"
            style={itemStyle}
          >
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
          </svg>
        );
      })}
    </div>
  );
}
