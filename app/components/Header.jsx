'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  X, 
  Heart, 
  Check, 
  Radio, 
  Sparkles,
  Database
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
    { id: '1', title: 'Rumah', address: 'Jl. Sudirman No. 45, Jakarta Pusat', note: 'Pintu pagar hitam, titip satpam jika tidak ada orang' },
    { id: '2', title: 'Kos Rantau Mahasiswa', address: 'Jl. Surya Sumantri No. 12, Bandung', note: 'Kamar 204 lantai 2' },
    { id: '3', title: 'Kantor Tech Hub', address: 'Gedung Wisma GKBI Lt. 18, Jakarta', note: 'Lobby resepsionis utama' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm transition-all duration-200">
        <div className="px-4 pt-3 pb-2.5">
          {/* Top Row: "Deliver to" & Address Selector + Actions */}
          <div className="flex items-center justify-between mb-2.5">
            <div 
              onClick={() => {
                playTapSound();
                setIsAddressModalOpen(true);
              }}
              className="flex items-center space-x-1.5 cursor-pointer group active-press"
              role="button"
              tabIndex={0}
            >
              <div className="w-8 h-8 rounded-full bg-grab-light flex items-center justify-center text-grab-green shrink-0">
                <MapPin className="w-4 h-4 fill-grab-green" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-medium text-subtext uppercase tracking-wider">
                    Deliver to
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-subtext group-hover:text-charcoal transition-transform group-hover:translate-y-0.5" />
                </div>
                <span className="text-[14px] font-bold text-charcoal truncate max-w-[210px] sm:max-w-[260px] leading-tight">
                  {currentAddress}
                </span>
              </div>
            </div>

            {/* Right Icons: Supabase Sync Badge & Google User Avatar */}
            <div className="flex items-center space-x-1.5">
              <div 
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-medium border ${
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
                className="relative w-8 h-8 rounded-full bg-grab-green text-white flex items-center justify-center font-bold text-xs shadow-xs active-press overflow-hidden border border-emerald-300"
                title={currentUser ? `Akun: ${currentUser.email} (Single-User)` : 'Masuk dengan Google'}
              >
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser?.name?.[0] || 'W'}</span>
                )}
                {/* Tiny Google indicator dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-xs">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Full-width Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari sayur, buah, atau daging..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#F3F4F6] text-charcoal text-[13px] placeholder:text-gray-400 rounded-xl border border-transparent focus:outline-none focus:border-grab-green focus:bg-white focus:ring-2 focus:ring-grab-green/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  playTapSound();
                  setSearchQuery('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-charcoal"
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
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-grab-green" />
                <h3 className="font-bold text-base text-charcoal">Pilih Alamat Pengantaran</h3>
              </div>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
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
                      setCurrentAddress(`${item.address}`);
                      setIsAddressModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 active-press ${
                      isSelected 
                        ? 'border-grab-green bg-grab-surface' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-grab-green flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-charcoal">{item.title}</span>
                        {isSelected && (
                          <span className="bg-grab-light text-grab-green text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-subtext mt-0.5 leading-snug">{item.address}</p>
                      <p className="text-[11px] text-gray-400 mt-1 italic">Catatan: {item.note}</p>
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
              className="mt-4 w-full py-3 bg-grab-green text-white font-semibold text-sm rounded-xl hover:bg-grab-dark active-press transition-colors"
            >
              Simpan & Pakai Alamat Ini
            </button>
          </div>
        </div>
      )}
    </>
  );
}
