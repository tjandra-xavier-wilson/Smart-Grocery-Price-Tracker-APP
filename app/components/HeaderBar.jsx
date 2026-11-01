'use client';

import React, { useRef } from 'react';
import { User, Store, Calendar, Wallet, Pencil } from 'lucide-react';
import { playTapSound } from '../utils/sound';
import { toISODateString } from '../utils/date';

export default function HeaderBar({ 
  currentStore = 'Lotte Mart - Puri Indah',
  onOpenStoreModal,
  activeTabTitle = 'Keranjang Aktif',
  currentUser,
  onOpenAuthModal,
  syncStatus = 'Realtime Multi-Device Live',
  transactionDate = '10 Desember 2026',
  onDateChange,
  budgetLimit = 350000,
  onOpenBudgetModal
}) {
  const dateInputRef = useRef(null);

  const handleOpenDatePicker = () => {
    playTapSound();
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2 shrink-0 sticky top-0 z-30 space-y-1.5 shadow-2xs">
      {/* Top Row: User Avatar on Left, Store Name & Ganti, and Tab Title on Right */}
      <div className="flex items-center justify-between">
        {/* Left: Avatar & Supermarket Info */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Avatar button */}
          <button
            onClick={() => {
              playTapSound();
              if (onOpenAuthModal) onOpenAuthModal();
            }}
            className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-emerald-600 transition-all cursor-pointer overflow-hidden relative shrink-0"
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

          {/* Store Name & Ganti Button */}
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center space-x-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenStoreModal) onOpenStoreModal();
                }}
                className="text-xs font-black text-slate-900 hover:text-emerald-800 transition-colors text-left truncate max-w-[130px] sm:max-w-[170px]"
                title="Ganti Supermarket"
              >
                {currentStore}
              </button>
              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenStoreModal) onOpenStoreModal();
                }}
                className="px-1.5 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-extrabold rounded-md border border-sky-200 transition-colors cursor-pointer shrink-0"
              >
                Ganti ⇄
              </button>
            </div>
            <div className="flex items-center space-x-1 text-[9.5px] text-emerald-700 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="truncate">{syncStatus}</span>
            </div>
          </div>
        </div>

        {/* Right: Active Tab Title */}
        <div className="text-right shrink-0 pl-2">
          <h2 className="text-xs font-black text-slate-800 tracking-tight">
            {activeTabTitle}
          </h2>
        </div>
      </div>

      {/* Second Row: Tanggal Transaksi & Limit Budget UI Elements */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        {/* Tanggal Transaksi dengan Interactive Date Picker */}
        <div 
          onClick={handleOpenDatePicker}
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50/70 text-slate-800 border border-slate-200 hover:border-emerald-200 rounded-xl text-[11px] font-bold cursor-pointer transition-all shadow-2xs group relative min-w-0"
          title="Klik untuk ubah tanggal transaksi"
        >
          <div className="flex items-center space-x-1.5 min-w-0 truncate">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate text-[10.5px]">📅 {transactionDate}</span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
            Ubah
          </span>

          {/* Hidden native Date Picker overlay */}
          <input
            ref={dateInputRef}
            type="date"
            value={toISODateString(transactionDate)}
            onChange={(e) => {
              if (e.target.value && onDateChange) {
                playTapSound();
                onDateChange(e.target.value);
              }
            }}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Limit Budget Display & Quick Setting Modal Trigger */}
        <button
          onClick={() => {
            playTapSound();
            if (onOpenBudgetModal) onOpenBudgetModal();
          }}
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-200 rounded-xl text-[11px] font-extrabold transition-all shadow-2xs cursor-pointer group min-w-0"
          title="Klik untuk mengatur batas saldo budget"
        >
          <div className="flex items-center space-x-1.5 min-w-0 truncate">
            <Wallet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate text-[10.5px]">Limit: Rp {Number(budgetLimit || 0).toLocaleString('id-ID')}</span>
          </div>
          <span className="flex items-center space-x-0.5 text-[10px] font-black text-emerald-800 bg-white border border-emerald-300 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
            <Pencil className="w-2.5 h-2.5" />
            <span>Atur</span>
          </span>
        </button>
      </div>
    </header>
  );
}

