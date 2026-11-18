'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Filter,
  ArrowDown,
  ArrowUp,
  Equal,
  Minus
} from 'lucide-react';
import { playTapSound, playSuccessSound } from '../utils/sound';
import { 
  parseDateComponents, 
  toYearMonthKey, 
  formatMonthYearLabel, 
  MONTH_NAMES_ID 
} from '../utils/date';
import { 
  formatTxOptionLabel, 
  calculateTransactionComparison 
} from '../utils/comparison';

export default function HistoryScreen({
  historyList = [],
  onOpenReceiptDetail,
  onRequestDeleteTrip,
  onRequestClearAllHistory
}) {
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' atau 'YYYY-MM' (contoh: '2026-10')

  // 1. Deduplikasi array transaksi berdasarkan ID unik (Single Source of Truth pengaman render)
  // Mencegah transaksi yang sama dirender lebih dari satu kali dan membersihkan ghost duplicate sesi lokal
  const uniqueHistoryList = useMemo(() => {
    const rawData = historyList || [];
    // A. Deduplikasi ID persis menggunakan Map
    const byId = Array.from(new Map(rawData.map(item => [item?.id || Math.random(), item])).values());

    // B. Cegah ghost duplicate antara sesi lokal (sesi-*) vs uuid cloud dengan store, total, dan tanggal identik
    const cloudTrips = byId.filter(item => !String(item?.id || '').startsWith('sesi-'));
    const cleanList = byId.filter(item => {
      if (String(item?.id || '').startsWith('sesi-')) {
        const itemStore = item.storeName || item.store_name;
        const itemSpent = Number(item.totalSpent || item.total_spent);
        const itemDate = item.shopping_date || item.date;
        const isDuplicateOfCloud = cloudTrips.some(c => 
          (c.storeName || c.store_name) === itemStore &&
          Number(c.totalSpent || c.total_spent) === itemSpent &&
          (c.shopping_date === itemDate || c.date === itemDate)
        );
        if (isDuplicateOfCloud) return false;
      }
      return true;
    });

    return cleanList;
  }, [historyList]);

  // 1b. State & Logika untuk Fitur Analitik "Perbandingan Pengeluaran Antar Transaksi" (Sistem Direct Card Selection)
  // isSelectingFor: melacak slot mana yang sedang menunggu input ('A' | 'B' | null, default 'A')
  const [isSelectingFor, setIsSelectingFor] = useState('A');
  // selectedTxA dan selectedTxB menyimpan seluruh objek transaksi yang dipilih
  const [selectedTxA, setSelectedTxA] = useState(null);
  const [selectedTxB, setSelectedTxB] = useState(null);

  // historyItems: Single source of truth untuk validasi riwayat belanja
  const historyItems = uniqueHistoryList || historyList || [];

  // Sinkronisasi & Reset Ghost Data: jika data transaksi A atau B sudah dihapus dari database atau riwayat kosong
  useEffect(() => {
    if (!historyItems || historyItems.length === 0) {
      setSelectedTxA(null);
      setSelectedTxB(null);
      setIsSelectingFor('A');
      return;
    }
    if (selectedTxA && !historyItems.some(item => String(item.id) === String(selectedTxA.id))) {
      setSelectedTxA(null);
      setIsSelectingFor('A');
    }
    if (selectedTxB && !historyItems.some(item => String(item.id) === String(selectedTxB.id))) {
      setSelectedTxB(null);
      setIsSelectingFor(selectedTxA ? 'B' : 'A');
    }
  }, [historyItems, selectedTxA, selectedTxB]);

  // Handler reset pilihan: mengosongkan pilihan dan mengembalikan isSelectingFor ke 'A'
  const handleResetComparison = () => {
    playTapSound();
    setSelectedTxA(null);
    setSelectedTxB(null);
    setIsSelectingFor('A');
  };

  // Handler penghapusan transaksi individu dengan State Reset pengaman
  const handleDeleteTransaction = (session) => {
    if ((selectedTxA && String(selectedTxA.id) === String(session?.id)) ||
        (selectedTxB && String(selectedTxB.id) === String(session?.id))) {
      setSelectedTxA(null);
      setSelectedTxB(null);
      setIsSelectingFor('A');
    }
    if (onRequestDeleteTrip) {
      onRequestDeleteTrip(session);
    }
  };

  // Handler penghapusan seluruh riwayat belanja dengan State Reset pengaman
  const handleClearAllHistory = () => {
    setSelectedTxA(null);
    setSelectedTxB(null);
    setIsSelectingFor('A');
    if (onRequestClearAllHistory) {
      onRequestClearAllHistory();
    }
  };

  // Handler pemilihan kartu langsung dari daftar sesi belanja
  const handleSelectSession = (session) => {
    playTapSound();
    if (isSelectingFor === 'A') {
      setSelectedTxA(session);
      setIsSelectingFor('B');
    } else if (isSelectingFor === 'B') {
      setSelectedTxB(session);
      setIsSelectingFor(null);
    } else {
      // Jika mode pemilihan sedang nonaktif, klik kartu membuka detail struk
      if (onOpenReceiptDetail) onOpenReceiptDetail(session);
    }
  };

  const totalA = useMemo(() => {
    return selectedTxA ? Number(selectedTxA.totalSpent || selectedTxA.total_spent || 0) : 0;
  }, [selectedTxA]);

  const totalB = useMemo(() => {
    return selectedTxB ? Number(selectedTxB.totalSpent || selectedTxB.total_spent || 0) : 0;
  }, [selectedTxB]);

  const hasBothSelected = Boolean(selectedTxA && selectedTxB);

  // Kalkulasi analitik perbandingan pengeluaran (reaktif terhadap perubahan kartu A dan B)
  const comparisonResult = useMemo(() => {
    return calculateTransactionComparison(totalA, totalB, hasBothSelected);
  }, [totalA, totalB, hasBothSelected]);

  // Warna badge, lingkaran panah, dan ikon dinamis
  const comparisonArrow = useMemo(() => {
    if (comparisonResult.status === 'cheaper') {
      return {
        bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <ArrowDown className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
      };
    }
    if (comparisonResult.status === 'expensive') {
      return {
        bg: 'bg-rose-100 text-rose-700 border-rose-200',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <ArrowUp className="w-5 h-5 text-rose-700 stroke-[2.5]" />
      };
    }
    if (comparisonResult.status === 'equal') {
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-300',
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: <Equal className="w-5 h-5 text-slate-600 stroke-[2.5]" />
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-400 border-slate-200',
      badge: 'bg-slate-100 text-slate-500 border-slate-200',
      icon: <Minus className="w-5 h-5 text-slate-400 stroke-[2.5]" />
    };
  }, [comparisonResult.status]);

  // 2. Ekstraksi daftar bulan unik secara DINAMIS HANYA dari data riwayat belanja yang benar-benar ada
  // DILARANG menambahkan bulan hardcoded / dummy jika transaksi pada bulan tersebut tidak ada!
  const availableMonths = useMemo(() => {
    const set = new Set();
    uniqueHistoryList.forEach((item) => {
      const dateVal = item.shopping_date || item.date;
      if (dateVal) {
        const ym = toYearMonthKey(dateVal);
        if (ym && ym.length === 7) {
          set.add(ym);
        }
      }
    });
    return Array.from(set).sort().reverse();
  }, [uniqueHistoryList]);

  // Jika bulan yang dipilih sudah tidak ada dalam daftar (misal setelah riwayat dihapus), reset ke 'all'
  useEffect(() => {
    if (selectedMonth !== 'all' && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth('all');
    }
  }, [availableMonths, selectedMonth]);

  // 3. Filter riwayat transaksi berdasarkan Bulan Terpilih (Month-Year Picker)
  // Murni 100% menggunakan data dinamis (Supabase / LocalStorage), tanpa data statis tiruan
  const displayList = useMemo(() => {
    if (selectedMonth === 'all') return uniqueHistoryList;

    return uniqueHistoryList.filter((item) => {
      const dateVal = item.shopping_date || item.date;
      return toYearMonthKey(dateVal) === selectedMonth;
    });
  }, [uniqueHistoryList, selectedMonth]);

  // 3. Kalkulasi dinamis & reaktif total pengeluaran untuk bulan yang dipilih
  // Nilai ini otomatis berkurang saat transaksi dihapus
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
      {/* 1. FILTER BULAN & TAHUN (MONTH-YEAR PICKER DINAMIS) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-800">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Filter Bulan &amp; Tahun:</span>
          </div>

          {/* HTML5 Native Month Picker button */}
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

        {/* Dropdown Pemilih Bulan Dinamis (HANYA bulan yang memiliki riwayat transaksi nyata) */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => {
              playTapSound();
              setSelectedMonth(e.target.value);
            }}
            className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 py-2 px-3 rounded-xl border border-slate-200 outline-none cursor-pointer transition-colors"
          >
            <option value="all">
              {availableMonths.length === 0
                ? 'Semua Bulan (Belum Ada Riwayat Transaksi)'
                : `Semua Bulan (${uniqueHistoryList.length} Transaksi Tersimpan)`}
            </option>
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

      {/* 2. FITUR PERBANDINGAN PENGELUARAN ANTAR TRANSAKSI (SISTEM DIRECT CARD SELECTION - PERSISTENT EMPTY STATE) */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200/90 space-y-3 perbandingan-transaksi-container">
        {/* Header Card dengan Tombol Ulangi Pemilihan (Reset) & Badge Status */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
              Perbandingan Transaksi
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
              {historyItems.length === 0
                ? 'Belum ada data untuk dibandingkan (Minimal 2 transaksi)'
                : (isSelectingFor === 'A' && '👉 Klik kartu pada daftar di bawah untuk memilih Transaksi A')
                || (isSelectingFor === 'B' && '👉 Transaksi A terpilih! Sekarang klik kartu untuk Transaksi B')
                || (!isSelectingFor && hasBothSelected && 'Hasil perbandingan 2 sesi belanja')
                || (!isSelectingFor && !hasBothSelected && 'Klik slot di bawah untuk memilih transaksi')}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {(selectedTxA || selectedTxB || isSelectingFor !== 'A') && (
              <button
                type="button"
                onClick={handleResetComparison}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200"
                title="Ulangi Pemilihan"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Ulangi Pemilihan</span>
              </button>
            )}

            {hasBothSelected && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border flex items-center space-x-1 ${comparisonArrow.badge}`}>
                <span>{comparisonResult.badgeText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Area Seleksi Kartu Langsung (Menggantikan Dropdown Select) */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Slot Transaksi A */}
          {selectedTxA ? (
            <div
              onClick={() => {
                playTapSound();
                setIsSelectingFor('A');
              }}
              className={`rounded-xl border p-2.5 text-left cursor-pointer transition-all relative ${
                isSelectingFor === 'A'
                  ? 'border-2 border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200/80 shadow-xs'
                  : 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-extrabold uppercase tracking-wide">
                  Transaksi A
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">
                  {isSelectingFor === 'A' ? 'Memilih...' : 'Ubah ↺'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                {selectedTxA.storeName || selectedTxA.store_name || 'Toko'}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                {selectedTxA.date || selectedTxA.shopping_date || 'Tanggal'}
              </p>
              <p className="text-xs font-black text-emerald-800 mt-0.5 tabular-nums">
                Rp {Number(selectedTxA.totalSpent || selectedTxA.total_spent || 0).toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <div
              onClick={() => {
                if (historyItems.length === 0) return;
                playTapSound();
                setIsSelectingFor('A');
              }}
              className={`rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                historyItems.length === 0
                  ? 'border-slate-200 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-75'
                  : (isSelectingFor === 'A'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200 shadow-xs cursor-pointer'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 cursor-pointer')
              }`}
            >
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  historyItems.length === 0
                    ? 'bg-slate-300'
                    : (isSelectingFor === 'A' ? 'bg-emerald-600 animate-ping' : 'bg-slate-400')
                }`} />
                <span className={`text-[11px] font-bold ${historyItems.length === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                  Transaksi A
                </span>
              </div>
              <p className={`text-[11px] leading-snug ${
                historyItems.length === 0
                  ? 'text-slate-400 font-normal'
                  : (isSelectingFor === 'A' ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium')
              }`}>
                {historyItems.length === 0
                  ? 'Belum ada riwayat transaksi'
                  : (isSelectingFor === 'A' ? '👇 Klik kartu di bawah' : 'Pilih Transaksi A di bawah')}
              </p>
            </div>
          )}

          {/* Slot Transaksi B */}
          {selectedTxB ? (
            <div
              onClick={() => {
                playTapSound();
                setIsSelectingFor('B');
              }}
              className={`rounded-xl border p-2.5 text-left cursor-pointer transition-all relative ${
                isSelectingFor === 'B'
                  ? 'border-2 border-blue-500 bg-blue-50/50 ring-2 ring-blue-200/80 shadow-xs'
                  : 'border-blue-300 bg-blue-50/20 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[9px] font-extrabold uppercase tracking-wide">
                  Transaksi B
                </span>
                <span className="text-[10px] text-blue-700 font-bold">
                  {isSelectingFor === 'B' ? 'Memilih...' : 'Ubah ↺'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                {selectedTxB.storeName || selectedTxB.store_name || 'Toko'}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                {selectedTxB.date || selectedTxB.shopping_date || 'Tanggal'}
              </p>
              <p className="text-xs font-black text-blue-800 mt-0.5 tabular-nums">
                Rp {Number(selectedTxB.totalSpent || selectedTxB.total_spent || 0).toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <div
              onClick={() => {
                if (historyItems.length === 0) return;
                playTapSound();
                setIsSelectingFor('B');
              }}
              className={`rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                historyItems.length === 0
                  ? 'border-slate-200 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-75'
                  : (isSelectingFor === 'B'
                      ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-200 shadow-xs cursor-pointer'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 cursor-pointer')
              }`}
            >
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  historyItems.length === 0
                    ? 'bg-slate-300'
                    : (isSelectingFor === 'B' ? 'bg-blue-600 animate-ping' : 'bg-slate-400')
                }`} />
                <span className={`text-[11px] font-bold ${historyItems.length === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                  Transaksi B
                </span>
              </div>
              <p className={`text-[11px] leading-snug ${
                historyItems.length === 0
                  ? 'text-slate-400 font-normal'
                  : (isSelectingFor === 'B' ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium')
              }`}>
                {historyItems.length === 0
                  ? 'Belum ada riwayat transaksi'
                  : (isSelectingFor === 'B' ? '👇 Klik kartu di bawah' : 'Pilih Transaksi B di bawah')}
              </p>
            </div>
          )}
        </div>

        {/* Tampilan Hasil Perbandingan (Hanya muncul jika Transaksi A & B sudah terpilih) */}
        {hasBothSelected ? (
          <>
            {/* Tampilan Nominal (Visualisasi Utama) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-slate-100 flex justify-between items-center">
              {/* Sisi Kiri: Transaksi A */}
              <div className="flex-1 text-left min-w-0 pr-2">
                <span className="block text-[11px] font-semibold text-slate-500 truncate">
                  Transaksi A
                </span>
                <span className="block text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate tabular-nums">
                  Rp {totalA.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Tengah: Ikon Lingkaran Panah */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mx-2 border shadow-2xs transition-all ${comparisonArrow.bg}`}>
                {comparisonArrow.icon}
              </div>

              {/* Sisi Kanan: Transaksi B */}
              <div className="flex-1 text-right min-w-0 pl-2">
                <span className="block text-[11px] font-semibold text-slate-500 truncate">
                  Transaksi B
                </span>
                <span className="block text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate tabular-nums">
                  Rp {totalB.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Teks Kesimpulan (Footer) */}
            <div className="text-[11.5px] text-slate-600 leading-snug pt-0.5">
              {comparisonResult.status === 'cheaper' && (
                <span>
                  Hebat! Transaksi A lebih hemat <strong className="font-bold text-emerald-700">-Rp {comparisonResult.formattedAbsDiff}</strong> ({comparisonResult.percent.toFixed(1)}%) dibanding Transaksi B.
                </span>
              )}
              {comparisonResult.status === 'expensive' && (
                <span>
                  Perhatian! Transaksi A lebih boros <strong className="font-bold text-rose-700">+Rp {comparisonResult.formattedAbsDiff}</strong> (+{comparisonResult.percent.toFixed(1)}%) dibanding Transaksi B.
                </span>
              )}
              {comparisonResult.status === 'equal' && (
                <span>
                  Pengeluaran Transaksi A sama dengan Transaksi B (<strong className="font-bold text-slate-800">Rp {totalA.toLocaleString('id-ID')}</strong>).
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-center">
            <p className="text-[11.5px] text-slate-500">
              {historyItems.length === 0
                ? 'Belum ada riwayat transaksi belanja untuk dibandingkan.'
                : (isSelectingFor === 'A' && 'Silakan pilih sesi belanja pertama sebagai Transaksi A dari daftar di bawah.')
                || (isSelectingFor === 'B' && 'Transaksi A berhasil dipilih! Silakan klik sesi belanja kedua sebagai Transaksi B.')
                || (!isSelectingFor && 'Pilih 2 transaksi untuk melihat analisis perbandingan nominal.')}
            </p>
          </div>
        )}
      </div>

      {/* Sub-row: Indikator Periode Aktif */}
      <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-slate-600">
        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
          <span>☑️</span>
          <span>Periode: {currentMonthLabel}</span>
        </div>
        <span className="text-slate-400 font-medium">
          {displayList.length} sesi ditemukan
        </span>
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

      {/* 3. DAFTAR RIWAYAT TRANSAKSI SESI (100% DINAMIS) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs">
          <h3 className="font-extrabold text-slate-900 tracking-tight">
            Daftar Sesi Pembelanjaan
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {displayList.length} sesi
          </span>
        </div>

        {displayList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">Belum Ada Riwayat Sesi</h4>
            <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto">
              {selectedMonth === 'all' 
                ? 'Sesi belanja Anda yang telah selesai akan muncul secara otomatis di sini.'
                : `Tidak ada riwayat pembelanjaan untuk periode ${currentMonthLabel}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayList.map((session) => {
              const isSelectedA = selectedTxA && String(selectedTxA.id) === String(session.id);
              const isSelectedB = selectedTxB && String(selectedTxB.id) === String(session.id);

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer hover:bg-gray-50 relative group ${
                    isSelectedA
                      ? 'border-2 border-emerald-500 ring-2 ring-emerald-200 shadow-sm bg-emerald-50/15'
                      : isSelectedB
                      ? 'border-2 border-blue-500 ring-2 ring-blue-200 shadow-sm bg-blue-50/15'
                      : 'border-slate-200/90 shadow-2xs hover:border-emerald-300'
                  }`}
                >
                  {/* Badge Indikator Terpilih di Sudut Kiri Atas (Sesuai Lingkaran Merah User di Gambar 2) */}
                  {isSelectedA && (
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs flex items-center space-x-1 z-10">
                      <span>✓</span>
                      <span>Terpilih sebagai A</span>
                    </div>
                  )}
                  {isSelectedB && (
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-xs flex items-center space-x-1 z-10">
                      <span>✓</span>
                      <span>Terpilih sebagai B</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      {/* Store Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelectedA 
                          ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                          : isSelectedB 
                          ? 'bg-blue-100 border-blue-200 text-blue-700' 
                          : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>
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
                    <span>{session.statusBadge ? (session.statusBadge.includes('Cloud') ? 'Transaksi Sukses' : session.statusBadge) : 'Transaksi Sukses'}</span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {/* Tombol Lihat Struk */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        if (onOpenReceiptDetail) onOpenReceiptDetail(session);
                      }}
                      className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer"
                      title="Lihat Struk"
                    >
                      <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Lihat Struk</span>
                    </button>

                    {/* Tombol Hapus Riwayat Sesi Ini (Merah) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        handleDeleteTransaction(session);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Riwayat Belanja Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Tombol Hapus Seluruh Riwayat Belanja */}
        {displayList.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                handleClearAllHistory();
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Seluruh Riwayat Belanja</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. SYNC NOTICE */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1 py-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Riwayat belanja tersimpan aman &amp; otomatis</span>
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
