'use client';

import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function FloatingCartBar({ 
  totalItems = 2, 
  totalPrice = 45000, 
  onOpenCheckout 
}) {
  const formatRupiah = (val) => {
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
      <button
        onClick={() => {
          playTapSound();
          if (onOpenCheckout) onOpenCheckout();
        }}
        className="w-full pointer-events-auto bg-grab-green hover:bg-grab-dark text-white rounded-2xl p-3.5 shadow-float active-press transition-all duration-200 flex items-center justify-between border border-emerald-400/30 group animate-slide-up"
      >
        {/* Left Section: Shopping Bag Icon, Item Count & Total Price */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 fill-white/20" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold text-white/90 leading-tight">
              {totalItems} items
            </span>
            <span className="text-[16px] font-extrabold text-white leading-tight tracking-tight">
              {formatRupiah(totalPrice)}
            </span>
          </div>
        </div>

        {/* Right Section: "Checkout" text and chevron */}
        <div className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl font-bold text-sm tracking-wide text-white transition-colors">
          <span>Checkout</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
}
