"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useDarkMode } from "@/app/context/DarkModeContext";

function HorizontalCarousel({ majors, direction = 1, speed = 0.5 }) {
  const containerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const scrollRef = useRef(0);
  const velocityRef = useRef(0);
  const { dark } = useDarkMode();

  const repeated = [...majors, ...majors];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    scrollRef.current = container.scrollWidth / 2;
    container.scrollLeft = scrollRef.current;
    let rafId;
    function step() {
      if (!isHoveredRef.current) {
        velocityRef.current += (speed * direction - velocityRef.current) * 0.05;
        scrollRef.current += velocityRef.current;
        const half = container.scrollWidth / 2;
        if (scrollRef.current >= half) scrollRef.current -= half;
        if (scrollRef.current < 0) scrollRef.current += half;
        container.scrollLeft = scrollRef.current;
      } else {
        velocityRef.current *= 0.9;
        if (Math.abs(velocityRef.current) > 0.01) {
          scrollRef.current += velocityRef.current;
          const half = container.scrollWidth / 2;
          if (scrollRef.current >= half) scrollRef.current -= half;
          if (scrollRef.current < 0) scrollRef.current += half;
          container.scrollLeft = scrollRef.current;
        }
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [direction, speed]);

  return (
    <div
      className="relative w-full"
      style={{ overflow: "hidden" }}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      <div className={`absolute top-0 left-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-r ${dark ? "from-gray-900" : "from-gray-50"} to-transparent`} />
      <div className={`absolute top-0 right-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-l ${dark ? "from-gray-900" : "from-gray-50"} to-transparent`} />

      <div
        ref={containerRef}
        className="flex gap-4 px-24"
        style={{ overflowX: "hidden", overflowY: "visible", height: "180px", alignItems: "center" }}
      >
        {repeated.map((major, idx) => (
          <div
            key={idx}
            className={`flex-shrink-0 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-default ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
            style={{ width: "148px", height: "148px" }}
          >
            <span className="text-4xl mb-2">{major.icon}</span>
            <span className={`text-sm font-medium px-2 leading-tight ${dark ? "text-gray-300" : "text-gray-700"}`}>
              {major.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Carousel() {
  const { language } = useLanguage();
  const t = translations[language];
  const half = Math.ceil(t.majors.length / 2);
  const row1 = t.majors.slice(0, half);
  const row2 = t.majors.slice(half);

  return (
    <div className="flex flex-col gap-6 mt-10 py-4">
      <HorizontalCarousel majors={row1} direction={1} speed={0.4} />
      <HorizontalCarousel majors={row2} direction={-1} speed={0.4} />
    </div>
  );
}