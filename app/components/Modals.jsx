'use client';

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
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
  const [date, setDate] = useState(currentDate || '24 Mei 2025');

  if (!isOpen) return null;

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
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
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
                  className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold border transition-colors flex items-center justify-between ${
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
            <label className="text-xs font-bold text-slate-800 mb-1 block">Tanggal Transaksi</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <button
            onClick={() => {
              playSuccessSound();
              onSaveStore(store, date);
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
                <span className="font-bold text-slate-800">{i.name} x {i.quantity || 1}</span>
                <span className="font-bold text-slate-900">Rp {((i.price || 0) * (i.quantity || 1)).toLocaleString('id-ID')}</span>
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
 * 5. Modal Konfirmasi Checkout
 */
export function CheckoutModal({ isOpen, onClose, totalSpent, storeName, itemCount, onConfirmCheckout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="w-full max-w-[380px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-slide-up text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
          <Receipt className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900">Selesai Belanja &amp; Simpan Struk?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Data belanjaan sebanyak {itemCount} barang di <strong>{storeName}</strong> akan diarsipkan ke Riwayat dan tersinkronisasi ke cloud.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Total Pengeluaran Kasir:</span>
          <span className="text-xl font-black text-emerald-800">
            Rp {totalSpent.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            type="button"
            onClick={() => { playTapSound(); onClose(); }}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              playSuccessSound();
              onConfirmCheckout();
              onClose();
            }}
            className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
          >
            Ya, Simpan Struk
          </button>
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

