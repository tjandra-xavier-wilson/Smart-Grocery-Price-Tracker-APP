'use client';

import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';
import { 
  parseDateComponents, 
  toYearMonthKey, 
  formatMonthYearLabel, 
  MONTH_NAMES_ID 
} from '../utils/date';

export default function HistoryScreen({
  historyList = [],
  onOpenReceiptDetail,
  onResetEmptySimulation,
  onRequestDeleteTrip,
  onRequestClearAllHistory
}) {
  const [period, setPeriod] = useState('Bulanan'); // 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan'
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' atau 'YYYY-MM' (contoh: '2026-10')

  // Default Mockup 5 dataset jika historyList kosong
  const defaultHistory = [
    {
      id: 'sesi-1',
      storeName: 'Lotte Mart Grocery - Puri Indah',
      totalSpent: 284500,
      savings: 65500,
      date: '24 Mei 2025',
      shopping_date: '2025-05-24',
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
      shopping_date: '2025-05-17',
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
      shopping_date: '2025-05-10',
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
      shopping_date: '2025-05-03',
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

  const sourceList = showEmptyState ? [] : (historyList.length > 0 ? historyList : defaultHistory);

  // 1. Ekstraksi daftar bulan unik yang tersedia dari data riwayat belanja
  const availableMonths = useMemo(() => {
    const set = new Set();
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    set.add(currentKey);

    sourceList.forEach((item) => {
      const dateVal = item.shopping_date || item.date;
      if (dateVal) {
        set.add(toYearMonthKey(dateVal));
      }
    });

    return Array.from(set).sort().reverse();
  }, [sourceList]);

  // 2. Filter riwayat transaksi berdasarkan Bulan Terpilih (Month-Year Picker)
  const displayList = useMemo(() => {
    if (selectedMonth === 'all') return sourceList;

    return sourceList.filter((item) => {
      const dateVal = item.shopping_date || item.date;
      return toYearMonthKey(dateVal) === selectedMonth;
    });
  }, [sourceList, selectedMonth]);

  // 3. Kalkulasi dinamis & reaktif total pengeluaran untuk bulan yang dipilih
  const { totalPeriodSpent, totalPeriodSavings, completedSessions, averagePerSession } = useMemo(() => {
    let spent = 0;
    let savings = 0;
    const count = displayList.length;

    displayList.forEach((s) => {
      spent += Number(s.totalSpent || s.total_spent) || 0;
      savings += Number(s.savings || s.total_savings) || 0;
    });

    const avg = count > 0 ? Math.round(spent / count) : 0;
    return {
      totalPeriodSpent: spent,
      totalPeriodSavings: savings,
      completedSessions: count,
      averagePerSession: avg
    };
  }, [displayList]);

  // Label nama bulan terpilih
  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'Seluruh Periode';
    return formatMonthYearLabel(selectedMonth);
  }, [selectedMonth]);

  // Export CSV Handler
  const handleExportCSV = () => {
    playTapSound();
    const rows = [
      ['ID Sesi', 'Supermarket', 'Tanggal', 'Waktu', 'Jumlah Item', 'Total Belanja (Rp)', 'Status Budget'],
      ...displayList.map(s => [
        s.id,
        `"${s.storeName || s.store_name}"`,
        s.date || s.shopping_date,
        s.time || '',
        s.itemCount || s.items_count || 1,
        s.totalSpent || s.total_spent,
        `"${s.statusBadge || 'Dalam Batas Budget'}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_belanja_sentinel_${selectedMonth}.csv`);
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
      {/* 1. FILTER BULAN & TAHUN (MONTH-YEAR PICKER) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-800">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Filter Bulan &amp; Tahun:</span>
          </div>

          {/* HTML5 Month Picker button */}
          <label className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors">
            <span>📅 Kalender Bulan</span>
            <input
              type="month"
              value={selectedMonth !== 'all' ? selectedMonth : ''}
              onChange={(e) => {
                if (e.target.value) {
                  playTapSound();
                  setSelectedMonth(e.target.value);
                }
              }}
              className="sr-only"
            />
          </label>
        </div>

        {/* Dropdown Pemilih Bulan Cepat */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => {
              playTapSound();
              setSelectedMonth(e.target.value);
            }}
            className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 py-2 px-3 rounded-xl border border-slate-200 outline-none cursor-pointer transition-colors"
          >
            <option value="all">Semua Bulan (Tampilkan Semua Transaksi)</option>
            {availableMonths.map((ymKey) => (
              <option key={ymKey} value={ymKey}>
                {formatMonthYearLabel(ymKey)}
              </option>
            ))}
          </select>

          {selectedMonth !== 'all' && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedMonth('all');
              }}
              className="shrink-0 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="Reset Filter"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Sub-row: Arsip Rekap & Simulasi Sesi Kosong */}
      <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-slate-600">
        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
          <span>☑️</span>
          <span>Menampilkan: {currentMonthLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setShowEmptyState(!showEmptyState);
          }}
          className="text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer"
        >
          <span>{showEmptyState ? 'Muat Data Sesi' : 'Simulasi Sesi Kosong'}</span>
        </button>
      </div>

      {/* 2. CARD AKUMULASI PENGELUARAN DINAMIS & REAKTIF */}
      <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-600 tracking-wider uppercase">
            {selectedMonth === 'all'
              ? 'TOTAL SELURUH BELANJA'
              : `TOTAL BELANJA BULAN ${currentMonthLabel.toUpperCase()}`}
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1 border border-emerald-200">
            <span>🥬 Hemat Rp {totalPeriodSavings.toLocaleString('id-ID')}</span>
          </span>
        </div>

        <div className="text-2xl font-black text-slate-900 tracking-tight">
          Rp {totalPeriodSpent.toLocaleString('id-ID')}
        </div>

        {/* Summary Stats */}
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
            Riwayat Sesi Belanja
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {displayList.length} sesi ditampilkan
          </span>
        </div>

        {displayList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">Belum Ada Riwayat Sesi</h4>
            <p className="text-[11px] text-slate-500">
              {selectedMonth === 'all' 
                ? 'Sesi belanja Anda yang telah selesai akan muncul secara otomatis di sini.'
                : `Tidak ada riwayat pembelanjaan untuk periode ${currentMonthLabel}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayList.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  playTapSound();
                  if (onOpenReceiptDetail) onOpenReceiptDetail(session);
                }}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    {/* Store Icon */}
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {session.storeName || session.store_name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {session.date || session.shopping_date} • {session.time || '10:00 WIB'} • {session.itemCount || session.items_count || 1} Item
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      Rp {Number(session.totalSpent || session.total_spent || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Action Group (Lihat Struk & Hapus Riwayat) */}
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
                    <span>{session.statusBadge || 'Tersimpan di Cloud'}</span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {/* Tombol Lihat Detail Struk */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        if (onOpenReceiptDetail) onOpenReceiptDetail(session);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Detail Struk"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {/* Tombol Hapus Riwayat Sesi Ini (Merah) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        if (onRequestDeleteTrip) onRequestDeleteTrip(session);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Riwayat Belanja Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol Hapus Seluruh Riwayat Belanja */}
        {displayList.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                if (onRequestClearAllHistory) onRequestClearAllHistory();
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Seluruh Riwayat Belanja</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. SYNC NOTICE KE DATABASE CLOUD */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1 py-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Tersinkronisasi Realtime ke Cloud Supabase &amp; Firestore</span>
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
