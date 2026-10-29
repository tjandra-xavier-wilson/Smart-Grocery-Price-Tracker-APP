'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Store, 
  Wallet, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus as MinusIcon, 
  AlertTriangle, 
  Volume2, 
  Sparkles, 
  Scan, 
  ArrowRight, 
  Pencil, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  RotateCcw,
  Flag,
  Scissors
} from 'lucide-react';
import { playTapSound, playSuccessSound, playWarningBeep } from '../utils/sound';

export default function ActiveCartScreen({
  cartItems = [],
  budgetLimit = 350000,
  currentStore = 'Lotte Mart - Puri Indah',
  transactionDate = '24 Mei 2025',
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenBudgetModal,
  onOpenStoreModal,
  onOpenCheckout,
  onOpenBarcodeModal,
  onCutSecondaryItems,
  onLoadMockupOverbudget,
  onLoadMockupNormal
}) {
  // Calculations
  const totalCartPrice = cartItems.reduce((acc, item) => {
    const itemPrice = item.price || 0;
    return acc + (itemPrice * (item.quantity || 1));
  }, 0);

  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const percentageUsed = budgetLimit > 0 ? (totalCartPrice / budgetLimit) * 100 : 0;
  const isOverbudget = totalCartPrice > budgetLimit;
  const deficitAmount = Math.max(0, totalCartPrice - budgetLimit);
  const remainingBudget = Math.max(0, budgetLimit - totalCartPrice);

  const secondaryItemsCount = cartItems.filter(i => i.isSecondary).length;

  // Beep Sound on first entering overbudget
  const prevOverbudgetRef = useRef(false);
  useEffect(() => {
    if (isOverbudget && !prevOverbudgetRef.current) {
      playWarningBeep();
    }
    prevOverbudgetRef.current = isOverbudget;
  }, [isOverbudget]);

  return (
    <div className="pb-36 bg-slate-50 min-h-full">
      {/* 1. OVERBUDGET DANGER BANNER (Screen 2 / SRS F-05) */}
      {isOverbudget ? (
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-4 shadow-lg animate-fade-in border-b-2 border-red-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 font-extrabold text-xs tracking-wider uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>OVERBUDGET SAFETY CAP</span>
            </div>
            <div className="flex items-center space-x-1 bg-red-900/80 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-500/50">
              <Volume2 className="w-3 h-3 text-red-200" />
              <span>Beep Aktif</span>
            </div>
          </div>

          <p className="text-xs font-bold leading-snug mb-3">
            ⚠️ TOTAL BELANJA MELEBIHI BATAS SALDO DOMPET! Kurangi kuantitas atau batalkan barang sekunder.
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium text-red-100">
              <span>Kapasitas Dompet: Rp {budgetLimit.toLocaleString('id-ID')}</span>
              <span className="font-bold text-amber-300">{percentageUsed.toFixed(1)}% (Kritis)</span>
            </div>
            
            {/* Red full capacity bar */}
            <div className="w-full h-2.5 bg-red-950/60 rounded-full overflow-hidden border border-red-400/40">
              <div 
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, percentageUsed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-extrabold tracking-tight">
                Rp {totalCartPrice.toLocaleString('id-ID')} <span className="text-xs font-normal opacity-80">/ Rp {budgetLimit.toLocaleString('id-ID')}</span>
              </span>
              <span className="bg-white text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                📈 +Rp {deficitAmount.toLocaleString('id-ID')} Over Limit
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Status Pills Row */
        <div className="px-4 pt-3 flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center justify-center space-x-1.5 py-1 px-2.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-semibold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Sync: Online &amp; Persistent</span>
          </div>
          <div className="flex items-center space-x-1 py-1 px-3 bg-slate-200/80 border border-slate-300 rounded-full text-[11px] font-semibold text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Offline Ready</span>
          </div>
        </div>
      )}

      {/* 2. REKOMENDASI PEMULIHAN (In Overbudget State) */}
      {isOverbudget && (
        <div className="mx-4 mt-3 p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl shadow-xs animate-slide-up flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
              <span>Rekomendasi Pemulihan</span>
              {secondaryItemsCount > 0 && (
                <button
                  onClick={() => {
                    playTapSound();
                    if (onCutSecondaryItems) onCutSecondaryItems();
                  }}
                  className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300"
                >
                  Potong Sekarang
                </button>
              )}
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Batalkan <strong className="text-amber-800 font-bold">{secondaryItemsCount} produk sekunder</strong> bertanda oranye di bawah ini untuk langsung mengembalikan saldo aman di bawah limit.
            </p>
          </div>
        </div>
      )}

      {/* 3. STORE & DATE CARD */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Supermarket Terpilih
              </span>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                {currentStore}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              if (onOpenStoreModal) onOpenStoreModal();
            }}
            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
          >
            Ganti ⇄
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Hari ini, {transactionDate}</span>
          </div>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold">
            🕒 Sesi #04-JKT
          </span>
        </div>
      </div>

      {/* 4. BUDGET CARD (Batas Saldo Dompet) */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
            <Wallet className="w-4 h-4 text-emerald-700" />
            <span>Batas Saldo Dompet</span>
          </div>
          <button
            onClick={() => {
              playTapSound();
              if (onOpenBudgetModal) onOpenBudgetModal();
            }}
            className="flex items-center space-x-1.5 text-slate-900 font-extrabold text-sm hover:text-emerald-800 transition-colors"
          >
            <span>Rp {budgetLimit.toLocaleString('id-ID')}</span>
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-300 ${
              isOverbudget 
                ? 'bg-red-600' 
                : percentageUsed >= 90 
                ? 'bg-amber-500' 
                : 'bg-emerald-700'
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>

        {/* Two-Column Summary Boxes */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Total Terpakai */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-semibold block">
              Total Terpakai ({percentageUsed.toFixed(1)}%)
            </span>
            <span className={`text-sm font-extrabold block mt-0.5 ${isOverbudget ? 'text-red-600' : 'text-slate-900'}`}>
              Rp {totalCartPrice.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 flex items-center space-x-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOverbudget ? 'bg-red-600' : 'bg-emerald-600'}`} />
              <span>{isOverbudget ? 'Status Kritis' : 'Status Normal'}</span>
            </span>
          </div>

          {/* Sisa Saldo Aman */}
          <div className={`p-2.5 rounded-xl border ${isOverbudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50/70 border-emerald-200/80'}`}>
            <span className="text-[10px] font-semibold text-slate-500 block">
              {isOverbudget ? 'Defisit Saldo' : 'Sisa Saldo Aman'}
            </span>
            <span className={`text-sm font-extrabold block mt-0.5 ${isOverbudget ? 'text-red-600' : 'text-emerald-800'}`}>
              {isOverbudget 
                ? `-Rp ${deficitAmount.toLocaleString('id-ID')}` 
                : `Rp ${remainingBudget.toLocaleString('id-ID')}`}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 flex items-center space-x-1 mt-0.5">
              <span>{isOverbudget ? '⚠️ Perlu Pemulihan' : '🛡️ Headroom Cukup'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Simulation Scenario Toggles (Bonus UX for evaluation) */}
      <div className="mx-4 mt-2.5 flex items-center justify-between text-[11px] px-1 text-slate-400">
        <span>Skenario Mockup:</span>
        <div className="space-x-2">
          <button
            onClick={() => {
              playTapSound();
              if (onLoadMockupNormal) onLoadMockupNormal();
            }}
            className="text-emerald-700 hover:underline font-bold"
          >
            Mockup 2 (Normal)
          </button>
          <span>•</span>
          <button
            onClick={() => {
              playTapSound();
              if (onLoadMockupOverbudget) onLoadMockupOverbudget();
            }}
            className="text-red-700 hover:underline font-bold"
          >
            Mockup 3 (Overbudget)
          </button>
        </div>
      </div>

      {/* 5. CART ITEMS LIST */}
      <section className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
              {isOverbudget ? 'Keranjang Belanja' : `Item di Keranjang (${cartItems.length})`}
            </h3>
            {isOverbudget && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.2 rounded-full">
                {cartItems.length} Barang
              </span>
            )}
          </div>
          {isOverbudget ? (
            <button
              onClick={() => {
                playTapSound();
                if (onClearCart) onClearCart();
              }}
              className="text-[11px] font-bold text-red-600 hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          ) : (
            <span className="text-[10px] font-medium text-slate-400">
              Geser kartu utk kelola
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <Store className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">Keranjang Masih Kosong</h4>
            <p className="text-[11px] text-slate-500">
              Buka menu &quot;Katalog &amp; Input&quot; untuk menambahkan barang belanjaan.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cartItems.map((item) => {
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const isItemSecondary = item.isSecondary;

              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl p-3 border transition-all shadow-2xs relative ${
                    isOverbudget && isItemSecondary 
                      ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300/60' 
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex space-x-3">
                    {/* Item Thumbnail */}
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {/* Overbudget Secondary Badge */}
                        {isOverbudget && isItemSecondary ? (
                          <>
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[9px] font-bold">
                              <Flag className="w-2.5 h-2.5" />
                              <span>Rekomendasi Batalkan</span>
                            </span>
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-md text-[9px] font-semibold">
                              Sekunder
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[9px] font-bold">
                              {item.category || 'Bahan Pokok'}
                            </span>
                            {item.unit && (
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-md text-[9px] font-medium">
                                {item.unit}
                              </span>
                            )}
                            {item.discountLabel && (
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[9px] font-bold">
                                {item.discountLabel}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                        {item.name}
                      </h4>

                      {/* Overbudget Subcategory info */}
                      {isOverbudget && item.subcat && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          {item.subcat}
                        </p>
                      )}

                      {/* Price Fluctuation Trend */}
                      {item.lastMonthPrice !== undefined && item.lastMonthPrice !== null && (
                        <div className="mt-0.5">
                          {item.price > item.lastMonthPrice ? (
                            <span className="inline-flex items-center text-[10px] font-semibold text-rose-600">
                              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                              <span>+Rp {(item.price - item.lastMonthPrice).toLocaleString('id-ID')} vs bln lalu</span>
                            </span>
                          ) : item.price < item.lastMonthPrice ? (
                            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700">
                              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                              <span>-Rp {(item.lastMonthPrice - item.price).toLocaleString('id-ID')} hemat vs bln lalu</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-semibold text-slate-400">
                              <MinusIcon className="w-3 h-3" />
                              <span>Harga Stabil</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price & Stepper Row */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                        <div>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through mr-1.5 font-medium">
                              Rp {item.originalPrice.toLocaleString('id-ID')}
                            </span>
                          )}
                          <div className="text-xs font-extrabold text-slate-900">
                            Rp {itemTotal.toLocaleString('id-ID')}
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (Rp {item.price.toLocaleString('id-ID')}/{item.unit ? item.unit.split('/')[0].trim() : 'unit'})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stepper Pill [-] Qty [+] */}
                        <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-2 py-0.5 border border-slate-200">
                          <button
                            onClick={() => {
                              playTapSound();
                              onUpdateQuantity(item.id, (item.quantity || 1) - 1);
                            }}
                            className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-2xs font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-extrabold text-slate-900 w-4 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => {
                              playTapSound();
                              onUpdateQuantity(item.id, (item.quantity || 1) + 1);
                            }}
                            className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-2xs font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Item Button (top right) */}
                    <button
                      onClick={() => {
                        playTapSound();
                        onRemoveItem(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Hapus Barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. BARCODE SCANNER PROMPT BANNER (above bottom sticky bar) */}
        <div className="mt-4 p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5 text-xs text-slate-700 font-medium">
            <Scan className="w-4 h-4 text-emerald-700" />
            <span>Ingin scan barcode item alternatif?</span>
          </div>
          <button
            onClick={() => {
              playTapSound();
              if (onOpenBarcodeModal) onOpenBarcodeModal();
            }}
            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            Scan Lagi
          </button>
        </div>
      </section>

      {/* 7. STICKY BOTTOM BAR */}
      <div className="fixed bottom-16 left-0 right-0 z-30 max-w-[430px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
        {isOverbudget ? (
          /* Overbudget Mode: Defisit & Potong Sekunder CTA */
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-600">
                <span>Sisa Saldo Dompet</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              </div>
              <div className="text-base font-extrabold text-red-600 tracking-tight">
                -Rp {deficitAmount.toLocaleString('id-ID')} <span className="text-xs font-bold">(Defisit)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Limit Maks: Rp {budgetLimit.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Amber Action Button: Potong Sekunder */}
            <button
              onClick={() => {
                playTapSound();
                if (onCutSecondaryItems) onCutSecondaryItems();
              }}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Potong Sekunder</span>
            </button>
          </div>
        ) : (
          /* Normal Mode: Total & Checkout CTA */
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">
                {cartItems.length} macam ({totalItemCount} Item) • <span className="text-emerald-700 font-bold">Sisa: Rp {remainingBudget.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 tracking-tight">
                Rp {totalCartPrice.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  playTapSound();
                  if (onClearCart) onClearCart();
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                title="Kosongkan Troli"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenCheckout) onOpenCheckout();
                }}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
