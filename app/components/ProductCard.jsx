'use client';

import React, { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { playTapSound } from '../utils/sound';
import { ProductEmojiBox, getProductEmoji } from '../utils/emoji';

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
        {/* Product Emoji Container: 100% Emoji, No <img> Tag */}
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-md flex items-center justify-center text-3xl shrink-0 select-none mb-2.5 relative">
          <span>{getProductEmoji(product.name, product.category)}</span>

          {/* Discount Badge Overlay */}
          {product.discountPercent > 0 && (
            <div className="absolute -top-1 -left-1 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full shadow-xs">
              {product.discountPercent}% OFF
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

          {/* Price (Lotte Red accent) */}
          <span className="text-[14px] sm:text-[15px] font-extrabold text-red-600 leading-tight">
            {formatRupiah(product.price)}
          </span>
        </div>

        {/* Lotte Red Stepper / Add to Cart Button */}
        {quantityInCart > 0 ? (
          <div className="flex items-center space-x-1 bg-red-50 border border-red-200 rounded-full p-0.5 shadow-xs">
            <button
              onClick={handleRemove}
              className="w-6 h-6 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-slate-100 active-press shadow-xs cursor-pointer"
              aria-label="Kurangi kuantitas"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-red-900 px-1 min-w-[14px] text-center">
              {quantityInCart}
            </span>
            <button
              onClick={handleAdd}
              className={`w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 active-press shadow-xs cursor-pointer ${
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
            className={`w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md active-press transition-transform duration-150 cursor-pointer ${
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
