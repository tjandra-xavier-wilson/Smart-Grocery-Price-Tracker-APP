'use client';

import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Carrot, 
  Apple, 
  Fish, 
  ShoppingBag, 
  CupSoda 
} from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function CategoryCarousel({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}) {
  const iconMap = {
    Sparkles: Sparkles,
    Flame: Flame,
    Carrot: Carrot,
    Apple: Apple,
    Fish: Fish,
    ShoppingBag: ShoppingBag,
    CupSoda: CupSoda,
  };

  return (
    <section className="py-3 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar px-4 scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = iconMap[cat.icon] || Sparkles;

          return (
            <button
              key={cat.id}
              onClick={() => {
                playTapSound();
                onSelectCategory(cat.id);
              }}
              className="flex flex-col items-center shrink-0 group focus:outline-none active-press"
            >
              {/* Circular / Pill Icon Container */}
              <div 
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-grab-green text-white shadow-grab scale-105 ring-2 ring-grab-green ring-offset-2' 
                    : 'bg-[#F3F4F6] text-charcoal hover:bg-gray-200'
                }`}
              >
                <IconComponent className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                  isSelected ? 'stroke-[2.5]' : 'stroke-2 text-charcoal'
                }`} />

                {/* Optional Badge (e.g. Promo 50%) */}
                {cat.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Category Label */}
              <span className={`text-[11px] mt-1.5 text-center font-medium max-w-[68px] leading-tight transition-colors ${
                isSelected 
                  ? 'text-grab-green font-bold' 
                  : 'text-subtext group-hover:text-charcoal'
              }`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
