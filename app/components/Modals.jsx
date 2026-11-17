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
  ShoppingCart,
  ArrowRight,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import { toISODateString, toIndoDisplayDate } from '../utils/date';
import { playTapSound, playSuccessSound, playWarningBeep } from '../utils/sound';
import { getProductEmoji } from '../utils/emoji';

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
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
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
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center space-x-2">
            {[100000, 250000, 350000, 500000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { playTapSound(); setVal(preset); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                  val === preset 
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs' 
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
  const [store, setStore] = useState(currentStore || 'Lotte Mart Grocery - Puri Indah');
  const [isoDate, setIsoDate] = useState(() => toISODateString(currentDate || new Date()));

  useEffect(() => {
    if (isOpen) {
      setStore(currentStore || 'Lotte Mart Grocery - Puri Indah');
      setIsoDate(toISODateString(currentDate || new Date()));
    }
  }, [isOpen, currentStore, currentDate]);

  if (!isOpen) return null;

  const displayDate = toIndoDisplayDate(isoDate);

  const stores = [
    'Lotte Mart Grocery - Puri Indah',
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
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
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
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
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
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
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
/**
 * Helper pemetaan alamat cabang supermarket berdasarkan nama toko
 */
export function getStoreAddress(storeName = '') {
  const s = String(storeName || '').toLowerCase();
  if (s.includes('lotte')) {
    return 'Mall Puri Indah, Kembangan, Jakarta Barat';
  }
  if (s.includes('super indo') || s.includes('superindo')) {
    return 'Jl. Pesanggrahan, Jakarta Barat';
  }
  if (s.includes('hypermart')) {
    return 'Puri Indah Mall, Jakarta Barat';
  }
  if (s.includes('indogrosir')) {
    return 'Jl. Daan Mogot, Jakarta Barat';
  }
  return 'Jakarta Barat, DKI Jakarta';
}

/**
 * Helper normalisasi data struk agar seragam baik dari Checkout maupun Riwayat Belanja
 */
export function normalizeReceiptData(data, currentUser) {
  if (!data) return null;

  // Format ID Struk (misal: TRX-448916-2351)
  let id = data.id || '';
  if (!String(id).startsWith('TRX-')) {
    const rawDigits = String(id).replace(/\D/g, '');
    const part1 = (rawDigits.slice(-6) || '448916').padStart(6, '0');
    const part2 = (rawDigits.slice(0, 4) || '2351').padStart(4, '0');
    id = `TRX-${part1}-${part2}`;
  }

  // Ambil nama toko secara dinamis dari data transaksi, riwayat, atau state toko aktif
  const rawStore = 
    data.storeName || 
    data.store_name || 
    data.notes || 
    currentUser?.currentStore || 
    'Lotte Mart Grocery - Puri Indah';

  const cleanStore = String(rawStore)
    .replace(/\s*##uid:[^#]+##\s*/g, '')
    .trim();

  const storeName = cleanStore.toUpperCase();
  const storeAddress = getStoreAddress(storeName);
  const customerName = 
    data.customerName || 
    currentUser?.user_metadata?.full_name || 
    currentUser?.user_metadata?.name || 
    currentUser?.name || 
    currentUser?.email?.split('@')[0] || 
    'Tjandra Wilson';
  const cashier = data.cashier || 'Self-Checkout (Smart Grocery)';
  const date = data.date || data.shopping_date || '17 November 2026';
  const time = data.time || '00.10 WIB';

  // Normalisasi daftar item
  const rawItems = data.items || data.grocery_items || [];
  const items = rawItems.map(it => {
    const name = it.name || it.nama_barang || 'Item Belanja';
    const quantity = Number(it.quantity || it.kuantitas || 1);
    const unit = it.unit || it.satuan || 'pcs';
    const price = Number(it.price || it.harga_akhir_per_satuan || it.harga_satuan || 0);
    const lineTotal = Number(it.total_harga_item) || (price * quantity);
    return { name, quantity, unit, price, lineTotal };
  });

  // Kalkulasi Subtotal, Promo, Pajak PPN 11%, dan Grand Total
  const subtotal = data.subtotal !== undefined
    ? Number(data.subtotal)
    : (items.length > 0
        ? items.reduce((sum, it) => sum + it.lineTotal, 0)
        : Number(data.totalSpent || data.total_spent || 0));

  const promo = Number(data.promo || data.savings || 0);
  const pajak = data.pajak !== undefined
    ? Number(data.pajak)
    : Math.round(subtotal * 0.11);

  const grandTotal = data.grandTotal !== undefined
    ? Number(data.grandTotal)
    : (subtotal - promo + pajak);

  return {
    id,
    storeName,
    storeAddress,
    date,
    time,
    customerName,
    cashier,
    items,
    subtotal,
    promo,
    pajak,
    grandTotal,
    paymentMethod: 'QRIS / Saldo Dompet',
    status: 'LUNAS / BERHASIL'
  };
}

/**
 * Komponen Utama Modal Struk Belanja Klasik Kertas Thermal POS
 */
export function ThermalPaperReceiptModal({
  isOpen,
  onClose,
  data,
  currentUser,
  onFinishAndShopAgain
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const normalized = normalizeReceiptData(data, currentUser);
  if (!normalized) return null;

  const handlePrint = () => {
    playTapSound();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyReceipt = () => {
    playTapSound();
    const itemsText = (normalized.items || []).map(item => {
      const qtyStr = item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`;
      return `${item.name}\n${qtyStr} x Rp ${item.price.toLocaleString('id-ID')} = Rp ${item.lineTotal.toLocaleString('id-ID')}`;
    }).join('\n');

    const receiptText = `${normalized.storeName}
--------------------------------
No. Struk: ${normalized.id}
Tanggal: ${normalized.date}, ${normalized.time}
Pelanggan: ${normalized.customerName}
--------------------------------
ITEM / KUANTITAS
${itemsText}
--------------------------------
Subtotal: Rp ${normalized.subtotal.toLocaleString('id-ID')}
Pajak (11%): Rp ${normalized.pajak.toLocaleString('id-ID')}
--------------------------------
GRAND TOTAL: Rp ${normalized.grandTotal.toLocaleString('id-ID')}
Status: ${normalized.status}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in select-none overflow-y-auto"
      onClick={onClose}
    >
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-receipt, #printable-thermal-receipt * {
            visibility: visible !important;
          }
          #printable-thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 380px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px dashed #444 !important;
            background: #ffffff !important;
            padding: 16px !important;
          }
          .receipt-no-print {
            display: none !important;
          }
        }
      ` }} />

      <div 
        className="w-full max-w-[390px] my-auto flex flex-col items-center animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup X di pojok kanan atas modal */}
        <button
          onClick={() => { playTapSound(); onClose(); }}
          className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-3.5 w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-md flex items-center justify-center transition-all cursor-pointer z-20 border border-slate-200"
          title="Tutup Struk"
        >
          <X className="w-4 h-4" />
        </button>

        {/* --- KERTAS STRUK THERMAL ASLI (Thermal Paper Style) --- */}
        <div 
          id="printable-thermal-receipt"
          className="w-full bg-[#fdfdfc] text-slate-900 rounded-2xl shadow-2xl border border-slate-300/80 p-5 font-mono text-xs relative overflow-hidden select-text"
          style={{
            backgroundImage: 'radial-gradient(#e5e7eb 0.75px, transparent 0.75px)',
            backgroundSize: '12px 12px'
          }}
        >
          {/* Top Accent Strip (Emerald Green Theme) */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800" />

          {/* 1. HEADER STRUK */}
          <div className="text-center pt-2 pb-1">
            <div className="inline-flex items-center justify-center space-x-1.5 mb-1">
              <Store className="w-4 h-4 text-emerald-800 shrink-0" />
              <span className="font-black text-sm tracking-wider uppercase text-slate-900">
                {normalized.storeName}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-tight">
              SMART GROCERY SYSTEM • SELF-CHECKOUT
            </p>
            <p className="text-[9.5px] text-slate-400">
              {normalized.storeAddress}
            </p>
          </div>

          {/* Pemisah Putus-Putus */}
          <div className="border-b border-dashed border-gray-400 my-2" />

          {/* 2. SUB-HEADER & IDENTITAS */}
          <div className="space-y-1 text-[11px] text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Struk:</span>
              <span className="font-black text-slate-900">{normalized.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span>{normalized.date}, {normalized.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggan:</span>
              <span className="font-bold text-slate-900 truncate max-w-[190px]">
                {normalized.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span className="font-bold text-slate-800">{normalized.cashier}</span>
            </div>
          </div>

          {/* Pemisah Putus-Putus */}
          <div className="border-b border-dashed border-gray-400 my-2" />

          {/* 3. DAFTAR BARANG (ITEMS LIST) */}
          <div className="space-y-2 py-0.5">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <span>ITEM / KUANTITAS</span>
              <span>SUBTOTAL</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
              {(normalized.items || []).map((item, idx) => (
                <div key={idx} className="text-[11px] leading-tight">
                  <div className="font-bold text-slate-900 break-words">
                    {item.name}
                  </div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 pl-1">
                    <span>
                      {item.quantity} {item.unit} x Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-slate-900">
                      Rp {item.lineTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pemisah Putus-Putus */}
          <div className="border-b border-dashed border-gray-400 my-2" />

          {/* 4. TOTALS, DISKON, PAJAK & GRAND TOTAL */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Belanja:</span>
              <span className="font-bold text-slate-800">
                Rp {normalized.subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Promo yang Digunakan:</span>
              <span className={`font-bold ${normalized.promo > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                {normalized.promo > 0 ? `-Rp ${normalized.promo.toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Biaya Pajak (PPN 11%):</span>
              <span className="font-bold text-slate-800">
                Rp {normalized.pajak.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="border-b-2 border-dashed border-slate-700 my-1.5" />

            <div className="flex justify-between text-xs font-black text-slate-900 py-0.5">
              <span>GRAND TOTAL:</span>
              <span className="text-sm font-black text-emerald-700">
                Rp {normalized.grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Metode Pembayaran:</span>
              <span className="font-bold text-slate-700">{normalized.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Status Transaksi:</span>
              <span className="font-black text-emerald-700">{normalized.status}</span>
            </div>
          </div>

          {/* Pemisah Putus-Putus */}
          <div className="border-b border-dashed border-gray-400 my-2" />

          {/* 5. FOOTER UCAPAN & BARCODE */}
          <div className="text-center space-y-1.5 text-[10px] text-slate-600">
            <p className="font-black text-slate-900">
              *** TERIMA KASIH TELAH BERBELANJA ***
            </p>
            <p className="text-[9.5px] leading-tight text-slate-500">
              Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.
            </p>
            <p className="text-[9px] text-slate-400">
              Simpan struk digital ini sebagai bukti sah transaksi.
            </p>

            {/* Mockup Barcode Thermal POS */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="h-8 flex items-center space-x-[2px] opacity-90 px-4 bg-white border border-slate-200 rounded py-1">
                {[4,2,3,1,4,1,2,3,2,1,4,2,1,3,2,4,1,3,2,1,4,2,3,1,2,4,2,1,3,4].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest mt-1">
                *{normalized.id}*
              </span>
            </div>
          </div>
        </div>

        {/* --- TOMBOL AKSI DI BAWAH STRUK (RECEIPT ACTIONS) --- */}
        <div className="w-full mt-3 space-y-2 receipt-no-print">
          {/* Tombol Cetak / Simpan & Salin Teks (Grid 2 Kolom) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 active:scale-98 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Cetak struk ke printer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Cetak / Simpan</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReceipt}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 active:scale-98 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Salin teks struk untuk dikirim via WhatsApp"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-700" />
                  <span>Salin Teks Struk</span>
                </>
              )}
            </button>
          </div>

          {/* Tombol Opsional: Tutup & Selesai / Belanja Lagi (Hanya jika onFinishAndShopAgain disediakan) */}
          {onFinishAndShopAgain && (
            <button
              type="button"
              onClick={onFinishAndShopAgain}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer tracking-wide"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Tutup &amp; Selesai (Belanja Lagi)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Modal Detail Struk Belanja (Thermal Paper Style dari Riwayat Belanja)
 */
export function ReceiptDetailModal({ isOpen, onClose, session, currentUser }) {
  return (
    <ThermalPaperReceiptModal
      isOpen={isOpen}
      onClose={onClose}
      data={session}
      currentUser={currentUser}
    />
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
 * Aset Troli Bergaya 3D (Isometric Metallic Shopping Trolley with Spinning Wheels)
 */
export function ThreeDimensionalCart({ itemCount = 0 }) {
  return (
    <div className="relative flex flex-col items-center select-none" style={{ filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.45))' }}>
      <svg
        viewBox="0 0 160 130"
        className="w-36 h-28 transform -rotate-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="metalChrome3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="handleGrad3D" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>
          <linearGradient id="basketDepth3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="wheelRim3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* 3D Basket Glow Chamber */}
        <polygon points="42,28 140,28 126,76 56,76" fill="url(#basketDepth3D)" />

        {/* 3D Base Chassis (Heavy chrome tube) */}
        <path
          d="M 28 88 L 126 88 L 132 80 L 46 80 Z"
          fill="url(#metalChrome3D)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <path
          d="M 32 88 L 48 38 L 42 28"
          stroke="url(#metalChrome3D)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 3D Ergonomic Red Handle Bar with Rounded Grip */}
        <path
          d="M 16 23 L 42 28"
          stroke="url(#handleGrad3D)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="16" cy="23" r="4.5" fill="#9f1239" />

        {/* 3D Isometric Basket Rim */}
        <polygon
          points="40,28 144,28 132,38 48,38"
          fill="#e2e8f0"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* 3D Basket Wire Grid */}
        <polygon
          points="48,38 132,38 122,76 56,76"
          fill="none"
          stroke="url(#metalChrome3D)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Horizontal Ribs */}
        <line x1="50" y1="47" x2="130" y2="47" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="52" y1="56" x2="128" y2="56" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="54" y1="65" x2="125" y2="65" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Vertical Ribs */}
        <line x1="62" y1="38" x2="65" y2="76" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="76" y1="38" x2="78" y2="76" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="90" y1="38" x2="91" y2="76" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="104" y1="38" x2="103" y2="76" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="118" y1="38" x2="115" y2="76" stroke="#94a3b8" strokeWidth="1.2" />

        {/* Front & Rear Leg Struts */}
        <path d="M 120 76 L 126 100" stroke="url(#metalChrome3D)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 46 88 L 42 100" stroke="url(#metalChrome3D)" strokeWidth="4" strokeLinecap="round" />

        {/* 3D Spinning Wheels with Rubber Treads & Chrome Hubcaps */}
        {/* Rear Wheel (center 42, 108) */}
        <g className="animate-spin-wheel-fast" style={{ transformOrigin: '42px 108px' }}>
          <circle cx="42" cy="108" r="13" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <circle cx="42" cy="108" r="8" fill="url(#wheelRim3D)" />
          <circle cx="42" cy="108" r="3.5" fill="#f8fafc" />
          <line x1="42" y1="100" x2="42" y2="116" stroke="#f8fafc" strokeWidth="1.5" />
          <line x1="34" y1="108" x2="50" y2="108" stroke="#f8fafc" strokeWidth="1.5" />
        </g>

        {/* Front Wheel (center 126, 108) */}
        <g className="animate-spin-wheel-fast" style={{ transformOrigin: '126px 108px' }}>
          <circle cx="126" cy="108" r="13" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <circle cx="126" cy="108" r="8" fill="url(#wheelRim3D)" />
          <circle cx="126" cy="108" r="3.5" fill="#f8fafc" />
          <line x1="126" y1="100" x2="126" y2="116" stroke="#f8fafc" strokeWidth="1.5" />
          <line x1="118" y1="108" x2="134" y2="108" stroke="#f8fafc" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Floating 3D Badge on Cart */}
      <div className="absolute -top-1.5 right-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-lg border-2 border-white ring-2 ring-amber-300/50">
        {itemCount}
      </div>

      {/* Realistic 3D Ground Motion Blur Shadow */}
      <div className="w-32 h-3.5 bg-slate-900/25 rounded-full blur-xs mt-[-6px] -z-10 animate-pulse" />
    </div>
  );
}

/**
 * 4.5 Modal Ringkasan Pesanan (Order Summary Pre-Checkout Confirmation)
 */
export function OrderSummaryModal({
  isOpen,
  onClose,
  cartItems = [],
  totalSpent = 0,
  budgetLimit = 350000,
  storeName = 'Lotte Mart Grocery - Puri Indah',
  onConfirmPay
}) {
  if (!isOpen) return null;

  const remainingBudget = budgetLimit - totalSpent;
  const isOverbudget = remainingBudget < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 animate-slide-up flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Ringkasan Pesanan
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {storeName} • {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} Item
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Item List (100% Emoji Representation) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2 my-1 min-h-[120px] max-h-[40vh]">
          {cartItems.map((item, idx) => {
            const qty = item.quantity || 1;
            const subtotal = (item.price || 0) * qty;
            return (
              <div 
                key={item.id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                    {getProductEmoji(item.name, item.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5 font-medium">
                      <span className="font-semibold text-slate-700">{qty} {item.unit || 'pcs'}</span>
                      <span>•</span>
                      <span>@Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 block">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Breakdown Card (Grand Total & Sisa Budget) */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-2 shrink-0 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Total Keseluruhan Belanja:</span>
            <span className="text-base font-black text-emerald-800">
              Rp {totalSpent.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1.5 border-t border-slate-200/70">
            <span>Sisa Limit Saldo Budget:</span>
            <span className={`font-bold ${isOverbudget ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
              {isOverbudget 
                ? `-Rp ${Math.abs(remainingBudget).toLocaleString('id-ID')} (Overbudget)`
                : `Rp ${remainingBudget.toLocaleString('id-ID')}`
              }
            </span>
          </div>
        </div>

        {/* Action Buttons: Kembali / Batal and Konfirmasi & Bayar */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="py-3 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-98 text-slate-700 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Kembali / Batal
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              if (onConfirmPay) onConfirmPay();
            }}
            className="py-3 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white text-xs font-extrabold shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Konfirmasi &amp; Bayar</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Modal Animasi Checkout ("Continuous Moving 3D Trolley" & "Transaksi Berhasil")
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
  const [stage, setStage] = useState('moving'); // 'moving' (0 - 2.3s) | 'success' (2.3 - 3.45s)

  // Ambil maksimal 3 barang pertama dari array keranjang
  const displayItems = (cartItems && cartItems.length > 0) 
    ? cartItems.slice(0, 3) 
    : [{ name: 'Bahan Belanjaan', category: 'sembako' }];

  useEffect(() => {
    if (!isOpen) {
      setStage('moving');
      return;
    }

    setStage('moving');

    // 1. Fase 2: Setelah troli 3D selesai menyeberang dan keluar di batas kanan layar (~2.3s)
    const timerSuccess = setTimeout(() => {
      playSuccessSound();
      setStage('success');
    }, 2300);

    // 2. Fase Cleanup: Setelah centang sukses tampil selama ~0.7s (total ~3.0s)
    const timerCleanup = setTimeout(async () => {
      if (onConfirmCheckout) {
        await onConfirmCheckout();
      }
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timerSuccess);
      clearTimeout(timerCleanup);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      {/* Custom Style Injections for Keyframe Synchronizations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cartDriveThroughConstant {
          0% {
            left: -160px;
          }
          100% {
            left: calc(100% + 50px);
          }
        }
        @keyframes wheelSpinRapid {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(1080deg);
          }
        }
        @keyframes parabolicDrop1 {
          0% {
            opacity: 0;
            transform: translateY(-80px) scale(0.3) rotate(-20deg);
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translateY(-25px) scale(1.15) rotate(15deg);
            opacity: 1;
          }
          80% {
            transform: translateY(20px) scale(0.95) rotate(-5deg);
            opacity: 1;
          }
          100% {
            transform: translateY(42px) scale(0.2) rotate(0deg);
            opacity: 0;
          }
        }
        @keyframes parabolicDrop2 {
          0% {
            opacity: 0;
            transform: translateY(-85px) scale(0.3) rotate(20deg);
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translateY(-25px) scale(1.2) rotate(-15deg);
            opacity: 1;
          }
          80% {
            transform: translateY(20px) scale(0.95) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: translateY(42px) scale(0.2) rotate(0deg);
            opacity: 0;
          }
        }
        @keyframes parabolicDrop3 {
          0% {
            opacity: 0;
            transform: translateY(-80px) scale(0.3) rotate(-15deg);
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translateY(-25px) scale(1.15) rotate(12deg);
            opacity: 1;
          }
          80% {
            transform: translateY(20px) scale(0.95) rotate(-8deg);
            opacity: 1;
          }
          100% {
            transform: translateY(42px) scale(0.2) rotate(0deg);
            opacity: 0;
          }
        }
        @keyframes successScaleUp {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.18);
            opacity: 1;
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes catchSparklePop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        .animate-cart-drive-linear {
          animation: cartDriveThroughConstant 2.3s linear forwards;
          will-change: left;
        }
        .animate-spin-wheel-fast {
          animation: wheelSpinRapid 2.3s linear infinite;
        }
        .animate-parabolic-drop-1 {
          animation: parabolicDrop1 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.28s forwards;
          opacity: 0;
        }
        .animate-parabolic-drop-2 {
          animation: parabolicDrop2 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.75s forwards;
          opacity: 0;
        }
        .animate-parabolic-drop-3 {
          animation: parabolicDrop3 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.22s forwards;
          opacity: 0;
        }
        .animate-sparkle-1 {
          animation: catchSparklePop 0.35s ease-out 0.68s forwards;
          opacity: 0;
        }
        .animate-sparkle-2 {
          animation: catchSparklePop 0.35s ease-out 1.15s forwards;
          opacity: 0;
        }
        .animate-sparkle-3 {
          animation: catchSparklePop 0.35s ease-out 1.62s forwards;
          opacity: 0;
        }
        .animate-success-pop {
          animation: successScaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      ` }} />

      <div 
        className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-emerald-100 relative overflow-hidden text-center min-h-[360px] flex flex-col items-center justify-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background tematik */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-emerald-100/70 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-teal-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* ======================================================== */}
        {/* FASE 1: TROLI 3D BERJALAN KONTINU & BARANG JATUH (PARABOLA) */}
        {/* ======================================================== */}
        {stage === 'moving' && (
          <div className="flex flex-col items-center justify-center w-full animate-fade-in">
            {/* Header Status Saat Troli Bergerak */}
            <div className="mb-4 text-center space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 rounded-full text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping mr-1" />
                <span>Memproses Checkout...</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Troli 3D Membawa Barang ke Kasir
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {storeName} • {itemCount || cartItems.length} Item
              </p>
            </div>

            {/* Lintasan Animasi (Runway Tematik Supermarket) */}
            <div className="relative w-full h-44 overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-50/70 via-slate-50 to-emerald-50/40 border border-emerald-100/90 shadow-inner flex items-center">
              {/* Garis Aisle Supermarket & Lantai */}
              <div className="absolute bottom-5 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-emerald-200" />

              {/* Troli 3D Berjalan Bergerak Konstan Linear dari Kiri ke Kanan */}
              <div className="absolute bottom-3 animate-cart-drive-linear pointer-events-none z-20">
                <ThreeDimensionalCart itemCount={itemCount || cartItems.length} />
              </div>

              {/* Barang-barang Belanjaan Aktual Jatuh Melengkung (Parabola) Masuk ke Troli */}
              <div className="absolute inset-0 pointer-events-none">
                {displayItems.map((item, idx) => {
                  const emoji = getItemIcon(item.category, item.name);
                  const dropClass = idx === 0 
                    ? 'animate-parabolic-drop-1' 
                    : idx === 1 
                    ? 'animate-parabolic-drop-2' 
                    : 'animate-parabolic-drop-3';
                  const leftPos = idx === 0 ? '24%' : idx === 1 ? '50%' : '76%';

                  return (
                    <div
                      key={item.id || idx}
                      style={{ left: leftPos, top: '24px' }}
                      className={`absolute z-30 flex flex-col items-center justify-center -translate-x-1/2 ${dropClass}`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-white shadow-xl border-2 border-emerald-400 flex items-center justify-center text-xl relative">
                        <span>{emoji}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-900 bg-white/95 px-2 py-0.5 rounded-full shadow-md mt-1 max-w-[80px] truncate border border-slate-200">
                        {item.name}
                      </span>
                    </div>
                  );
                })}

                {/* Kilauan Sparkle Pop saat Masing-masing Barang Mendarat Pas ke Troli */}
                <div className="absolute left-[24%] top-[70px] -translate-x-1/2 animate-sparkle-1">
                  <span className="text-lg">✨</span>
                </div>
                <div className="absolute left-[50%] top-[70px] -translate-x-1/2 animate-sparkle-2">
                  <span className="text-lg">✨</span>
                </div>
                <div className="absolute left-[76%] top-[70px] -translate-x-1/2 animate-sparkle-3">
                  <span className="text-lg">✨</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 font-medium">
              Total Tagihan: <strong className="text-emerald-800 font-black">Rp {totalSpent.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* FASE 2: CENTANG SUKSES & TEKS KONFIRMASI TRANSAKSI BERHASIL */}
        {/* ======================================================== */}
        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center w-full animate-success-pop text-center space-y-4 py-4">
            {/* Ikon Centang Hijau Solid Membesar */}
            <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl ring-8 ring-emerald-100 mx-auto">
              <Check className="w-14 h-14 text-white stroke-[3.5]" />
            </div>

            <div className="space-y-1.5 text-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Transaksi Berhasil!
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {storeName} • Total <strong className="text-emerald-800 font-black">Rp {totalSpent.toLocaleString('id-ID')}</strong>
              </p>
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-extrabold text-emerald-800 mt-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transaksi Selesai &amp; Tersimpan</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 5.5 Modal Struk Belanja Digital (Thermal Paper Style dari Checkout)
 */
export function DigitalReceiptModal({
  isOpen,
  onClose,
  receiptData,
  onFinishAndShopAgain,
  currentUser
}) {
  return (
    <ThermalPaperReceiptModal
      isOpen={isOpen}
      onClose={onClose}
      data={receiptData}
      currentUser={currentUser}
      onFinishAndShopAgain={onFinishAndShopAgain}
    />
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
          <span className="text-3xl select-none">👤</span>
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
  isDeletingAll = false,
  isLoading = false,
  errorMessage = ''
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
            Apakah Anda yakin ingin menghapus {isDeletingAll ? 'seluruh ' : ''}riwayat pembelanjaan ini? Tindakan ini permanen dan data di server Supabase akan dihapus.
          </p>
        </div>

        {/* Error message banner jika query Supabase gagal */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs text-rose-700 font-medium">
            <strong>Gagal menghapus:</strong> {errorMessage}
          </div>
        )}

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
            disabled={isLoading}
            onClick={() => {
              if (isLoading) return;
              playTapSound();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (isLoading) return;
              playTapSound();
              onConfirmDelete();
            }}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Permanen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 7. Modal Peringatan Troli Kosong (Shake Animation + Warning + Auto-Close 1.8s)
 */
export function EmptyCartModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Mainkan audio notifikasi peringatan
    playWarningBeep();

    // Auto-close setelah 1.8 detik (antara 1.5 hingga 2 detik sesuai spesifikasi)
    const timer = setTimeout(() => {
      onClose();
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      {/* Injeksi Keyframes Shake / Wiggle untuk Troli 3D */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes trolleyShakeReject {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          15% {
            transform: translateX(-14px) rotate(-8deg);
          }
          30% {
            transform: translateX(12px) rotate(7deg);
          }
          45% {
            transform: translateX(-10px) rotate(-5deg);
          }
          60% {
            transform: translateX(8px) rotate(4deg);
          }
          75% {
            transform: translateX(-5px) rotate(-2deg);
          }
          90% {
            transform: translateX(2px) rotate(1deg);
          }
        }
        @keyframes warningBadgePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.18);
          }
        }
        @keyframes emptyProgressCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-trolley-shake-reject {
          animation: trolleyShakeReject 0.6s ease-in-out infinite;
        }
        .animate-warning-pulse {
          animation: warningBadgePulse 0.8s ease-in-out infinite;
        }
      ` }} />

      <div 
        className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-amber-200/90 relative overflow-hidden text-center flex flex-col items-center justify-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background bernuansa amber / kuning */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-100/70 rounded-full blur-2xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-100/50 rounded-full blur-2xl -z-10 pointer-events-none" />

        {/* Badge Peringatan ⚠️ */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-black text-amber-800 shadow-2xs mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-warning-pulse" />
          <span>Checkout Ditolak</span>
        </div>

        {/* Wadah Ikon Troli 3D Berukuran Besar dengan Efek Shake / Wiggle Penolakan */}
        <div className="relative my-3 flex items-center justify-center">
          {/* Ikon Peringatan Kuning Mengambang di Sudut Troli */}
          <div className="absolute -top-2 -right-2 z-30 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-300/40 animate-warning-pulse text-sm font-bold">
            ⚠️
          </div>

          {/* Ikon Troli 3D yang Bergoyang (Shake) Cepat */}
          <div className="animate-trolley-shake-reject">
            <ThreeDimensionalCart itemCount={0} />
          </div>
        </div>

        {/* Teks Pesan Sesuai Spesifikasi Persis */}
        <div className="mt-3 space-y-1 text-center">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Keranjang Belanja Kosong!
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium px-2">
            Troli masih kosong! Silakan tambahkan barang belanjaan terlebih dahulu.
          </p>
        </div>

        {/* Indikator auto-close countdown bar */}
        <div className="w-full bg-amber-100/80 h-1.5 rounded-full overflow-hidden mt-5">
          <div 
            className="bg-amber-500 h-full rounded-full w-full"
            style={{ animation: 'emptyProgressCountdown 1.8s linear forwards' }}
          />
        </div>
      </div>
    </div>
  );
}
