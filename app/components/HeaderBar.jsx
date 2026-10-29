'use client';

import React from 'react';
import { User, Store } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function HeaderBar({ 
  currentStore = 'Lotte Mart - Puri Indah',
  onOpenStoreModal,
  activeTabTitle = 'Keranjang Aktif',
  currentUser,
  onOpenAuthModal,
  syncStatus = 'Online Sync Live'
}) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shrink-0 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: User Avatar & Supermarket Info */}
        <div className="flex items-center space-x-2.5">
          {/* Avatar button */}
          <button
            onClick={() => {
              playTapSound();
              if (onOpenAuthModal) onOpenAuthModal();
            }}
            className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-emerald-600 transition-all cursor-pointer overflow-hidden relative"
            title="Kelola Akun Pemilik"
          >
            {currentUser?.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Store Name & Sync Status */}
          <div className="flex flex-col text-left">
            <button
              onClick={() => {
                playTapSound();
                if (onOpenStoreModal) onOpenStoreModal();
              }}
              className="flex items-center space-x-1 text-xs font-bold text-slate-800 hover:text-emerald-800 transition-colors text-left"
            >
              <Store className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="truncate max-w-[150px]">{currentStore}</span>
            </button>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{syncStatus}</span>
            </div>
          </div>
        </div>

        {/* Right: Active Tab Title */}
        <div className="text-right">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            {activeTabTitle}
          </h2>
        </div>
      </div>
    </header>
  );
}
