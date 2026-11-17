'use client';

import React, { useRef, useState } from 'react';
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
  const [avatarError, setAvatarError] = useState(false);

  // Ambil URL Foto Profil Asli dari Sesi Google / Supabase Auth
  const googleAvatarUrl = 
    currentUser?.user_metadata?.avatar_url || 
    currentUser?.user_metadata?.picture || 
    currentUser?.avatar_url || 
    currentUser?.picture || 
    currentUser?.photoURL || 
    null;

  // Nama Tampilan & Inisial Huruf untuk Fallback
  const displayName = 
    currentUser?.user_metadata?.full_name || 
    currentUser?.user_metadata?.name || 
    currentUser?.name || 
    currentUser?.email?.split('@')[0] || 
    'Pengguna';

  const initialLetter = (displayName || 'U').trim().charAt(0).toUpperCase() || 'U';

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
    <div className="px-4 py-2 space-y-1.5 bg-transparent relative z-10 border-t border-slate-100/60">
      {/* Top Row: User Avatar on Left, Store Name & Ganti, and Tab Title on Right */}
      <div className="flex items-center justify-between">
        {/* Left: Avatar & Supermarket Info */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Avatar button with Google Profile Photo or Initial Letter Fallback */}
          <button
            onClick={() => {
              playTapSound();
              if (onOpenAuthModal) onOpenAuthModal();
            }}
            className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer overflow-hidden relative shrink-0"
            title={`Kelola Akun (${displayName})`}
          >
            {googleAvatarUrl && !avatarError ? (
              <img
                src={googleAvatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-sm font-black uppercase select-none tracking-tight">
                {initialLetter}
              </span>
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
                className="text-xs font-black text-slate-900 hover:text-emerald-800 transition-colors text-left truncate max-w-[140px] sm:max-w-[180px]"
                title="Ganti Supermarket"
              >
                {currentStore}
              </button>
              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenStoreModal) onOpenStoreModal();
                }}
                className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md border border-emerald-200 transition-colors cursor-pointer shrink-0"
              >
                Ganti ⇄
              </button>
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
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/60 hover:bg-emerald-100/70 text-slate-900 border border-emerald-200 rounded-xl text-[11px] font-extrabold transition-all shadow-2xs cursor-pointer group min-w-0"
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
    </div>
  );
}
