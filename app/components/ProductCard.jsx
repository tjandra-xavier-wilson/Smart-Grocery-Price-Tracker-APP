'use client';

import React, { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function ProductCard({ 
  product, 
  quantityInCart = 0, 
  onAddToCart, 
  onRemoveFromCart 
}) {
  const [isBouncing, setIsBouncing] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    playTapSound();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);
    onAddToCart(product);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    playTapSound();
    onRemoveFromCart(product);
  };

  const formatRupiah = (val) => {
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-card hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden active-press"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge Overlay */}
          {product.discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPercent}% OFF
            </div>
          )}

          {/* Sold count / Star rating badge */}
          {product.rating && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center space-x-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 line-clamp-2 leading-snug tracking-tight mb-1 min-h-[34px]">
          {product.name}
        </h4>

        {/* Unit description */}
        <p className="text-[11px] text-slate-500 mb-2 font-medium">
          {product.unit}
        </p>
      </div>

      {/* Pricing & Add to Cart Action Row */}
      <div className="flex items-end justify-between pt-1">
        <div className="flex flex-col">
          {/* Original Price (Crossed out for discount items) */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-slate-400 line-through leading-none mb-0.5">
              {formatRupiah(product.originalPrice)}
            </span>
          )}

          {/* Price (Indigo modern accent) */}
          <span className="text-[14px] sm:text-[15px] font-extrabold text-indigo-600 leading-tight">
            {formatRupiah(product.price)}
          </span>
        </div>

        {/* Indigo Stepper / Add to Cart Button */}
        {quantityInCart > 0 ? (
          <div className="flex items-center space-x-1 bg-indigo-50 border border-indigo-200 rounded-full p-0.5 shadow-xs">
            <button
              onClick={handleRemove}
              className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:bg-slate-100 active-press shadow-xs"
              aria-label="Kurangi kuantitas"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-indigo-900 px-1 min-w-[14px] text-center">
              {quantityInCart}
            </span>
            <button
              onClick={handleAdd}
              className={`w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active-press shadow-xs ${
                isBouncing ? 'animate-bounce-short' : ''
              }`}
              aria-label="Tambah kuantitas"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-brand active-press transition-transform duration-150 ${
              isBouncing ? 'animate-bounce-short' : ''
            }`}
            aria-label="Tambah ke Keranjang"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
}
