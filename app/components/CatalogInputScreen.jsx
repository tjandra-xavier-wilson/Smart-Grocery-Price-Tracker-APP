'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Scan, 
  Plus, 
  Minus, 
  Check, 
  Percent, 
  ShieldCheck, 
  ShoppingCart, 
  X, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';

export default function CatalogInputScreen({
  currentStore = 'Lotte Mart Grocery',
  currentRemainingBudget = 125500,
  onAddToCart,
  onOpenBarcodeModal,
  initialValues = null
}) {
  const [itemName, setItemName] = useState(initialValues?.name || 'Beras Rojolele 5kg');
  const [category, setCategory] = useState(initialValues?.category || 'Bahan Pokok');
  const [unit, setUnit] = useState(initialValues?.unit || 'karung/5kg');
  const [quantity, setQuantity] = useState(initialValues?.quantity || 1);
  const [normalPrice, setNormalPrice] = useState(initialValues?.price ? String(initialValues.price) : '100000');
  
  // Discount Scheme: 'tunggal' | 'kompound'
  const [discountMode, setDiscountMode] = useState('kompound');
  const [selectedPreset, setSelectedPreset] = useState('50% + 20%');
  const [discountFormula, setDiscountFormula] = useState('50% + 20%');
  
  // Validation state
  const [errorMessage, setErrorMessage] = useState('');

  // Quick Preset Options
  const presets = [
    { id: '10%', label: '10%', mode: 'tunggal', d1: 10, d2: 0, text: '10%' },
    { id: '20%', label: '20%', mode: 'tunggal', d1: 20, d2: 0, text: '20%' },
    { id: '25%', label: '25%', mode: 'tunggal', d1: 25, d2: 0, text: '25%' },
    { id: '50% + 20%', label: '50% + 20%', mode: 'kompound', d1: 50, d2: 20, text: '50% + 20%' },
    { id: 'b1g1', label: 'Beli 1 Gratis 1', mode: 'tunggal', d1: 50, d2: 0, text: 'Beli 1 Gratis 1' },
  ];

  // Quick Items "Sering Dibeli"
  const quickItems = [
    { name: 'Beras Rojolele 5kg', price: 100000, category: 'Bahan Pokok', unit: 'karung/5kg' },
    { name: 'Minyak Goreng 2L', price: 39500, category: 'Bahan Pokok', unit: 'pouch/2L' },
    { name: 'Susu UHT Full Cream', price: 21500, category: 'Bahan Pokok', unit: 'kotak/1L' },
    { name: 'Telur Ayam 1kg', price: 32000, category: 'Sayur & Buah', unit: 'kg' },
    { name: 'Daging Ayam Fillet', price: 48000, category: 'Daging & Ikan', unit: 'kg' },
    { name: 'Sabun Mandi Dettol', price: 28500, category: 'Perlengkapan Mandi', unit: 'pouch/450ml' },
  ];

  // Parse discounts from formula or preset
  let d1 = 0;
  let d2 = 0;
  if (discountMode === 'tunggal') {
    const match = discountFormula.match(/(\d+)/);
    if (match) d1 = Number(match[1]);
  } else {
    // compound discount formula e.g. 50% + 20%
    const matches = discountFormula.match(/(\d+)/g);
    if (matches && matches.length >= 2) {
      d1 = Number(matches[0]);
      d2 = Number(matches[1]);
    } else if (matches && matches.length === 1) {
      d1 = Number(matches[0]);
    }
  }

  // Calculate Transparency Pricing (SRS F-03)
  const priceNum = Math.max(0, Number(normalPrice.replace(/\D/g, '')) || 0);
  const priceAfterD1 = priceNum * (1 - d1 / 100);
  const priceAfterD2 = priceAfterD1 * (1 - d2 / 100);
  const finalUnitPrice = Math.round(priceAfterD2);
  const totalItemSubtotal = finalUnitPrice * quantity;
  const normalSubtotal = priceNum * quantity;
  const totalSavings = Math.max(0, normalSubtotal - totalItemSubtotal);

  // Plafon impact
  const simulatedRemaining = currentRemainingBudget - totalItemSubtotal;
  const isBudgetSafe = simulatedRemaining >= 0;

  const handleSelectPreset = (preset) => {
    playTapSound();
    setSelectedPreset(preset.id);
    setDiscountMode(preset.mode);
    setDiscountFormula(preset.text);
  };

  const handleSelectQuickItem = (item) => {
    playTapSound();
    setItemName(item.name);
    setNormalPrice(String(item.price));
    setCategory(item.category);
    setUnit(item.unit);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playTapSound();

    if (!itemName.trim()) {
      setErrorMessage('Nama barang belanja wajib diisi');
      return;
    }
    if (priceNum <= 0) {
      setErrorMessage('Harga satuan normal harus valid dan lebih dari Rp 0');
      return;
    }
    if (quantity < 1) {
      setErrorMessage('Jumlah kuantitas minimal 1');
      return;
    }

    setErrorMessage('');

    const newItem = {
      id: 'item-' + Date.now(),
      name: itemName.trim(),
      category: category,
      unit: unit,
      price: finalUnitPrice,
      originalPrice: priceNum,
      quantity: quantity,
      isSecondary: category === 'Lainnya' || category === 'Minuman & Camilan',
      discountLabel: (d1 > 0 || d2 > 0) ? `${d1}%${d2 > 0 ? ` + ${d2}%` : ''}` : null,
      lastMonthPrice: priceNum > 50000 ? priceNum - 4000 : priceNum,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
    };

    playSuccessSound();
    if (onAddToCart) onAddToCart(newItem);
  };

  return (
    <div className="pb-36 bg-slate-50 min-h-full px-4 pt-3 space-y-3.5">
      {/* 1. STORE QUICK ADD BANNER & PLAFON CARD */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                MODE TAMBAH CEPAT
              </span>
              <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                {currentStore}
              </h3>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
            🟢 Ready
          </span>
        </div>

        {/* Plafon Status Sub-card */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Sisa Plafon Saat Ini:</span>
            <strong className="text-emerald-800 font-extrabold text-sm">
              Rp {currentRemainingBudget.toLocaleString('id-ID')}
            </strong>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-700 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(10, (currentRemainingBudget / 350000) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. FORM INPUT UTAMA */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
        {/* Nama Barang with Barcode Scanner Icon inside */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
            <span>Nama Barang *</span>
            <span className="text-[10px] text-slate-400 font-semibold">Sering Dibeli</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Beras Rojolele 5kg"
              required
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => {
                playTapSound();
                if (onOpenBarcodeModal) onOpenBarcodeModal();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-800 p-1"
              title="Pindai Barcode Supermarket"
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>

          {/* Quick chips below input */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 text-[10px]">
            {quickItems.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickItem(item)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-full border border-slate-200/80 font-semibold flex items-center space-x-1 transition-colors shrink-0"
              >
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Kategori Barang (Segmented Horizontal Buttons) */}
        <div>
          <span className="text-xs font-bold text-slate-800 mb-1.5 block">
            Kategori Barang
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'Bahan Pokok', label: 'Bahan Pokok', icon: Check },
              { id: 'Sayur & Buah', label: 'Sayur & Buah' },
              { id: 'Daging & Ikan', label: 'Daging & Ikan' },
              { id: 'Perlengkapan Mandi', label: 'Perlengkapan Mandi' },
            ].map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setCategory(cat.id);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center space-x-1 ${
                    isActive
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Satuan Takar & Stepper Jumlah Kuantitas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-800 mb-1 block">
              Satuan Takar
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-700"
            >
              <option value="karung/5kg">karung/5kg</option>
              <option value="pouch/2L">pouch/2L</option>
              <option value="kotak/1L">kotak/1L</option>
              <option value="pouch/450ml">pouch/450ml</option>
              <option value="liter">liter</option>
              <option value="kg">kg</option>
              <option value="tray">tray</option>
              <option value="pcs">pcs</option>
              <option value="zak">zak</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 mb-1 block">
              Jumlah
            </label>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-extrabold text-slate-900 w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setQuantity(quantity + 1);
                }}
                className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Harga Satuan Normal with Validation */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
            <span>Harga Satuan Normal *</span>
            <span className="text-[10px] text-slate-400 font-semibold">Numeric Numpad</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-900">
              Rp
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={priceNum || ''}
              onChange={(e) => setNormalPrice(e.target.value)}
              placeholder="100.000"
              min="0"
              step="500"
              required
              className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
            />
          </div>
        </div>

        {/* 3. SKEMA PROMO DISKON (F-03) */}
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-900">
              <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center text-[10px]">
                %
              </span>
              <span>Skema Promo Diskon</span>
            </div>

            {/* Toggle Tabs: Tunggal | Kompound */}
            <div className="flex p-0.5 bg-slate-200/80 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setDiscountMode('tunggal');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  discountMode === 'tunggal' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Tunggal
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setDiscountMode('kompound');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  discountMode === 'kompound' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Kompound
              </button>
            </div>
          </div>

          {/* Preset Cepat Supermarket */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 mb-1.5 block">
              Preset Cepat Supermarket:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formula Diskon Input Box */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>Formula Diskon (% atau %)</span>
              <span className="text-[10px] text-amber-800 font-semibold">
                {discountMode === 'kompound' ? 'Mode Diskon Kompound' : 'Mode Diskon Tunggal'}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={discountFormula}
                onChange={(e) => setDiscountFormula(e.target.value)}
                placeholder="50% + 20%"
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-700"
              />
              {discountFormula && (
                <button
                  type="button"
                  onClick={() => {
                    setDiscountFormula('0%');
                    setSelectedPreset('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Kalkulator Rincian Transparansi Diskon */}
          <div className="bg-white rounded-xl p-3 border border-slate-200/90 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>1. Harga Awal:</span>
              <span className="font-bold text-slate-900">Rp {priceNum.toLocaleString('id-ID')}</span>
            </div>
            {d1 > 0 && (
              <div className="flex justify-between text-slate-600 font-medium">
                <span>↓ Diskon {d1}%:</span>
                <span className="font-bold text-emerald-700">Rp {Math.round(priceAfterD1).toLocaleString('id-ID')} ({d1}%)</span>
              </div>
            )}
            {d2 > 0 && (
              <div className="flex justify-between text-slate-600 font-medium">
                <span>↓ Lanjut Diskon {d2}%:</span>
                <span className="font-bold text-emerald-700">Rp {finalUnitPrice.toLocaleString('id-ID')} ({d2}%)</span>
              </div>
            )}
            <div className="flex justify-between text-amber-800 font-extrabold pt-1.5 border-t border-slate-100">
              <span className="flex items-center space-x-1">
                <span>🎁 Total Hemat Diskon:</span>
              </span>
              <span>Rp {totalSavings.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* 4. SIMULASI DAMPAK PLAFON */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <span>⚡ Simulasi Dampak Plafon:</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              isBudgetSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {isBudgetSafe ? 'Masih Aman' : 'Peringatan Limit!'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Saldo sesudah item ini:</span>
            <strong className={`font-extrabold text-sm ${isBudgetSafe ? 'text-emerald-800' : 'text-red-600'}`}>
              Rp {simulatedRemaining.toLocaleString('id-ID')}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Subtotal Item:</span>
            <span className="font-bold text-slate-800">Rp {totalItemSubtotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-600 font-bold text-center">{errorMessage}</p>
        )}

        {/* 5. CTA BUTTON BESAR HIJAU */}
        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Tambah ke Keranjang (+)</span>
        </button>

        {/* Note Offline Ready */}
        <div className="flex items-center space-x-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Fitur offline ready:</strong> Item akan tersimpan otomatis di perangkat dan sinkron ke cloud saat online.
          </span>
        </div>
      </form>
    </div>
  );
}
