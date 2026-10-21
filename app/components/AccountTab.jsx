'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Award, 
  Wallet, 
  MapPin, 
  ShieldCheck, 
  Sliders, 
  Bell, 
  ChevronRight, 
  Check, 
  HelpCircle,
  Lock,
  LogOut,
  Sparkles
} from 'lucide-react';
import { playTapSound } from '../utils/sound';
import { getBudgetSettings, updateBudgetSettings, DESIGNATED_OWNER_EMAIL } from '../../src/lib/supabaseClient';

export default function AccountTab({ currentUser, onOpenAuthModal, onLogout }) {
  const [budgetCap, setBudgetCap] = useState(500000);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  useEffect(() => {
    async function loadBudget() {
      try {
        const settings = await getBudgetSettings();
        if (settings && settings.monthly_budget_cap) {
          setBudgetCap(settings.monthly_budget_cap);
        }
      } catch (e) {
        console.error('Error loading budget:', e);
      }
    }
    loadBudget();
  }, []);

  const handleSaveBudget = async () => {
    playTapSound();
    await updateBudgetSettings(budgetCap);
    setIsSaved(true);
    setIsEditingBudget(false);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const formatRupiah = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  const displayName = currentUser?.name || 'Wilson Tjandra';
  const displayEmail = currentUser?.email || DESIGNATED_OWNER_EMAIL;

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      {/* Profile Header with Google Authentication Badge */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card flex items-center space-x-3.5 relative overflow-hidden">
        <div className="relative w-14 h-14 rounded-full bg-grab-green text-white flex items-center justify-center font-extrabold text-xl shadow-grab shrink-0 overflow-hidden">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayName[0]}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-charcoal">{displayName}</h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Gold</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 mt-0.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <p className="text-xs text-subtext truncate max-w-[200px]">{displayEmail}</p>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[10px] bg-emerald-50 text-grab-green font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>Google Verified</span>
            </span>
            <span className="text-[10px] bg-gray-100 text-subtext font-semibold px-2 py-0.5 rounded-md">
              4.850 Poin
            </span>
          </div>
        </div>
      </div>

      {/* SINGLE-USER ACCESS CONTROLLER CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-grab-green flex items-center justify-center">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-charcoal">Mode Akses Pengguna Tunggal</h4>
              <p className="text-[10px] text-subtext">Single-User Access Policy</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-grab-dark text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
            AKTIF
          </span>
        </div>

        <p className="text-xs text-subtext leading-relaxed">
          Aplikasi diatur ke <strong>Akses Tunggal (Single User)</strong>. Akses multi-pengguna dinonaktifkan untuk menjaga privasi anggaran saku belanja dan catatan struk supermarket.
        </p>

        <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between text-subtext">
            <span>Status Kebijakan:</span>
            <span className="font-bold text-grab-green">Terkunci (Single Owner)</span>
          </div>
          <div className="flex justify-between text-subtext">
            <span>Akun Resmi Pemilik:</span>
            <span className="font-mono text-charcoal font-semibold text-[11px] truncate max-w-[190px]">
              {DESIGNATED_OWNER_EMAIL}
            </span>
          </div>
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            onClick={() => {
              playTapSound();
              if (onOpenAuthModal) onOpenAuthModal();
            }}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-xs rounded-xl active-press transition-colors"
          >
            Kelola Akun Google
          </button>
          <button
            onClick={() => {
              playTapSound();
              if (onLogout) onLogout();
            }}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl active-press flex items-center space-x-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Wallet / OVO Balance Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[11px] text-white/80 font-medium">Saldo OVO GrabPay</span>
            <h4 className="text-lg font-extrabold leading-tight">Rp 280.000</h4>
          </div>
        </div>
        <button 
          onClick={playTapSound}
          className="bg-white text-grab-green px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:bg-gray-100 active-press"
        >
          Top Up
        </button>
      </div>

      {/* Budget Safety Cap Feature (Connected to Supabase) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-grab-green" />
            <h4 className="font-bold text-sm text-charcoal">Budget Safety Cap (Supabase)</h4>
          </div>
          {isSaved && (
            <span className="text-[11px] text-grab-green font-bold flex items-center">
              <Check className="w-3.5 h-3.5 mr-0.5" /> Tersimpan!
            </span>
          )}
        </div>

        <p className="text-xs text-subtext leading-relaxed">
          Batas aman pengeluaran belanja groceries bulanan akun tunggal agar terhindar dari rasa malu saat checkout.
        </p>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-subtext">Batas Anggaran Bulanan:</span>
            <span className="font-bold text-grab-green text-sm">{formatRupiah(budgetCap)}</span>
          </div>

          <input
            type="range"
            min="100000"
            max="2000000"
            step="50000"
            value={budgetCap}
            onChange={(e) => {
              setBudgetCap(Number(e.target.value));
              setIsEditingBudget(true);
            }}
            className="w-full accent-grab-green h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Rp 100rb</span>
            <span>Rp 1 Juta</span>
            <span>Rp 2 Juta</span>
          </div>
        </div>

        {isEditingBudget && (
          <button
            onClick={handleSaveBudget}
            className="w-full py-2.5 bg-grab-green text-white font-bold text-xs rounded-xl active-press shadow-xs hover:bg-grab-dark"
          >
            Simpan Perubahan ke Supabase
          </button>
        )}
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-100 text-xs">
        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-subtext" />
            <span className="font-medium text-charcoal">Daftar Alamat Pengantaran</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4 text-subtext" />
            <span className="font-medium text-charcoal">Notifikasi Promo &amp; Pesanan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-4 h-4 text-subtext" />
            <span className="font-medium text-charcoal">Pusat Bantuan GrabMart</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
