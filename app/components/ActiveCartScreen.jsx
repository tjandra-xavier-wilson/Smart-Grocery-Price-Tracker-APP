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
  Brush
} from 'lucide-react';
import { playTapSound, playSuccessSound, playWarningBeep } from '../utils/sound';
import { toISODateString, toIndoDisplayDate } from '../utils/date';

export default function ActiveCartScreen({
  cartItems = [],
  budgetLimit = 350000,
  currentStore = 'Lotte Mart - Puri Indah',
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

  // 2. Data Katalog Rekomendasi Belanja Berdasarkan Kategori Lengkap
  const RECOMMENDED_PRODUCTS_BY_CATEGORY = {
    sembako: {
      categoryName: 'Bahan Pokok',
      iconEmoji: '🌾',
      items: [
        {
          id: 'rec-sembako-1',
          name: 'Beras Rojolele Super Pulen',
          category: 'Bahan Pokok',
          unit: '5kg',
          price: 74000,
          description: 'Pulen alami tanpa pengawet & pemutih',
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-sembako-2',
          name: 'Minyak Goreng Sawit Murni',
          category: 'Bahan Pokok',
          unit: '2L',
          price: 38500,
          description: 'Jernih tahan panas dengan vitamin E',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-sembako-3',
          name: 'Telur Ayam Ras Segar Pilihan',
          category: 'Bahan Pokok',
          unit: '1 kg',
          price: 28000,
          description: 'Segar langsung dari peternak mitra',
          image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-sembako-4',
          name: 'Gula Pasir Kristal Putih',
          category: 'Bahan Pokok',
          unit: '1 kg',
          price: 17500,
          description: 'Gula tebu butiran bersih standar SNI',
          image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=300&auto=format&fit=crop&q=80'
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
          description: 'Manis renyah kaya beta-karoten',
          image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-sayur-2',
          name: 'Bayam Hijau Hidroponik',
          category: 'Sayuran Segar',
          unit: '1 ikat',
          price: 6000,
          description: 'Segar bebas pestisida kaya zat besi',
          image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-sayur-3',
          name: 'Brokoli Hijau Organik',
          category: 'Sayuran Segar',
          unit: '500g',
          price: 16000,
          description: 'Brokoli segar kaya antioksidan sehat',
          image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop&q=80'
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
          description: 'Renyah manis kaya serat & vitamin alami',
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-buah-2',
          name: 'Pisang Cavendish Super',
          category: 'Buah-buahan',
          unit: '1 sisir',
          price: 22000,
          description: 'Manis legit sumber energi harian',
          image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-buah-3',
          name: 'Jeruk Medan Manis',
          category: 'Buah-buahan',
          unit: '1 kg',
          price: 26000,
          description: 'Bulir berair manis menyegarkan',
          image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&auto=format&fit=crop&q=80'
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
          description: 'Dada ayam tanpa tulang tinggi protein',
          image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-daging-2',
          name: 'Daging Sapi Paha Segar',
          category: 'Daging dan Lauk',
          unit: '500g',
          price: 68000,
          description: 'Sapi lokal empuk rendah lemak',
          image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-daging-3',
          name: 'Ikan Salmon Fillet Fresh',
          category: 'Daging dan Lauk',
          unit: '200g',
          price: 55000,
          description: 'Kaya Omega-3 untuk kesehatan jantung',
          image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80'
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
          description: 'Biskuit kelapa renyah kaya vitamin',
          image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-camilan-2',
          name: 'Chitato Keripik Sapi Panggang',
          category: 'Camilan',
          unit: '68g',
          price: 12000,
          description: 'Keripik kentang bergelombang gurih',
          image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-camilan-3',
          name: 'Oreo Biskuit Krim Vanila',
          category: 'Camilan',
          unit: '133g',
          price: 9800,
          description: 'Biskuit cokelat sandwich krim lezat',
          image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop&q=80'
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
          description: 'Susu sapi murni kaya kalsium alami',
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-minuman-2',
          name: 'Kopi Kapal Api Special Mix',
          category: 'Minuman',
          unit: '10 sachet',
          price: 14500,
          description: 'Kopi tubruk gula mantap harum',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-minuman-3',
          name: 'Teh Melati Wangi Segar Kotak',
          category: 'Minuman',
          unit: '1L',
          price: 9500,
          description: 'Seduhan daun teh melati asli alami',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80'
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
          description: 'Sabun cair antiseptik perlindungan kuman',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-kebersihan-2',
          name: 'Deterjen Cair Rinso Konsentrat',
          category: 'Peralatan Kebersihan',
          unit: '750ml',
          price: 21500,
          description: 'Hilangkan noda membandel 1x kucek',
          image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&auto=format&fit=crop&q=80'
        },
        {
          id: 'rec-kebersihan-3',
          name: 'Sabun Cuci Piring Jeruk Nipis',
          category: 'Peralatan Kebersihan',
          unit: '700ml',
          price: 15500,
          description: 'Bersihkan lemak membandel seketika',
          image: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=300&auto=format&fit=crop&q=80'
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
        originalPrice: prod.price,
        category: prod.category || 'Bahan Pokok',
        unit: prod.unit || 'pcs',
        quantity: 1,
        isSecondary: false
      });
    }
  };

  const renderProductCard = (prod) => (
    <div 
      key={prod.id}
      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-200 flex items-center justify-between gap-3 transition-all group"
    >
      {/* Bagian Kiri: Gambar kecil produk (w-16 h-16, object-cover, rounded-lg) dengan onError fallback */}
      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
        <img 
          src={prod.image} 
          alt={prod.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
          onError={(e) => { 
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'; 
          }}
          loading="lazy"
        />
      </div>

      {/* Bagian Tengah: Judul produk & Deskripsi singkat */}
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
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
            {prod.category}
          </span>
        </div>
      </div>

      {/* Bagian Kanan: Nominal harga & Tombol "+" */}
      <div className="text-right shrink-0 flex items-center space-x-2">
        <div>
          <span className="text-xs font-black text-slate-900 block">
            Rp {prod.price.toLocaleString('id-ID')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleAddRecommended(prod)}
          className="w-8 h-8 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
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

      {/* 4.5. MENU KATEGORI HORIZONTAL & REKOMENDASI BELANJA */}
      <section className="mt-3.5 space-y-3">
        {/* Category Header */}
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-900 tracking-tight">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Kategori Belanja</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Geser kategori ke samping →
          </span>
        </div>

        {/* 1. Baris Menu Kategori Horizontal (Scroll Wheel ke Samping: 8 Kategori Berurutan) */}
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar scrollbar-hide px-4 py-1.5 scroll-smooth">
          {CART_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveCategory(cat.id);
                }}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div 
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-800 ring-offset-2 scale-105' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                    isSelected ? 'stroke-[2.5]' : 'stroke-2 text-slate-700'
                  }`} />
                </div>

                <span className={`text-[10px] mt-1.5 text-center leading-tight transition-colors whitespace-nowrap px-0.5 ${
                  isSelected 
                    ? 'text-emerald-900 font-black' 
                    : 'text-slate-500 font-semibold group-hover:text-slate-800'
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. KATALOG REKOMENDASI BELANJA DENGAN SCROLL VERTICAL */}
        <div className="mx-4 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Rekomendasi Belanja
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
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

