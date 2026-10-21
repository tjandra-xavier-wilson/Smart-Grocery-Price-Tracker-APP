'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, ChevronRight, Check } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function PromoBanner({ banners, onApplyPromo }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Auto rotate banners every 6 seconds
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const activeBanner = banners[currentIndex] || banners[0];

  const handleCopyCode = (code) => {
    playTapSound();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    if (onApplyPromo) onApplyPromo(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="px-4 py-3 bg-white">
      <div 
        className="relative overflow-hidden rounded-2xl shadow-card transition-all duration-300 group"
      >
        {/* Background gradient with ambient image */}
        <div className={`w-full min-h-[148px] p-4 bg-gradient-to-r ${activeBanner.bgGradient} text-white flex flex-col justify-between relative`}>
          {/* Background Decorative Pattern / Image overlay */}
          <div 
            className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url(${activeBanner.image})` }}
          />

          {/* Top Row: Tag & Badge */}
          <div className="flex items-center justify-between relative z-10">
            <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{activeBanner.tag}</span>
            </span>
            <span className="bg-yellow-400 text-charcoal text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
              {activeBanner.badge}
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="relative z-10 my-2">
            <h3 className="font-extrabold text-[17px] sm:text-[18px] leading-snug drop-shadow-xs max-w-[240px]">
              {activeBanner.title}
            </h3>
            <p className="text-white/80 text-[11px] font-medium mt-0.5 max-w-[260px] line-clamp-1">
              {activeBanner.subtitle}
            </p>
          </div>

          {/* Bottom Row: Voucher Code & Action */}
          <div className="flex items-center justify-between relative z-10 pt-1">
            <div 
              onClick={() => handleCopyCode(activeBanner.code)}
              className="inline-flex items-center space-x-1.5 bg-white text-charcoal px-3 py-1 rounded-xl text-xs font-bold cursor-pointer hover:bg-yellow-50 active-press shadow-xs transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-grab-green" />
              <span>{activeBanner.code}</span>
              {copiedCode === activeBanner.code ? (
                <span className="text-[10px] text-grab-green font-extrabold flex items-center ml-1">
                  <Check className="w-3 h-3 mr-0.5" /> Tersalin!
                </span>
              ) : (
                <span className="text-[10px] text-subtext font-normal ml-0.5">(Klaim)</span>
              )}
            </div>

            <button
              onClick={() => handleCopyCode(activeBanner.code)}
              className="flex items-center space-x-0.5 text-white/90 hover:text-white text-xs font-semibold"
            >
              <span>Pakai</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 right-3 flex items-center space-x-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playTapSound();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-4 h-1.5 bg-white' 
                    : 'w-1.5 h-1.5 bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
