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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex items-center space-x-3.5 relative overflow-hidden">
        <div className="relative w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-brand shrink-0 overflow-hidden border border-indigo-400">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayName.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <h3 className="font-bold text-base text-slate-900 truncate">{displayName}</h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shrink-0">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              <span>Owner</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{displayEmail}</p>

          <div className="flex items-center space-x-2 mt-1.5">
            <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Single-User Active</span>
            </span>
          </div>
        </div>

        {!currentUser ? (
          <button
            onClick={() => {
              playTapSound();
              if (onOpenAuthModal) onOpenAuthModal();
            }}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl active-press shadow-brand hover:bg-indigo-700"
          >
            Masuk
          </button>
        ) : (
          <button
            onClick={() => {
              playTapSound();
              if (onLogout) onLogout();
            }}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 active-press transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Monthly Budget Safety Cap Controller */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Batas Anggaran Bulanan</h4>
              <p className="text-[11px] text-slate-500 font-medium">Batas pengeluaran aman belanja dapur</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              setIsEditingBudget(!isEditingBudget);
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            {isEditingBudget ? 'Batal' : 'Ubah'}
          </button>
        </div>

        {isEditingBudget ? (
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Pilih Batas:</span>
                <span className="text-indigo-600 font-bold">{formatRupiah(budgetCap)}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={budgetCap}
                onChange={(e) => setBudgetCap(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Rp 100rb</span>
                <span>Rp 1jt</span>
                <span>Rp 2jt</span>
              </div>
            </div>

            <button
              onClick={handleSaveBudget}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl active-press shadow-brand flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan ke Database Supabase</span>
            </button>
          </div>
        ) : (
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold text-slate-900">{formatRupiah(budgetCap)}</span>
            <span className="text-xs text-slate-500">per bulan</span>
          </div>
        )}

        {isSaved && (
          <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-1.5 animate-fade-in font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>Batas anggaran berhasil diperbarui di Supabase PostgreSQL!</span>
          </div>
        )}
      </div>

      {/* Account Settings Menu */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer active-press">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Alamat Tersimpan</span>
              <p className="text-[11px] text-slate-500">Kelola lokasi pengantaran belanja</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer active-press">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Metode Pembayaran</span>
              <p className="text-[11px] text-slate-500">QRIS Kasir &amp; Transfer Bank</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer active-press">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Keamanan Akun &amp; Single-User</span>
              <p className="text-[11px] text-slate-500">Otentikasi aman tersinkronisasi</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer active-press">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Pusat Bantuan &amp; Panduan DT2</span>
              <p className="text-[11px] text-slate-500">FAQ &amp; Dokumentasi Uji Sistem</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
