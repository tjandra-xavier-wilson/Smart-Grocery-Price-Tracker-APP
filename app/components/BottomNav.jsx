'use client';

import React from 'react';
import { ShoppingCart, ClipboardList, History } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function BottomNav({ activeTab = 'cart', onChangeTab, cartCount = 0 }) {
  const tabs = [
    {
      id: 'cart',
      label: 'Keranjang Aktif',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null
    },
    {
      id: 'input',
      label: 'Katalog & Input',
      icon: ClipboardList,
      badge: null
    },
    {
      id: 'history',
      label: 'Riwayat Belanja',
      icon: History,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      <div className="grid grid-cols-3 h-16 items-center px-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                if (onChangeTab) onChangeTab(tab.id);
              }}
              className="flex flex-col items-center justify-center h-full relative focus:outline-none group active-press cursor-pointer"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-700 scale-105 stroke-[2.3]'
                      : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
                  }`}
                />

                {/* Badge indicator on Cart */}
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-3 bg-emerald-700 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border-2 border-white shadow-sm min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 font-semibold tracking-tight transition-colors ${
                  isActive
                    ? 'text-emerald-800 font-bold'
                    : 'text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 w-10 h-0.5 bg-emerald-700 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
