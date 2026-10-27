'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  X, 
  Check, 
  Sparkles,
  Store
} from 'lucide-react';
import { playTapSound } from '../utils/sound';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  currentAddress, 
  setCurrentAddress,
  supabaseStatus,
  currentUser,
  onOpenAuthModal
}) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const addresses = [
    { 
      id: '1', 
      title: 'Lotte Mart Grocery - Puri Indah', 
      address: 'Jl. Puri Indah Raya Blok U1, Jakarta Barat', 
      note: 'Mitra Belanja Resmi SakuGrosir & DT2 Ujian' 
    },
    { 
      id: '2', 
      title: 'Rumah Tinggal', 
      address: 'Jl. Surya Barat No. 24, Jakarta Barat', 
      note: 'Pintu pagar putih, titip keamanan komplek' 
    },
    { 
      id: '3', 
      title: 'Kantor Tech Hub', 
      address: 'Gedung Wisma GKBI Lt. 18, Jakarta Pusat', 
      note: 'Lobby resepsionis utama gedung' 
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-xs transition-all duration-200">
        <div className="px-4 pt-3 pb-2.5">
          {/* Top Row: Store/Deliver to & Address Selector + Actions */}
          <div className="flex items-center justify-between mb-2.5">
            <div 
              onClick={() => {
                playTapSound();
                setIsAddressModalOpen(true);
              }}
              className="flex items-center space-x-2 cursor-pointer group active-press"
              role="button"
              tabIndex={0}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Lokasi Belanja
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-y-0.5" />
                </div>
                <span className="text-[13px] font-bold text-slate-900 truncate max-w-[210px] sm:max-w-[260px] leading-tight">
                  {currentAddress}
                </span>
              </div>
            </div>

            {/* Right Icons: Supabase Sync Badge & Google User Avatar */}
            <div className="flex items-center space-x-1.5">
              <div 
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                  supabaseStatus === 'connected' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={supabaseStatus === 'connected' ? 'Supabase Database Aktif' : 'Mode Offline'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                <span className="font-semibold">{supabaseStatus === 'connected' ? 'Cloud' : 'Offline'}</span>
              </div>

              {/* Google User Avatar / Auth Button */}
              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="relative w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs active-press overflow-hidden border border-indigo-400"
                title={currentUser ? `Akun: ${currentUser.email} (Single-User)` : 'Masuk Akun'}
              >
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser?.name?.[0] || 'W'}</span>
                )}
                {/* Tiny Google indicator dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-xs">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Minimalist Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari beras, minyak, sayuran, bumbu dapur..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 text-slate-900 text-[13px] placeholder:text-slate-400 rounded-xl border border-transparent focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  playTapSound();
                  setSearchQuery('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Pilih Lokasi & Mitra Belanja</h3>
              </div>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {addresses.map((item) => {
                const isSelected = currentAddress.includes(item.title) || currentAddress === item.address;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playTapSound();
                      setCurrentAddress(`${item.title}`);
                      setIsAddressModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 active-press ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/60 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{item.title}</span>
                        {isSelected && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Pilihan Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{item.address}</p>
                      <p className="text-[11px] text-slate-400 mt-1 italic">Catatan: {item.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                playTapSound();
                setIsAddressModalOpen(false);
              }}
              className="mt-4 w-full py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 active-press transition-colors shadow-brand"
            >
              Simpan & Pilih Mitra Ini
            </button>
          </div>
        </div>
      )}
    </>
  );
}
