'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Receipt, 
  Download, 
  FileText, 
  CloudCheck, 
  RotateCcw, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';

export default function HistoryScreen({
  historyList = [],
  onOpenReceiptDetail,
  onResetEmptySimulation
}) {
  const [period, setPeriod] = useState('Harian'); // 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan'
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Default Mockup 5 dataset if empty
  const defaultHistory = [
    {
      id: 'sesi-1',
      storeName: 'Lotte Mart Grocery - Puri Indah',
      totalSpent: 284500,
      savings: 65500,
      date: '24 Mei 2025',
      time: '09:42 WIB',
      itemCount: 9,
      statusTier: 'safe',
      statusBadge: 'Dalam Batas Budget (Hemat Rp 65.500)',
      iconType: 'cart',
      items: [
        { name: 'Beras Premium Rojolele 5kg', price: 74000, quantity: 1, unit: 'karung' },
        { name: 'Minyak Goreng Sania 2L', price: 33500, quantity: 2, unit: 'pouch' },
        { name: 'Sabun Mandi Dettol Reff 450ml', price: 28500, quantity: 2, unit: 'pouch' },
        { name: 'Susu UHT Full Cream Greenfields 1L', price: 21500, quantity: 4, unit: 'kotak' }
      ]
    },
    {
      id: 'sesi-2',
      storeName: 'Super Indo - Pesanggrahan',
      totalSpent: 342000,
      savings: 45000,
      date: '17 Mei 2025',
      time: '16:15 WIB',
      itemCount: 14,
      statusTier: 'warning',
      statusBadge: 'Mendekati Limit 98%',
      iconType: 'store',
      items: [
        { name: 'Daging Sapi Segar 500g', price: 72000, quantity: 2, unit: 'pack' },
        { name: 'Telur Ayam 1kg', price: 32000, quantity: 3, unit: 'kg' },
        { name: 'Bumbu Dapur Lengkap', price: 25000, quantity: 2, unit: 'pack' }
      ]
    },
    {
      id: 'sesi-3',
      storeName: 'Hypermart - Puri Mall',
      totalSpent: 189000,
      savings: 38000,
      date: '10 Mei 2025',
      time: '11:30 WIB',
      itemCount: 6,
      statusTier: 'safe',
      statusBadge: 'Aman 54%',
      iconType: 'bag',
      items: [
        { name: 'Sabun Cuci Piring 800ml', price: 22000, quantity: 2, unit: 'pouch' },
        { name: 'Shampoo Botol 340ml', price: 45000, quantity: 1, unit: 'botol' },
        { name: 'Pasta Gigi Herbal', price: 18000, quantity: 2, unit: 'tube' }
      ]
    },
    {
      id: 'sesi-4',
      storeName: 'Indogrosir Daan Mogot',
      totalSpent: 604500,
      savings: 66500,
      date: '03 Mei 2025',
      time: '14:20 WIB',
      itemCount: 22,
      statusTier: 'safe',
      statusBadge: 'Dalam Batas Budget (Hemat Rp 66.500)',
      iconType: 'store',
      items: [
        { name: 'Mie Instan Dus 40pcs', price: 115000, quantity: 2, unit: 'dus' },
        { name: 'Minyak Goreng Jerigen 5L', price: 86000, quantity: 2, unit: 'jerigen' }
      ]
    }
  ];

  const displayList = showEmptyState ? [] : (historyList.length > 0 ? historyList : defaultHistory);

  // Statistics calculation for period
  const totalPeriodSpent = 1420000;
  const totalPeriodSavings = 215000;
  const completedSessions = 4;
  const averagePerSession = 355000;

  // Export CSV Handler
  const handleExportCSV = () => {
    playTapSound();
    const rows = [
      ['ID Sesi', 'Supermarket', 'Tanggal', 'Waktu', 'Jumlah Item', 'Total Belanja (Rp)', 'Status Budget'],
      ...displayList.map(s => [
        s.id,
        `"${s.storeName}"`,
        s.date,
        s.time || '',
        s.itemCount,
        s.totalSpent,
        `"${s.statusBadge || 'Dalam Batas Budget'}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_belanja_sentinel_${period.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessSound();
  };

  // PDF / Print Handler
  const handlePrintPDF = () => {
    playTapSound();
    window.print();
  };

  return (
    <div className="pb-36 bg-slate-50 min-h-full px-4 pt-3 space-y-3.5">
      {/* 1. FILTER PERIODE TABS */}
      <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-4 gap-1 text-xs font-bold text-slate-600">
        {['Harian', 'Mingguan', 'Bulanan', 'Tahunan'].map((tab) => {
          const isActive = period === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                playTapSound();
                setPeriod(tab);
              }}
              className={`py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Sub-row: Arsip Rekap & Simulasi Sesi Kosong */}
      <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-slate-600">
        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
          <span>☑️</span>
          <span>Arsip Rekap Transaksi</span>
        </div>
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setShowEmptyState(!showEmptyState);
          }}
          className="text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-lg flex items-center space-x-1"
        >
          <span>{showEmptyState ? 'Muat Data Sesi' : 'Simulasi Sesi Kosong'}</span>
        </button>
      </div>

      {/* 2. CARD AKUMULASI PENGELUARAN */}
      <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-600 tracking-wider uppercase">
            TOTAL BELANJA BULAN MEI
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1 border border-emerald-200">
            <span>🥬 Hemat Rp {totalPeriodSavings.toLocaleString('id-ID')}</span>
          </span>
        </div>

        <div className="text-2xl font-black text-slate-900 tracking-tight">
          Rp {totalPeriodSpent.toLocaleString('id-ID')}
        </div>

        {/* 2 Summary Stats */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold">
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Frekuensi Belanja</span>
            </div>
            <div className="text-xs font-extrabold text-slate-800 mt-0.5">
              {completedSessions} Sesi Selesai
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              <span>Rata-rata Sesi</span>
            </div>
            <div className="text-xs font-extrabold text-slate-800 mt-0.5">
              Rp {averagePerSession.toLocaleString('id-ID')}<span className="text-[10px] text-slate-400 font-normal">/sesi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIWAYAT SESI TERAKHIR */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs">
          <h3 className="font-extrabold text-slate-900 tracking-tight">
            Riwayat Sesi Terakhir
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {displayList.length} dari 4 ditampilkan
          </span>
        </div>

        {displayList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">Belum Ada Riwayat Sesi</h4>
            <p className="text-[11px] text-slate-500">
              Sesi belanja Anda yang telah selesai akan muncul secara otomatis di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayList.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  playTapSound();
                  if (onOpenReceiptDetail) onOpenReceiptDetail(session);
                }}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    {/* Store Icon */}
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {session.storeName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {session.date} • {session.time} • {session.itemCount} Item
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      Rp {session.totalSpent.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Receipt Action */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                    session.statusTier === 'warning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-sky-50 text-sky-800 border border-sky-100'
                  }`}>
                    {session.statusTier === 'warning' ? (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    ) : (
                      <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                    )}
                    <span>{session.statusBadge}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapSound();
                      if (onOpenReceiptDetail) onOpenReceiptDetail(session);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Lihat Detail Struk"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SYNC NOTICE KE FIRESTORE DATABASE */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1 py-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Tersinkronisasi 2 detik lalu ke Firestore Database</span>
        </div>
        <CloudCheck className="w-3.5 h-3.5 text-emerald-700" />
      </div>

      {/* 5. ACTION BUTTONS: EXPORT CSV & LAPORAN PDF */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleExportCSV}
          className="py-3 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          onClick={handlePrintPDF}
          className="py-3 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-amber-700" />
          <span>Laporan PDF</span>
        </button>
      </div>
    </div>
  );
}
