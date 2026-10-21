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
  HelpCircle 
} from 'lucide-react';
import { playTapSound } from '../utils/sound';
import { getBudgetSettings, updateBudgetSettings } from '../../src/lib/supabaseClient';

export default function AccountTab() {
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

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card flex items-center space-x-3.5">
        <div className="w-14 h-14 rounded-full bg-grab-green text-white flex items-center justify-center font-extrabold text-xl shadow-grab shrink-0">
          W
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-charcoal">Wilson Tjandra</h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Gold</span>
            </span>
          </div>
          <p className="text-xs text-subtext mt-0.5">+62 812-3456-7890 • Mahasiswa Kos</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[11px] bg-emerald-50 text-grab-green font-semibold px-2 py-0.5 rounded-md">
              4.850 Poin GrabRewards
            </span>
          </div>
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
          Batas aman pengeluaran belanja groceries bulanan agar terhindar dari rasa malu saat checkout.
        </p>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
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
            <span className="font-medium text-charcoal">Daftar Alamat Tersimpan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4 text-subtext" />
            <span className="font-medium text-charcoal">Notifikasi Promo & Pesanan</span>
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
