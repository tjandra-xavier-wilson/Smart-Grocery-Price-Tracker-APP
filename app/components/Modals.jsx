'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  Store, 
  Calendar, 
  Scan, 
  Check, 
  Receipt, 
  Copy, 
  Trash2, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';
import { toISODateString, toIndoDisplayDate } from '../utils/date';
import { playTapSound, playSuccessSound } from '../utils/sound';

/**
 * 1. Modal Edit Batas Saldo Dompet
 */
export function BudgetLimitModal({ isOpen, onClose, currentLimit, onSaveLimit }) {
  const [val, setVal] = useState(currentLimit || 350000);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Atur Batas Saldo Dompet</h3>
          </div>
          <button 
            onClick={() => { playTapSound(); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Pasang batas aman saldo saku belanja bulanan. Sistem Sentinel akan memicu peringatan otomatis jika pengeluaran melebihi limit.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-800 mb-1 block">Batas Dompet (Rp)</label>
            <input
              type="number"
              inputMode="numeric"
              value={val}
              onChange={(e) => setVal(Number(e.target.value) || 0)}
              step="10000"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex items-center space-x-2">
            {[100000, 250000, 350000, 500000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { playTapSound(); setVal(preset); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                  val === preset 
                    ? 'bg-emerald-800 text-white border-emerald-900' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rp {(preset / 1000)}rb
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playSuccessSound();
              onSaveLimit(val);
              onClose();
            }}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Simpan Batas Dompet
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Modal Pemilihan Supermarket & Tanggal
 */
export function StoreModal({ isOpen, onClose, currentStore, currentDate, onSaveStore }) {
  const [store, setStore] = useState(currentStore || 'Lotte Mart - Puri Indah');
  const [isoDate, setIsoDate] = useState(() => toISODateString(currentDate || new Date()));

  useEffect(() => {
    if (isOpen) {
      setStore(currentStore || 'Lotte Mart - Puri Indah');
      setIsoDate(toISODateString(currentDate || new Date()));
    }
  }, [isOpen, currentStore, currentDate]);

  if (!isOpen) return null;

  const displayDate = toIndoDisplayDate(isoDate);

  const stores = [
    'Lotte Mart - Puri Indah',
    'Super Indo - Pesanggrahan',
    'Hypermart - Puri Mall',
    'Indogrosir Daan Mogot'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Pilih Supermarket &amp; Tanggal</h3>
          </div>
          <button 
            onClick={() => { playTapSound(); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 mb-1.5 block">Nama Supermarket</label>
            <div className="space-y-1.5">
              {stores.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { playTapSound(); setStore(s); }}
                  className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer ${
                    store === s 
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{s}</span>
                  {store === s && <Check className="w-4 h-4 text-emerald-700" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilih Tanggal Transaksi:</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setIsoDate(toISODateString(new Date()));
                }}
                className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Hari Ini
              </button>
            </div>

            {/* Date Picker Interaktif */}
            <input
              type="date"
              value={isoDate}
              onChange={(e) => setIsoDate(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700 cursor-pointer"
            />

            {/* Format Terstandarisasi Indonesia */}
            <div className="mt-1.5 px-3 py-1.5 bg-emerald-50/70 border border-emerald-200/60 rounded-lg flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Format Terstandarisasi:</span>
              <span className="font-extrabold text-emerald-800">📅 {displayDate}</span>
            </div>
          </div>

          <button
            onClick={() => {
              playSuccessSound();
              onSaveStore(store, displayDate, isoDate);
              onClose();
            }}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Terapkan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Modal Barcode Scanner Simulasi
 */
export function BarcodeScannerModal({ isOpen, onClose, onScannedItem }) {
  if (!isOpen) return null;

  const sampleBarcodes = [
    { code: '899275300101', name: 'Beras Premium Rojolele 5kg', price: 74000, category: 'Bahan Pokok', unit: 'karung / 5kg' },
    { code: '899100120045', name: 'Minyak Goreng Sania 2L', price: 33500, category: 'Bahan Pokok', unit: 'pouch / 2L' },
    { code: '899300511029', name: 'Susu UHT Full Cream Greenfields 1L', price: 21500, category: 'Produk Susu & Telur', unit: 'kotak / 1L' },
    { code: '899450239018', name: 'Sabun Mandi Dettol Reff 450ml', price: 28500, category: 'Perlengkapan Mandi', unit: 'pouch / 450ml' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="w-full max-w-[390px] bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-700 flex flex-col items-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Scanner Barcode Supermarket</h3>
          </div>
          <button 
            onClick={() => { playTapSound(); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="w-full my-4 relative bg-slate-950 rounded-2xl h-44 overflow-hidden border border-slate-800 flex items-center justify-center">
          <div className="w-48 h-28 border-2 border-emerald-400/80 rounded-xl relative flex items-center justify-center">
            {/* Red Laser Scanning Line */}
            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
          </div>
          <span className="absolute bottom-2 text-[10px] text-slate-400 font-mono">
            Arahkan kamera ke barcode kemasan barang
          </span>
        </div>

        {/* Barcode Quick Select */}
        <div className="w-full space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300">Pilih Barcode Deteksi Cepat:</span>
          {sampleBarcodes.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                playSuccessSound();
                onScannedItem(item);
                onClose();
              }}
              className="w-full p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl text-left flex items-center justify-between border border-slate-700 transition-colors cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-white block">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">[{item.code}] • {item.unit}</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-400">
                Rp {item.price.toLocaleString('id-ID')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Modal Detail Struk Belanja
 */
export function ReceiptDetailModal({ isOpen, onClose, session }) {
  if (!isOpen || !session) return null;

  const handleCopyText = () => {
    playTapSound();
    const text = `🛒 STRUK BELANJA - ${session.storeName}\nTanggal: ${session.date} ${session.time || ''}\nTotal: Rp ${session.totalSpent.toLocaleString('id-ID')}\nStatus: ${session.statusBadge}\n\nSmart Grocery Sentinel`;
    navigator.clipboard?.writeText(text);
    alert('Struk teks disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">{session.storeName}</h3>
            <span className="text-[11px] text-slate-400">{session.date} • {session.time}</span>
          </div>
          <button 
            onClick={() => { playTapSound(); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">Total Struk:</span>
            <span className="text-lg font-black text-emerald-800">
              Rp {session.totalSpent.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Rincian Item Belanja:
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {(session.items || []).map((i, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-800">{i.name || i.nama_barang || "Item"} x {i.quantity || i.kuantitas || 1}</span>
                <span className="font-bold text-slate-900">Rp {(((i.price || i.harga_akhir_per_satuan || 0) * (i.quantity || i.kuantitas || 1))).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleCopyText}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Struk Teks (Untuk WhatsApp)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper icon/emoji untuk barang belanjaan aktual
 * Kategori Sayuran -> 🥦, Bahan Pokok -> 🍚, Daging -> 🥩, fallback -> 📦
 */
export function getItemIcon(category = '', name = '') {
  const cat = String(category || '').toLowerCase();
  const n = String(name || '').toLowerCase();

  // Pencocokan nama produk spesifik
  if (n.includes('beras') || n.includes('rice')) return '🍚';
  if (n.includes('minyak') || n.includes('oil')) return '🌻';
  if (n.includes('telur') || n.includes('egg')) return '🥚';
  if (n.includes('gula') || n.includes('sugar')) return '🍬';
  if (n.includes('tepung') || n.includes('flour')) return '🌾';
  if (n.includes('susu') || n.includes('milk')) return '🥛';
  if (n.includes('kopi') || n.includes('coffee')) return '☕';
  if (n.includes('wortel') || n.includes('carrot')) return '🥕';
  if (n.includes('bayam') || n.includes('spinach') || n.includes('sayur') || n.includes('brokoli')) return '🥦';
  if (n.includes('tomat') || n.includes('tomato')) return '🍅';
  if (n.includes('apel') || n.includes('apple')) return '🍎';
  if (n.includes('pisang') || n.includes('banana')) return '🍌';
  if (n.includes('jeruk') || n.includes('orange')) return '🍊';
  if (n.includes('semangka') || n.includes('watermelon')) return '🍉';
  if (n.includes('daging') || n.includes('sapi') || n.includes('beef') || n.includes('meat')) return '🥩';
  if (n.includes('ayam') || n.includes('chicken')) return '🍗';
  if (n.includes('ikan') || n.includes('fish') || n.includes('salmon')) return '🐟';
  if (n.includes('udang') || n.includes('shrimp')) return '🦐';
  if (n.includes('mie') || n.includes('noodle')) return '🍜';

  // Fallback kategori
  if (cat.includes('sayur')) return '🥦';
  if (cat.includes('buah')) return '🍎';
  if (cat.includes('pokok') || cat.includes('sembako')) return '🍚';
  if (cat.includes('daging') || cat.includes('ikan')) return '🥩';
  if (cat.includes('minum')) return '🧃';
  if (cat.includes('snack') || cat.includes('promo')) return '🍪';

  return '📦';
}

/**
 * 5. Modal Animasi Checkout ("Barang Masuk Troli" & "Troli Meluncur")
 */
export function CheckoutModal({ 
  isOpen, 
  onClose, 
  totalSpent = 0, 
  storeName = 'Supermarket Grosir', 
  itemCount = 0, 
  cartItems = [], 
  onConfirmCheckout,
  isCheckoutLoading = false 
}) {
  const [phase, setPhase] = useState(1); // 1: Barang Masuk (0 - 1.2s), 2: Troli Meluncur (1.2 - 1.7s), 3: Centang Sukses (1.7 - 2.5s)

  // Ambil maksimal 3 barang pertama dari array keranjang
  const displayItems = (cartItems && cartItems.length > 0) 
    ? cartItems.slice(0, 3) 
    : [{ name: 'Belanjaan', category: 'sembako' }];

  useEffect(() => {
    if (!isOpen) {
      setPhase(1);
      return;
    }

    setPhase(1);

    // 1. Fase 2: Troli Meluncur cepat ke kanan setelah ~1.2 detik
    const timerPhase2 = setTimeout(() => {
      setPhase(2);
    }, 1200);

    // 2. Fase 3: Centang Hijau Sukses membesar di tengah layar setelah ~1.7 detik
    const timerPhase3 = setTimeout(() => {
      playSuccessSound();
      setPhase(3);
    }, 1700);

    // 3. Fase Cleanup: Tutup modal & eksekusi simpan ke Supabase setelah ~2.6 detik
    const timerCleanup = setTimeout(async () => {
      if (onConfirmCheckout) {
        await onConfirmCheckout();
      }
      onClose();
    }, 2600);

    return () => {
      clearTimeout(timerPhase2);
      clearTimeout(timerPhase3);
      clearTimeout(timerCleanup);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-[380px] text-center relative overflow-hidden py-8 px-4 flex flex-col items-center justify-center min-h-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* FASE 1 & 2: TROLI BESAR & BARANG MELOMPAT (PARABOLIC ARC) */}
        {/* ======================================================== */}
        <div
          className={`flex flex-col items-center justify-center w-full transition-all duration-500 ease-in ${
            phase === 2
              ? 'translate-x-[200%] opacity-0'
              : phase === 3
              ? 'hidden'
              : 'translate-x-0 opacity-100'
          }`}
        >
          {/* Wadah Troli dan Titik Jatuh Barang */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Glow Aura */}
            <div className="absolute inset-2 rounded-3xl bg-emerald-500/25 blur-xl -z-10 animate-pulse" />

            {/* Ikon Troli Besar di Tengah Layar */}
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-2xl border-2 border-emerald-400/40 relative">
              <ShoppingCart className="w-14 h-14 text-white stroke-[2.3] animate-trolley-shake" />

              {/* Badge Jumlah Item */}
              <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-md border-2 border-white animate-bounce">
                {itemCount || cartItems.length}
              </span>
            </div>

            {/* Animasi Barang-barang Aktual Melompat Masuk ke Troli (Parabolic Arc) */}
            {phase === 1 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {displayItems.map((item, idx) => {
                  const emoji = getItemIcon(item.category, item.name);
                  // Pola lompatan melengkung berurutan
                  const arcClass = idx === 0 
                    ? 'animate-arc-left' 
                    : idx === 1 
                    ? 'animate-arc-right' 
                    : 'animate-arc-center';
                  const delayStyle = { animationDelay: `${idx * 360}ms` };

                  return (
                    <div
                      key={item.id || idx}
                      style={delayStyle}
                      className={`absolute flex flex-col items-center justify-center z-30 ${arcClass}`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-2xl border-2 border-emerald-300 flex items-center justify-center text-2xl">
                        <span>{emoji}</span>
                      </div>
                      <span className="text-[9.5px] font-extrabold text-slate-900 bg-white/95 px-2 py-0.5 rounded-full shadow-md mt-1 max-w-[75px] truncate border border-slate-200">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Teks Status Fase 1 & 2 */}
          <div className="mt-6 space-y-1 text-center">
            <h3 className="text-lg font-black text-white tracking-tight drop-shadow-md">
              {phase === 1 ? 'Memasukkan Barang ke Troli...' : 'Troli Meluncur Cepat...'}
            </h3>
            <p className="text-xs text-emerald-200/90 font-medium">
              {storeName} • Total Rp {totalSpent.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FASE 3: CENTANG HIJAU SUKSES & TEKS PEMBAYARAN BERHASIL  */}
        {/* ======================================================== */}
        <div
          className={`flex flex-col items-center justify-center w-full transition-all duration-300 ease-out transform ${
            phase === 3
              ? 'scale-100 opacity-100'
              : 'scale-0 opacity-0 pointer-events-none absolute'
          }`}
        >
          {/* Ikon Centang Hijau Solid Membesar di Tengah Layar */}
          <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl ring-8 ring-emerald-400/30 animate-scale-in">
            <Check className="w-14 h-14 text-white stroke-[3.5]" />
          </div>

          <div className="mt-5 space-y-1.5 text-center">
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              Pembayaran Berhasil!
            </h3>
            <p className="text-xs text-emerald-100 font-medium">
              Total Transaksi: <strong className="text-white font-black">Rp {totalSpent.toLocaleString('id-ID')}</strong>
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold text-white border border-white/30 mt-1 shadow-xs">
              <span>✨ Menyinkronkan struk ke cloud...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 6. Modal Profil Akun & Opsi Logout / Ganti Akun
 */
export function UserProfileModal({ isOpen, onClose, currentUser, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 animate-slide-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-extrabold text-sm text-slate-900">Profil Akun Pemilik</h3>
          <button 
            onClick={() => { playTapSound(); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-full bg-emerald-800 text-white mx-auto flex items-center justify-center font-bold text-xl shadow-md overflow-hidden mb-3">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>WT</span>
          )}
        </div>

        <h4 className="text-base font-extrabold text-slate-900">{currentUser?.name || 'Wilson Tjandra'}</h4>
        <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email || 'tjandra.xavier.wilson@gmail.com'}</p>

        <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Single-User Dedicated Owner</span>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onLogout();
              onClose();
            }}
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <span>🚪 Keluar ke Halaman Login Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 6. Modal Konfirmasi Hapus Riwayat Belanja (Safety Warning)
 */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirmDelete,
  targetItem = null,
  isDeletingAll = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 animate-slide-up text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center ring-8 ring-rose-50">
          <Trash2 className="w-7 h-7" />
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900">
            {isDeletingAll ? 'Hapus Seluruh Riwayat Belanja?' : 'Hapus Riwayat Belanja Ini?'}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Apakah Anda yakin ingin menghapus {isDeletingAll ? 'seluruh ' : ''}riwayat pembelanjaan ini? Tindakan ini permanen dan data tidak dapat dikembalikan.
          </p>
        </div>

        {targetItem && !isDeletingAll && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left space-y-1">
            <div className="text-xs font-bold text-slate-900">{targetItem.storeName || targetItem.store_name}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {targetItem.date || targetItem.shopping_date} • {targetItem.itemCount || targetItem.items_count || 1} Item
            </div>
            <div className="text-xs font-black text-rose-600">
              Rp {Number(targetItem.totalSpent || targetItem.total_spent || 0).toLocaleString('id-ID')}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onConfirmDelete();
            }}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
