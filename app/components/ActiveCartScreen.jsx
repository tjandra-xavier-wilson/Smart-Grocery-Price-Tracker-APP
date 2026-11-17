'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Scissors,
  ShoppingBag,
  Carrot,
  Apple,
  Fish,
  Cookie,
  Coffee,
  Brush,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { playTapSound, playSuccessSound, playWarningBeep } from '../utils/sound';
import { toISODateString, toIndoDisplayDate } from '../utils/date';
import { getProductEmoji, ProductEmojiBox, PriceFluctuationBadge } from '../utils/emoji';

export default function ActiveCartScreen({
  cartItems = [],
  budgetLimit = 350000,
  currentStore = 'Lotte Mart Grocery - Puri Indah',
  transactionDate = '24 Mei 2025',
  onDateChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenBudgetModal,
  onOpenStoreModal,
  onOpenCheckout,
  onOpenBarcodeModal,
  onCutSecondaryItems,
  onLoadMockupOverbudget,
  onLoadMockupNormal,
  onAddToCart
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  // 1. Menu Kategori Horizontal (Scrollable Carousel sesuai urutan spesifikasi)
  const CART_CATEGORIES = [
    { id: 'all', name: 'Semua', icon: Sparkles },
    { id: 'sembako', name: 'Bahan Pokok', icon: ShoppingBag },
    { id: 'sayur', name: 'Sayuran Segar', icon: Carrot },
    { id: 'buah', name: 'Buah-buahan', icon: Apple },
    { id: 'daging', name: 'Daging dan Lauk', icon: Fish },
    { id: 'camilan', name: 'Camilan', icon: Cookie },
    { id: 'minuman', name: 'Minuman', icon: Coffee },
    { id: 'kebersihan', name: 'Peralatan Kebersihan', icon: Brush }
  ];

  // 2. Data Katalog Rekomendasi Belanja Berdasarkan Kategori Lengkap (100% Emoji, Bebas Tag <img>)
  // Skenario Uji 4 (SRS F-04): 3 item pertama sembako persis Beras 5kg, Telur Ayam Ras 1kg, Garam 500g
  const RECOMMENDED_PRODUCTS_BY_CATEGORY = {
    sembako: {
      categoryName: 'Bahan Pokok',
      iconEmoji: '🌾',
      items: [
        {
          id: 'rec-sembako-1',
          name: 'Beras 5kg',
          category: 'Bahan Pokok',
          unit: '5kg',
          price: 74000,
          lastMonthPrice: 68000,
          description: 'Beras putih pulen berkualitas tanpa pemutih'
        },
        {
          id: 'rec-sembako-2',
          name: 'Telur Ayam Ras 1kg',
          category: 'Bahan Pokok',
          unit: '1 kg',
          price: 28000,
          lastMonthPrice: 32000,
          description: 'Telur ayam ras segar kaya protein hewani'
        },
        {
          id: 'rec-sembako-3',
          name: 'Garam 500g',
          category: 'Bahan Pokok',
          unit: '500g',
          price: 5000,
          lastMonthPrice: 5000,
          description: 'Garam dapur beryodium murni standar SNI'
        },
        {
          id: 'rec-sembako-4',
          name: 'Minyak Goreng Sawit Murni',
          category: 'Bahan Pokok',
          unit: '2L',
          price: 38500,
          lastMonthPrice: 35000,
          description: 'Jernih tahan panas dengan vitamin E'
        },
        {
          id: 'rec-sembako-5',
          name: 'Gula Pasir Kristal Putih',
          category: 'Bahan Pokok',
          unit: '1 kg',
          price: 17500,
          lastMonthPrice: 17500,
          description: 'Gula tebu butiran bersih standar SNI'
        }
      ]
    },
    sayur: {
      categoryName: 'Sayuran Segar',
      iconEmoji: '🥕',
      items: [
        {
          id: 'rec-sayur-1',
          name: 'Wortel Berastagi Segar',
          category: 'Sayuran Segar',
          unit: '500g',
          price: 9500,
          lastMonthPrice: 8500,
          description: 'Manis renyah kaya beta-karoten'
        },
        {
          id: 'rec-sayur-2',
          name: 'Bayam Hijau Hidroponik',
          category: 'Sayuran Segar',
          unit: '1 ikat',
          price: 6000,
          lastMonthPrice: 6000,
          description: 'Segar bebas pestisida kaya zat besi'
        },
        {
          id: 'rec-sayur-3',
          name: 'Brokoli Hijau Organik',
          category: 'Sayuran Segar',
          unit: '500g',
          price: 16000,
          lastMonthPrice: 17500,
          description: 'Brokoli segar kaya antioksidan sehat'
        }
      ]
    },
    buah: {
      categoryName: 'Buah-buahan',
      iconEmoji: '🍎',
      items: [
        {
          id: 'rec-buah-1',
          name: 'Apel Fuji Manis Segar',
          category: 'Buah-buahan',
          unit: '1 kg',
          price: 34000,
          lastMonthPrice: 38000,
          description: 'Renyah manis kaya serat & vitamin alami'
        },
        {
          id: 'rec-buah-2',
          name: 'Pisang Cavendish Super',
          category: 'Buah-buahan',
          unit: '1 sisir',
          price: 22000,
          lastMonthPrice: 20000,
          description: 'Manis legit sumber energi harian'
        },
        {
          id: 'rec-buah-3',
          name: 'Jeruk Medan Manis',
          category: 'Buah-buahan',
          unit: '1 kg',
          price: 26000,
          lastMonthPrice: 26000,
          description: 'Bulir berair manis menyegarkan'
        }
      ]
    },
    daging: {
      categoryName: 'Daging dan Lauk',
      iconEmoji: '🥩',
      items: [
        {
          id: 'rec-daging-1',
          name: 'Fillet Dada Ayam Broiler',
          category: 'Daging dan Lauk',
          unit: '1 kg',
          price: 46000,
          lastMonthPrice: 50000,
          description: 'Dada ayam tanpa tulang tinggi protein'
        },
        {
          id: 'rec-daging-2',
          name: 'Daging Sapi Paha Segar',
          category: 'Daging dan Lauk',
          unit: '500g',
          price: 68000,
          lastMonthPrice: 65000,
          description: 'Sapi lokal empuk rendah lemak'
        },
        {
          id: 'rec-daging-3',
          name: 'Ikan Salmon Fillet Fresh',
          category: 'Daging dan Lauk',
          unit: '200g',
          price: 55000,
          lastMonthPrice: 55000,
          description: 'Kaya Omega-3 untuk kesehatan jantung'
        }
      ]
    },
    camilan: {
      categoryName: 'Camilan',
      iconEmoji: '🍪',
      items: [
        {
          id: 'rec-camilan-1',
          name: 'Biskuit Roma Kelapa Gurih',
          category: 'Camilan',
          unit: '300g',
          price: 11500,
          lastMonthPrice: 11500,
          description: 'Biskuit kelapa renyah kaya vitamin'
        },
        {
          id: 'rec-camilan-2',
          name: 'Chitato Keripik Sapi Panggang',
          category: 'Camilan',
          unit: '68g',
          price: 12000,
          lastMonthPrice: 11000,
          description: 'Keripik kentang bergelombang gurih'
        },
        {
          id: 'rec-camilan-3',
          name: 'Oreo Biskuit Krim Vanila',
          category: 'Camilan',
          unit: '133g',
          price: 9800,
          lastMonthPrice: 10500,
          description: 'Biskuit cokelat sandwich krim lezat'
        }
      ]
    },
    minuman: {
      categoryName: 'Minuman',
      iconEmoji: '🧃',
      items: [
        {
          id: 'rec-minuman-1',
          name: 'Susu UHT Full Cream Ultra Milk',
          category: 'Minuman',
          unit: '1L',
          price: 19500,
          lastMonthPrice: 21000,
          description: 'Susu sapi murni kaya kalsium alami'
        },
        {
          id: 'rec-minuman-2',
          name: 'Kopi Kapal Api Special Mix',
          category: 'Minuman',
          unit: '10 sachet',
          price: 14500,
          lastMonthPrice: 14500,
          description: 'Kopi tubruk gula mantap harum'
        },
        {
          id: 'rec-minuman-3',
          name: 'Teh Melati Wangi Segar Kotak',
          category: 'Minuman',
          unit: '1L',
          price: 9500,
          lastMonthPrice: 9500,
          description: 'Seduhan daun teh melati asli alami'
        }
      ]
    },
    kebersihan: {
      categoryName: 'Peralatan Kebersihan',
      iconEmoji: '🧼',
      items: [
        {
          id: 'rec-kebersihan-1',
          name: 'Sabun Mandi Detoff 400ml',
          category: 'Peralatan Kebersihan',
          unit: '400ml',
          price: 26500,
          lastMonthPrice: 29000,
          description: 'Sabun cair antiseptik perlindungan kuman'
        },
        {
          id: 'rec-kebersihan-2',
          name: 'Deterjen Cair Rinso Konsentrat',
          category: 'Peralatan Kebersihan',
          unit: '750ml',
          price: 21500,
          lastMonthPrice: 20000,
          description: 'Hilangkan noda membandel 1x kucek'
        },
        {
          id: 'rec-kebersihan-3',
          name: 'Sabun Cuci Piring Jeruk Nipis',
          category: 'Peralatan Kebersihan',
          unit: '700ml',
          price: 15500,
          lastMonthPrice: 15500,
          description: 'Bersihkan lemak membandel seketika'
        }
      ]
    }
  };

  const handleAddRecommended = (prod) => {
    playTapSound();
    if (onAddToCart) {
      onAddToCart({
        id: 'rec-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: prod.name,
        price: prod.price,
        originalPrice: prod.lastMonthPrice !== undefined ? prod.lastMonthPrice : prod.price,
        category: prod.category || 'Bahan Pokok',
        unit: prod.unit || 'pcs',
        quantity: 1,
        isSecondary: false,
        lastMonthPrice: prod.lastMonthPrice !== undefined ? prod.lastMonthPrice : prod.price
      });
    }
  };

  // Render Product Card (100% Emoji Container w-16 h-16 & Price Fluctuation Badge)
  const renderProductCard = (prod) => (
    <div 
      key={prod.id}
      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-red-50/30 hover:border-red-200 flex items-center justify-between gap-3 transition-all group"
    >
      {/* Bagian Kiri: Container Emoji Kotak Bersudut Tumpul (w-16 h-16 bg-gray-100 rounded-md) */}
      <ProductEmojiBox name={prod.name} category={prod.category} />

      {/* Bagian Tengah: Judul produk, Deskripsi singkat, Kategori & Fluktuasi Harga */}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">
          {prod.name}
        </h5>
        <p className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">
          {prod.description}
        </p>
        <div className="flex items-center space-x-1.5 mt-1">
          <span className="text-[9px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
            {prod.unit}
          </span>
          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
            {prod.category}
          </span>
        </div>
        {/* Indikator Fluktuasi Harga Skenario Uji 4 */}
        <div className="mt-1">
          <PriceFluctuationBadge price={prod.price} lastMonthPrice={prod.lastMonthPrice} showOldPrice={true} />
        </div>
      </div>

      {/* Bagian Kanan: Nominal harga & Tombol Tambah Lotte Red */}
      <div className="text-right shrink-0 flex items-center space-x-2">
        <div>
          <span className="text-xs font-black text-slate-900 block">
            Rp {prod.price.toLocaleString('id-ID')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleAddRecommended(prod)}
          className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
          title="Tambah ke Keranjang Belanja"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );

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

  // Logika Warna Dinamis Status Bar Anggaran (Budget Progress Bar)
  let budgetBarColor = 'bg-green-500';
  let budgetBadgeText = 'Aman';
  let budgetBadgeClass = 'bg-green-50 text-green-700 border-green-200';

  if (percentageUsed > 100) {
    budgetBarColor = 'bg-red-500 animate-pulse';
    budgetBadgeText = 'Overbudget';
    budgetBadgeClass = 'bg-red-50 text-red-700 border-red-200';
  } else if (percentageUsed >= 91) {
    budgetBarColor = 'bg-red-500';
    budgetBadgeText = 'Kritis';
    budgetBadgeClass = 'bg-red-50 text-red-700 border-red-200';
  } else if (percentageUsed >= 75) {
    budgetBarColor = 'bg-orange-500';
    budgetBadgeText = 'Waspada';
    budgetBadgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
  } else {
    budgetBarColor = 'bg-green-500';
    budgetBadgeText = 'Aman';
    budgetBadgeClass = 'bg-green-50 text-green-700 border-green-200';
  }

  // Beep Sound on first entering overbudget
  const prevOverbudgetRef = useRef(false);
  useEffect(() => {
    if (isOverbudget && !prevOverbudgetRef.current) {
      playWarningBeep();
    }
    prevOverbudgetRef.current = isOverbudget;
  }, [isOverbudget]);

  // Scroll Controller untuk Menu Kategori Horizontal
  const categoryScrollRef = useRef(null);
  const [canScrollCategoryLeft, setCanScrollCategoryLeft] = useState(false);
  const [canScrollCategoryRight, setCanScrollCategoryRight] = useState(true);
  const [categoryScrollProgress, setCategoryScrollProgress] = useState(0);

  const updateCategoryScrollState = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollCategoryLeft(scrollLeft > 6);
    setCanScrollCategoryRight(scrollLeft < maxScroll - 6);
    if (maxScroll > 0) {
      const pct = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
      setCategoryScrollProgress(pct);
    } else {
      setCategoryScrollProgress(0);
    }
  };

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateCategoryScrollState();
    el.addEventListener('scroll', updateCategoryScrollState, { passive: true });
    window.addEventListener('resize', updateCategoryScrollState);
    return () => {
      el.removeEventListener('scroll', updateCategoryScrollState);
      window.removeEventListener('resize', updateCategoryScrollState);
    };
  }, []);

  const handleScrollCategory = (direction) => {
    playTapSound();
    const el = categoryScrollRef.current;
    if (!el) return;
    const scrollAmount = 180;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(updateCategoryScrollState, 250);
  };

  return (
    <div className="pb-36 bg-slate-50 min-h-full">
      {/* 2. WARNING OVERBUDGET BANNER (SRS F-05 Sentinel Audio-Visual Alert) */}
      {isOverbudget && (
        <div className="mx-4 mt-2.5 p-3.5 bg-red-50 border-2 border-red-500/80 rounded-2xl shadow-sm text-red-900 space-y-2 animate-bounce-short">
          <div className="flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black tracking-tight text-red-700">
                  PERINGATAN OVERBUDGET AKTIF!
                </h4>
                <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold text-[9px] rounded-full">
                  Defisit
                </span>
              </div>
              <p className="text-[11px] font-bold text-red-800 mt-0.5 leading-snug">
                Total belanjaan melebihi limit dompet sebesar{' '}
                <strong className="underline decoration-red-500">
                  Rp {deficitAmount.toLocaleString('id-ID')}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Rekomendasi Auto-Pangkas Sekunder */}
          {secondaryItemsCount > 0 ? (
            <div className="pt-2 border-t border-red-200/80 flex items-center justify-between">
              <span className="text-[10px] text-red-700 font-semibold flex items-center space-x-1">
                <span>✂️ Terdapat {secondaryItemsCount} item sekunder (bisa dipangkas)</span>
              </span>
              <button
                onClick={() => {
                  playTapSound();
                  if (onCutSecondaryItems) onCutSecondaryItems();
                }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg shadow-2xs flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Scissors className="w-3 h-3" />
                <span>Pangkas Otomatis</span>
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-red-600 pt-1 font-medium">
              Kurangi jumlah barang belanjaan atau naikkan limit saldo dompet Anda.
            </p>
          )}
        </div>
      )}

      {/* 3. BUDGET SAFETY CAP (PROGRESS CARD) */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Wallet className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Batas Saldo Dompet
              </span>
              <span className="text-xs font-black text-slate-900">
                Rp {budgetLimit.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              if (onOpenBudgetModal) onOpenBudgetModal();
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Ubah Batas Saldo Dompet"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Container */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
            <span className="text-slate-600">
              Status Anggaran: <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${budgetBadgeClass}`}>{budgetBadgeText} ({percentageUsed.toFixed(1)}%)</span>
            </span>
            <span className={isOverbudget ? 'text-red-600 font-black' : 'text-slate-700 font-extrabold'}>
              {percentageUsed.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${budgetBarColor}`}
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
          </div>
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

      {/* Quick Simulation Scenario Toggles */}
      <div className="mx-4 mt-2.5 flex items-center justify-between text-[11px] px-1 text-slate-400">
        <span>Skenario Mockup:</span>
        <div className="space-x-2">
          <button
            onClick={() => {
              playTapSound();
              if (onLoadMockupNormal) onLoadMockupNormal();
            }}
            className="text-red-600 hover:underline font-bold"
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

      {/* 4.5. MENU KATEGORI HORIZONTAL & REKOMENDASI BELANJA */}
      <section className="mt-3.5 space-y-3">
        {/* Category Header */}
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-900 tracking-tight">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>Kategori Belanja</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Geser kategori ke samping →
          </span>
        </div>

        {/* 1. Baris Menu Kategori Horizontal (Scroll Wheel ke Samping: 8 Kategori Berurutan) */}
        <div 
          ref={categoryScrollRef}
          className="flex items-center space-x-3 overflow-x-auto no-scrollbar scrollbar-hide px-4 py-1.5 scroll-smooth"
        >
          {CART_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  playTapSound();
                  setActiveCategory(cat.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  setTimeout(updateCategoryScrollState, 350);
                }}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div 
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-2 scale-105' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                    isSelected ? 'stroke-[2.5]' : 'stroke-2 text-slate-700'
                  }`} />
                </div>

                <span className={`text-[10px] mt-1.5 text-center leading-tight transition-colors whitespace-nowrap px-0.5 ${
                  isSelected 
                    ? 'text-red-600 font-black' 
                    : 'text-slate-500 font-semibold group-hover:text-slate-800'
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 1.5. Tombol Scroll ke Samping (Kiri & Kanan) di Bawah Kategori & di Atas Rekomendasi Belanja */}
        <div className="px-4 flex items-center justify-between gap-2 pt-0.5 pb-1">
          <button
            type="button"
            onClick={() => handleScrollCategory('left')}
            disabled={!canScrollCategoryLeft}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10.5px] font-bold border transition-all active:scale-95 cursor-pointer shadow-2xs ${
              canScrollCategoryLeft
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                : 'bg-slate-100/60 border-slate-200/50 text-slate-300 cursor-not-allowed opacity-40 shadow-none'
            }`}
            title="Geser kategori ke kiri"
            aria-label="Geser kategori ke kiri"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Geser Kiri</span>
          </button>

          {/* Visual Track Scroll Indicator */}
          <div className="flex-1 max-w-[130px] flex items-center justify-center">
            <div className="w-full h-1.5 bg-slate-200/90 rounded-full overflow-hidden p-[1px] flex items-center">
              <div 
                className="h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-full transition-all duration-150"
                style={{
                  width: '38%',
                  transform: `translateX(${categoryScrollProgress * 1.63}%)`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleScrollCategory('right')}
            disabled={!canScrollCategoryRight}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10.5px] font-bold border transition-all active:scale-95 cursor-pointer shadow-2xs ${
              canScrollCategoryRight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                : 'bg-slate-100/60 border-slate-200/50 text-slate-300 cursor-not-allowed opacity-40 shadow-none'
            }`}
            title="Geser kategori ke kanan"
            aria-label="Geser kategori ke kanan"
          >
            <span>Geser Kanan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. KATALOG REKOMENDASI BELANJA DENGAN SCROLL VERTICAL */}
        <div className="mx-4 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Rekomendasi Belanja
              </h4>
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/80">
              {activeCategory === 'all' 
                ? 'Semua Kategori' 
                : CART_CATEGORIES.find(c => c.id === activeCategory)?.name}
            </span>
          </div>

          {/* Kontainer Vertikal Scrollable (Scroll wheel ke bawah) */}
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scroll-smooth no-scrollbar">
            {activeCategory === 'all' ? (
              // Mode 'Semua': Tampilkan seluruh barang dari segala kategori, dikelompokkan berdasarkan kategorinya
              Object.entries(RECOMMENDED_PRODUCTS_BY_CATEGORY).map(([catKey, catGroup]) => (
                <div key={catKey} className="space-y-2">
                  <div className="flex items-center space-x-1.5 pt-1 pb-1 border-b border-slate-100 text-slate-800 font-extrabold text-[11px] sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                    <span>{catGroup.iconEmoji}</span>
                    <span>{catGroup.categoryName}</span>
                    <span className="text-[9.5px] font-bold text-slate-400">({catGroup.items.length})</span>
                  </div>

                  <div className="space-y-2">
                    {catGroup.items.map((prod) => renderProductCard(prod))}
                  </div>
                </div>
              ))
            ) : (
              // Mode Kategori Spesifik: Tampilkan daftar produk kategori terkait
              <div className="space-y-2">
                {(RECOMMENDED_PRODUCTS_BY_CATEGORY[activeCategory]?.items || []).map((prod) => renderProductCard(prod))}
              </div>
            )}
          </div>
        </div>
      </section>

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
              className="text-[11px] font-bold text-red-600 hover:underline flex items-center space-x-1 cursor-pointer"
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
                    {/* Item Thumbnail: 100% Emoji Container (w-16 h-16 bg-gray-100 rounded-md) */}
                    <ProductEmojiBox 
                      name={item.name} 
                      category={item.category || item.unit} 
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
                            <span className="px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-100 rounded-md text-[9px] font-bold">
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

                      {/* Price Fluctuation Trend (Universal Skenario Uji 4) */}
                      <div className="mt-1">
                        <PriceFluctuationBadge 
                          price={item.price} 
                          lastMonthPrice={item.lastMonthPrice} 
                          showOldPrice={true} 
                        />
                      </div>

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
                            className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-2xs font-bold text-xs cursor-pointer"
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
                            className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-2xs font-bold text-xs cursor-pointer"
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
                      className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
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

        {/* 6. BARCODE SCANNER PROMPT BANNER */}
        <div className="mt-4 p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5 text-xs text-slate-700 font-medium">
            <Scan className="w-4 h-4 text-red-600" />
            <span>Ingin scan barcode item alternatif?</span>
          </div>
          <button
            onClick={() => {
              playTapSound();
              if (onOpenBarcodeModal) onOpenBarcodeModal();
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
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
          /* Normal Mode: Total & Checkout CTA with Lotte Red */
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">
                {cartItems.length} macam ({totalItemCount} Item) • <span className="text-red-600 font-bold">Sisa: Rp {remainingBudget.toLocaleString('id-ID')}</span>
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
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Kosongkan Troli"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenCheckout) onOpenCheckout();
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
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
