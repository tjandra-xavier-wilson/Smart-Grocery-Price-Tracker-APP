'use client';

import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Carrot, 
  Apple, 
  Fish, 
  ShoppingBag, 
  Utensils 
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
    Utensils: Utensils,
  };

  return (
    <section className="py-3 bg-white border-b border-slate-100">
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
              {/* Minimalist Rounded Container */}
              <div 
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-brand scale-105 ring-2 ring-indigo-600 ring-offset-2' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <IconComponent className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                  isSelected ? 'stroke-[2.5]' : 'stroke-2 text-slate-700'
                }`} />

                {/* Optional Badge (e.g. Promo Hemat) */}
                {cat.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Category Label */}
              <span className={`text-[11px] mt-1.5 text-center font-medium max-w-[68px] leading-tight transition-colors ${
                isSelected 
                  ? 'text-indigo-600 font-bold' 
                  : 'text-slate-500 group-hover:text-slate-900'
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
