'use client';

import React, { useState } from 'react';
import { Plus, Minus, Star, Check } from 'lucide-react';
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
      className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-card hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden active-press"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2">
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
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-charcoal text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center space-x-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Name (bold, 14px as specified) */}
        <h4 className="text-[14px] font-bold text-charcoal line-clamp-2 leading-tight tracking-tight mb-1 min-h-[34px]">
          {product.name}
        </h4>

        {/* Unit description */}
        <p className="text-[11px] text-subtext mb-2">
          {product.unit}
        </p>
      </div>

      {/* Pricing & Add to Cart Action Row */}
      <div className="flex items-end justify-between pt-1">
        <div className="flex flex-col">
          {/* Original Price (Crossed out for discount items) */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-gray-400 line-through leading-none mb-0.5">
              {formatRupiah(product.originalPrice)}
            </span>
          )}

          {/* Price (Green text e.g. "Rp 15.000") */}
          <span className="text-[15px] font-bold text-grab-green leading-tight">
            {formatRupiah(product.price)}
          </span>
        </div>

        {/* Green Circular "+" Add to Cart Button (Bottom Right) */}
        {quantityInCart > 0 ? (
          <div className="flex items-center space-x-1 bg-grab-light border border-grab-green/30 rounded-full p-0.5 shadow-xs">
            <button
              onClick={handleRemove}
              className="w-6 h-6 rounded-full bg-white text-grab-green flex items-center justify-center hover:bg-gray-100 active-press shadow-xs"
              aria-label="Kurangi kuantitas"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-grab-dark px-1 min-w-[14px] text-center">
              {quantityInCart}
            </span>
            <button
              onClick={handleAdd}
              className={`w-6 h-6 rounded-full bg-grab-green text-white flex items-center justify-center hover:bg-grab-dark active-press shadow-xs ${
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
            className={`w-8 h-8 rounded-full bg-grab-green hover:bg-grab-dark text-white flex items-center justify-center shadow-grab active-press transition-transform duration-150 ${
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
