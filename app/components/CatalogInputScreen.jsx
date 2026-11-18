'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Search
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';
import { GROCERY_PRODUCTS } from '../data/groceryData';
import { getProductEmoji, ProductEmojiBox, PriceFluctuationBadge } from '../utils/emoji';
import { generateDefaultPrices } from '../../src/lib/supabaseClient';
import { getItemStorePrice } from '../utils/storePrices';

export default function CatalogInputScreen({
  currentStore = 'Lotte Mart Grocery - Puri Indah',
  currentRemainingBudget = 125500,
  onAddToCart,
  onOpenBarcodeModal,
  initialValues = null,
  historyList = [],
  recommendedItems = [],
  onAddCustomProduct = null
}) {
  const [itemName, setItemName] = useState(initialValues?.name || '');
  const [category, setCategory] = useState(initialValues?.category || 'Bahan Pokok');
  const [unit, setUnit] = useState(initialValues?.unit || '5kg');
  const [quantity, setQuantity] = useState(initialValues?.quantity || 1);
  const [normalPrice, setNormalPrice] = useState(initialValues?.price ? String(initialValues.price) : '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Discount Scheme: 'tunggal' | 'kompound'
  const [discountMode, setDiscountMode] = useState('kompound');
  const [selectedPreset, setSelectedPreset] = useState('50% + 20%');
  const [discountFormula, setDiscountFormula] = useState('50% + 20%');
  
  // Validation state
  const [errorMessage, setErrorMessage] = useState('');

  // Skenario Uji 4 (SRS F-04): 3 Mock Items Wajib
  const srsMockItems = [
    { name: 'Beras 5kg', price: 74000, lastMonthPrice: 68000, category: 'Bahan Pokok', unit: '5kg' },
    { name: 'Telur Ayam Ras 1kg', price: 28000, lastMonthPrice: 32000, category: 'Bahan Pokok', unit: '1 kg' },
    { name: 'Garam 500g', price: 5000, lastMonthPrice: 5000, category: 'Bahan Pokok', unit: '500g' }
  ];

  // Consolidated Master Products for Autocomplete (Tanpa Properti Image)
  const allMasterItems = useMemo(() => {
    const list = [...srsMockItems];

    const extraStaples = [
      { name: 'Minyak Goreng Sawit Murni 2L', price: 38500, lastMonthPrice: 35000, category: 'Bahan Pokok', unit: 'pouch/2L' },
      { name: 'Mie Instan Indomie Goreng', price: 3500, lastMonthPrice: 3500, category: 'Bahan Pokok', unit: 'pcs/85g' },
      { name: 'Mie Instan Indomie Kuah Soto', price: 3500, lastMonthPrice: 3500, category: 'Bahan Pokok', unit: 'pcs/75g' },
      { name: 'Gula Pasir Kristal Putih 1kg', price: 17500, lastMonthPrice: 17500, category: 'Bahan Pokok', unit: '1 kg' },
      { name: 'Kecap Manis Bango 550ml', price: 24500, lastMonthPrice: 22000, category: 'Bumbu Dapur', unit: 'pouch/550ml' },
      { name: 'Saus Sambal ABC Extra Pedas', price: 14500, lastMonthPrice: 14500, category: 'Bumbu Dapur', unit: 'botol/335ml' },
      { name: 'Bawang Merah Brebes 500g', price: 19000, lastMonthPrice: 22000, category: 'Bumbu Dapur', unit: '500g' },
      { name: 'Bawang Putih Kating 500g', price: 22000, lastMonthPrice: 21000, category: 'Bumbu Dapur', unit: '500g' },
      { name: 'Cabe Rawit Merah 250g', price: 18000, lastMonthPrice: 16000, category: 'Sayur & Buah', unit: '250g' },
      { name: 'Susu UHT Ultra Milk 1L', price: 19500, lastMonthPrice: 21000, category: 'Bahan Pokok', unit: 'kotak/1L' },
      { name: 'Sabun Mandi Dettol 400ml', price: 26500, lastMonthPrice: 29000, category: 'Perlengkapan Mandi', unit: 'pouch/400ml' },
      { name: 'Deterjen Rinso Cair 750ml', price: 21500, lastMonthPrice: 20000, category: 'Perlengkapan Mandi', unit: 'pouch/750ml' }
    ];

    extraStaples.forEach(item => {
      if (!list.some(p => p.name.toLowerCase() === item.name.toLowerCase())) {
        list.push({
          id: 'extra-' + item.name.replace(/\s+/g, '-').toLowerCase(),
          ...item
        });
      }
    });

    if (historyList && Array.isArray(historyList)) {
      historyList.forEach(trip => {
        if (trip.items && Array.isArray(trip.items)) {
          trip.items.forEach(hItem => {
            if (hItem.name && !list.some(p => p.name.toLowerCase() === hItem.name.toLowerCase())) {
              list.push({
                id: 'hist-' + (hItem.id || Math.random()),
                name: hItem.name,
                category: hItem.category || 'Bahan Pokok',
                price: hItem.price || 0,
                lastMonthPrice: hItem.lastMonthPrice !== undefined ? hItem.lastMonthPrice : hItem.price,
                unit: hItem.unit || 'pcs'
              });
            }
          });
        }
      });
    }

    return list;
  }, [historyList]);

  // Autocomplete Filter: Memfilter dari state recommendedItems yang terhubung ke database Supabase
  const filteredSuggestions = useMemo(() => {
    const searchInput = itemName.trim().toLowerCase();
    if (!searchInput || searchInput.length < 1) return [];

    // Gabungkan master catalog dengan state recommendedItems yang terhubung ke Supabase
    const sourceList = (recommendedItems && recommendedItems.length > 0)
      ? recommendedItems
      : allMasterItems;

    // Logika filter sesuai SRS: recommendedItems.filter(item => item.name.toLowerCase().includes(searchInput.toLowerCase()))
    return sourceList.filter(item => 
      item.name.toLowerCase().includes(searchInput)
    ).slice(0, 8);
  }, [itemName, recommendedItems, allMasterItems]);

  const mapCategory = (rawCat) => {
    if (!rawCat) return 'Bahan Pokok';
    const cat = String(rawCat).toLowerCase();
    if (cat.includes('sembako') || cat.includes('pokok')) return 'Bahan Pokok';
    if (cat.includes('sayur') || cat.includes('buah')) return 'Sayur & Buah';
    if (cat.includes('daging') || cat.includes('ikan') || cat.includes('lauk')) return 'Daging & Ikan';
    if (cat.includes('mandi') || cat.includes('bersih')) return 'Perlengkapan Mandi';
    if (cat.includes('bumbu')) return 'Bumbu Dapur';
    if (cat.includes('minum') || cat.includes('camilan') || cat.includes('snack')) return 'Minuman & Camilan';
    return 'Bahan Pokok';
  };

  const handleSelectSuggestion = (product) => {
    playTapSound();
    setItemName(product.name);
    const storeP = getItemStorePrice(product, currentStore);
    const resolvedPrice = product.prices?.[currentStore]?.current || 
                          product.prices?.['Lotte Mart - Puri Indah']?.current || 
                          product.prices?.['Lotte Mart Grocery - Puri Indah']?.current || 
                          storeP.current || 
                          product.price;
    if (resolvedPrice) setNormalPrice(String(resolvedPrice));
    if (product.unit) setUnit(product.unit);
    if (product.category) setCategory(mapCategory(product.category));
    setShowSuggestions(false);
  };

  // Quick Preset Options
  const presets = [
    { id: '10%', label: '10%', mode: 'tunggal', d1: 10, d2: 0, text: '10%' },
    { id: '20%', label: '20%', mode: 'tunggal', d1: 20, d2: 0, text: '20%' },
    { id: '25%', label: '25%', mode: 'tunggal', d1: 25, d2: 0, text: '25%' },
    { id: '50% + 20%', label: '50% + 20%', mode: 'kompound', d1: 50, d2: 20, text: '50% + 20%' },
    { id: 'b1g1', label: 'Beli 1 Gratis 1', mode: 'tunggal', d1: 50, d2: 0, text: 'Beli 1 Gratis 1' },
  ];

  // Quick Items "Sering Dibeli" (Diinjeksi dengan Skenario Uji 4)
  const quickItems = [
    { name: 'Beras 5kg', price: 74000, lastMonthPrice: 68000, category: 'Bahan Pokok', unit: '5kg' },
    { name: 'Telur Ayam Ras 1kg', price: 28000, lastMonthPrice: 32000, category: 'Bahan Pokok', unit: '1 kg' },
    { name: 'Garam 500g', price: 5000, lastMonthPrice: 5000, category: 'Bahan Pokok', unit: '500g' },
    { name: 'Minyak Goreng Sawit 2L', price: 38500, lastMonthPrice: 35000, category: 'Bahan Pokok', unit: 'pouch/2L' },
    { name: 'Susu UHT Ultra Milk 1L', price: 19500, lastMonthPrice: 21000, category: 'Bahan Pokok', unit: 'kotak/1L' },
    { name: 'Sabun Mandi Dettol', price: 26500, lastMonthPrice: 29000, category: 'Perlengkapan Mandi', unit: 'pouch/400ml' }
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

    // Cek kecocokan di master katalog / recommendedItems
    const sourceList = (recommendedItems && recommendedItems.length > 0)
      ? recommendedItems
      : allMasterItems;

    const matched = sourceList.find(p => p.name.toLowerCase() === itemName.trim().toLowerCase());
    const isCustomItem = !matched || matched.isCustom === true;

    // Untuk barang baru / custom, historyPrice dan lastMonthPrice WAJIB null (tanpa simulasi palsu)
    const effectiveLastMonth = (!isCustomItem && matched && matched.lastMonthPrice !== undefined && matched.lastMonthPrice !== null)
      ? matched.lastMonthPrice
      : null;

    const defaultPrices = generateDefaultPrices(priceNum);

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
      lastMonthPrice: effectiveLastMonth,
      historyPrice: effectiveLastMonth,
      isCustom: isCustomItem,
      prices: defaultPrices
    };

    // Sinkronkan ke database Supabase dan state global jika ini adalah barang kustom baru
    if (isCustomItem && onAddCustomProduct) {
      onAddCustomProduct({
        id: newItem.id,
        name: itemName.trim(),
        category: category,
        unit: unit,
        price: priceNum,
        prices: defaultPrices,
        isCustom: true
      });
    }

    playSuccessSound();
    if (onAddToCart) onAddToCart(newItem);
    setItemName('');
    setNormalPrice('');
    setShowSuggestions(false);
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
            <strong className="text-emerald-700 font-extrabold text-sm">
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
        {/* Nama Barang with Autocomplete Dropdown & Emoji Support */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
            <span>Nama Barang *</span>
            <span className="text-[10px] text-slate-400 font-semibold">Sering Dibeli</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 250);
              }}
              placeholder="Ketik nama barang (contoh: Beras 5kg, Telur, Garam)"
              required
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => {
                playTapSound();
                if (onOpenBarcodeModal) onOpenBarcodeModal();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-800 p-1 cursor-pointer"
              title="Pindai Barcode Supermarket"
            >
              <Scan className="w-5 h-5" />
            </button>

            {/* Dropdown Rekomendasi / Autocomplete (100% Emoji & Fluctuation Badge) */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex items-center justify-between">
                  <span>Rekomendasi Barang</span>
                  <span>{filteredSuggestions.length} ditemukan</span>
                </div>
                {filteredSuggestions.map((sug, idx) => (
                  <button
                    key={sug.id || idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(sug);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50/50 transition-colors flex items-center justify-between group cursor-pointer gap-2"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {/* Emoji Icon Container */}
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        {getProductEmoji(sug.name, sug.category)}
                      </div>
                      <div className="min-w-0 pr-1">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                          {sug.name}
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {sug.unit || 'pcs'}
                          </span>
                          {!sug.isCustom && sug.lastMonthPrice !== null && sug.lastMonthPrice !== undefined && (
                            <>
                              <span>•</span>
                              <PriceFluctuationBadge 
                                price={sug.price} 
                                lastMonthPrice={sug.lastMonthPrice} 
                                showOldPrice={false} 
                                isCustom={sug.isCustom}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">
                        Rp {Number(sug.price || 0).toLocaleString('id-ID')}
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        {sug.category || 'Bahan Pokok'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick chips below input */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 text-[10px]">
            {quickItems.slice(0, 4).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickItem(item)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-full border border-slate-200/80 font-semibold flex items-center space-x-1 transition-colors shrink-0 cursor-pointer"
              >
                <span>{getProductEmoji(item.name, item.category)}</span>
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
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center space-x-1 cursor-pointer ${
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
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="5kg">5kg</option>
              <option value="1 kg">1 kg</option>
              <option value="500g">500g</option>
              <option value="250g">250g</option>
              <option value="pouch/2L">pouch/2L</option>
              <option value="kotak/1L">kotak/1L</option>
              <option value="pouch/400ml">pouch/400ml</option>
              <option value="pcs">pcs</option>
              <option value="ikat">ikat</option>
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
                className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 font-bold cursor-pointer"
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
                className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Harga Satuan Normal (Rp) */}
        <div>
          <label className="text-xs font-bold text-slate-800 mb-1 block">
            Harga Satuan Normal (Rp) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={normalPrice}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                setNormalPrice(numeric);
              }}
              placeholder="74.000"
              required
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>

        {/* 3. SKEMA DISKON BERSTANDAR SRS F-03 */}
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Percent className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-slate-900">
                Skema Promo &amp; Diskon Bertingkat
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">SRS F-03</span>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 mb-1.5 block">
              Pilih Cepat Diskon:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((pr) => {
                const isSelected = selectedPreset === pr.id;
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => handleSelectPreset(pr)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formula Diskon Input Box */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>Formula Diskon (% atau %)</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {discountMode === 'kompound' ? 'Mode Diskon Kompound' : 'Mode Diskon Tunggal'}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={discountFormula}
                onChange={(e) => setDiscountFormula(e.target.value)}
                placeholder="50% + 20%"
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              {discountFormula && (
                <button
                  type="button"
                  onClick={() => {
                    setDiscountFormula('0%');
                    setSelectedPreset('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
            <div className="flex justify-between text-emerald-700 font-extrabold pt-1.5 border-t border-slate-100">
              <span className="flex items-center space-x-1">
                <span>🎁 Total Hemat Diskon:</span>
              </span>
              <span>Rp {totalSavings.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* 4. SIMULASI DAMPAK PLAFON */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <span>⚡ Simulasi Dampak Plafon:</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              isBudgetSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isBudgetSafe ? 'Masih Aman' : 'Peringatan Limit!'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Saldo sesudah item ini:</span>
            <strong className={`font-extrabold text-sm ${isBudgetSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
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

        {/* 5. CTA BUTTON BESAR EMERALD GREEN */}
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
