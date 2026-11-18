'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import SentinelLoadingScreen from './components/SentinelLoadingScreen';
import HeaderBackgroundTrolley from './components/HeaderBackgroundTrolley';
import HeaderBar from './components/HeaderBar';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import ActiveCartScreen from './components/ActiveCartScreen';
import CatalogInputScreen from './components/CatalogInputScreen';
import HistoryScreen from './components/HistoryScreen';
import { 
  BudgetLimitModal, 
  StoreModal, 
  BarcodeScannerModal, 
  ReceiptDetailModal, 
  OrderSummaryModal,
  CheckoutModal,
  DigitalReceiptModal,
  UserProfileModal,
  DeleteConfirmationModal,
  EmptyCartModal
} from './components/Modals';
import { 
  supabase, 
  getSingleUserSession, 
  signOutUser, 
  saveShoppingTrip, 
  getShoppingHistoryList,
  getOfflineHistory,
  deleteShoppingTrip,
  clearAllShoppingHistory,
  updateBudgetSettings,
  saveDeviceAccount,
  isEmailRegistered,
  getCustomStoresFromSupabase,
  saveCustomStoreToSupabase,
  SINGLE_USER_STORAGE_KEY,
  insertCustomProduct,
  getCustomProducts,
  generateDefaultPrices,
  insertCustomStore,
  getCustomStores,
  deleteCustomStore,
  deleteCustomProduct
} from '../src/lib/supabaseClient';
import { toIndoDisplayDate, toISODateString } from './utils/date';
import { playTapSound, playSuccessSound, playBarcodeBeep } from './utils/sound';
import { getProductImage } from './utils/emoji';
import { getItemStorePrice } from './utils/storePrices';

// Storage Keys for LocalStorage Persistence
const STORAGE_KEYS = {
  CART: 'sakugrosir_cart_v1',
  BUDGET: 'sakugrosir_budget_v1',
  STORE: 'sakugrosir_store_name_v1',
  DATE: 'sakugrosir_trans_date_v1',
  HISTORY: 'sakugrosir_history_v1',
  USER: 'sakugrosir_single_user_v1',
  AUTH: 'sakugrosir_is_logged_in',
  SPLASH_SHOWN: 'sentinel_splash_shown'
};

// Initial Mockup 2 Dataset (Normal: 100% Emoji + Dynamic 4-Store Pricing)
const MOCKUP_NORMAL_CART = [
  {
    id: 'prod-1',
    name: 'Beras 5kg',
    price: 74000,
    originalPrice: 74000,
    quantity: 1,
    unit: '5kg',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 68000, // +Rp 6.000 vs bln lalu (Skenario Uji 4)
    prices: {
      'Lotte Mart - Puri Indah': { current: 74000, history: 68000 },
      'Super Indo - Pesanggrahan': { current: 71900, history: 74900 },
      'Hypermart - Puri Mall': { current: 73000, history: 73000 },
      'Indogrosir Daan Mogot': { current: 67000, history: 62000 }
    }
  },
  {
    id: 'prod-2',
    name: 'Telur Ayam Ras 1kg',
    price: 28000,
    originalPrice: 32000,
    discountLabel: 'Diskon Hemat',
    quantity: 1,
    unit: '1 kg',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 32000, // -Rp 4.000 hemat vs bln lalu (Skenario Uji 4)
    prices: {
      'Lotte Mart - Puri Indah': { current: 28000, history: 32000 },
      'Super Indo - Pesanggrahan': { current: 27900, history: 31900 },
      'Hypermart - Puri Mall': { current: 29000, history: 29000 },
      'Indogrosir Daan Mogot': { current: 25500, history: 24000 }
    }
  },
  {
    id: 'prod-3',
    name: 'Garam 500g',
    price: 5000,
    originalPrice: 5000,
    quantity: 2,
    unit: '500g',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 5000, // Harga Stabil (Skenario Uji 4)
    prices: {
      'Lotte Mart - Puri Indah': { current: 5000, history: 5000 },
      'Super Indo - Pesanggrahan': { current: 4900, history: 6500 },
      'Hypermart - Puri Mall': { current: 5000, history: 5000 },
      'Indogrosir Daan Mogot': { current: 4200, history: 3900 }
    }
  },
  {
    id: 'prod-4',
    name: 'Minyak Goreng Sania 2L',
    price: 33500,
    originalPrice: 39500,
    discountLabel: 'Diskon 15%',
    quantity: 2,
    unit: 'pouch / 2L',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 36000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 33500, history: 36000 },
      'Super Indo - Pesanggrahan': { current: 32900, history: 35900 },
      'Hypermart - Puri Mall': { current: 33500, history: 33500 },
      'Indogrosir Daan Mogot': { current: 29500, history: 27500 }
    }
  },
  {
    id: 'prod-5',
    name: 'Sabun Mandi Dettol Reff 450ml',
    price: 28500,
    originalPrice: 35000,
    discountLabel: 'Promo: 20% + 10%',
    quantity: 2,
    unit: 'pouch / 450ml',
    category: 'Perlengkapan Mandi',
    isSecondary: false,
    lastMonthPrice: 28500,
    prices: {
      'Lotte Mart - Puri Indah': { current: 28500, history: 28500 },
      'Super Indo - Pesanggrahan': { current: 27900, history: 30900 },
      'Hypermart - Puri Mall': { current: 28500, history: 28500 },
      'Indogrosir Daan Mogot': { current: 25000, history: 23500 }
    }
  },
  {
    id: 'prod-6',
    name: 'Susu UHT Full Cream Greenfields 1L',
    price: 21500,
    originalPrice: 21500,
    quantity: 2,
    unit: 'kotak / 1L',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 20000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 21500, history: 20000 },
      'Super Indo - Pesanggrahan': { current: 20900, history: 23900 },
      'Hypermart - Puri Mall': { current: 21500, history: 21500 },
      'Indogrosir Daan Mogot': { current: 18900, history: 17500 }
    }
  }
];

// Mockup 3 Dataset (Overbudget: 100% Emoji + Dynamic 4-Store Pricing)
const MOCKUP_OVERBUDGET_CART = [
  {
    id: 'over-1',
    name: 'Cemilan Coklat Import 100g',
    price: 45000,
    originalPrice: 45000,
    quantity: 1,
    unit: 'pcs',
    category: 'Confectionery',
    subcat: 'Kategori: Confectionery',
    isSecondary: true, // Sekunder - Rekomendasi Batalkan
    lastMonthPrice: 45000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 45000, history: 45000 },
      'Super Indo - Pesanggrahan': { current: 43900, history: 47900 },
      'Hypermart - Puri Mall': { current: 45000, history: 45000 },
      'Indogrosir Daan Mogot': { current: 39500, history: 37000 }
    }
  },
  {
    id: 'over-2',
    name: 'Minuman Bersoda Kaleng 330ml',
    price: 9000,
    originalPrice: 9000,
    quantity: 2,
    unit: 'pcs',
    category: 'Minuman Manis',
    subcat: 'Kategori: Minuman Manis',
    isSecondary: true, // Sekunder - Rekomendasi Batalkan
    lastMonthPrice: 9000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 9000, history: 9000 },
      'Super Indo - Pesanggrahan': { current: 8900, history: 9900 },
      'Hypermart - Puri Mall': { current: 9000, history: 9000 },
      'Indogrosir Daan Mogot': { current: 7800, history: 7200 }
    }
  },
  {
    id: 'over-3',
    name: 'Beras 5kg',
    price: 74000,
    originalPrice: 74000,
    quantity: 1,
    unit: '5kg',
    category: 'Primer / Pokok',
    subcat: 'Kebutuhan Pokok Utama',
    isSecondary: false,
    lastMonthPrice: 68000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 74000, history: 68000 },
      'Super Indo - Pesanggrahan': { current: 71900, history: 74900 },
      'Hypermart - Puri Mall': { current: 73000, history: 73000 },
      'Indogrosir Daan Mogot': { current: 67000, history: 62000 }
    }
  },
  {
    id: 'over-4',
    name: 'Telur Ayam Ras 1kg',
    price: 28000,
    originalPrice: 32000,
    quantity: 2,
    unit: '1 kg',
    category: 'Primer / Protein',
    subcat: 'Protein Harian',
    isSecondary: false,
    lastMonthPrice: 32000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 28000, history: 32000 },
      'Super Indo - Pesanggrahan': { current: 27900, history: 31900 },
      'Hypermart - Puri Mall': { current: 29000, history: 29000 },
      'Indogrosir Daan Mogot': { current: 25500, history: 24000 }
    }
  },
  {
    id: 'over-5',
    name: 'Minyak Goreng Sawit Pouch 2L',
    price: 37000,
    originalPrice: 37000,
    quantity: 5,
    unit: 'pouch',
    category: 'Primer / Dapur',
    subcat: 'Sembako Rumah Tangga',
    isSecondary: false,
    lastMonthPrice: 37000,
    prices: {
      'Lotte Mart - Puri Indah': { current: 37000, history: 37000 },
      'Super Indo - Pesanggrahan': { current: 35900, history: 38900 },
      'Hypermart - Puri Mall': { current: 37000, history: 37000 },
      'Indogrosir Daan Mogot': { current: 32500, history: 30000 }
    }
  }
];

export default function Home() {
  // Mounting guard untuk menjamin 0 hydration mismatch antara Server & Client
  const [isMounted, setIsMounted] = useState(false);

  // Authentication State: Session persistence across reload / Ctrl+R
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  // Navigation State: 'cart' | 'input' | 'history'
  const [activeTab, setActiveTab] = useState('cart');

  // Core App State
  const [currentStore, setCurrentStore] = useState('Lotte Mart - Puri Indah');
  const [customStores, setCustomStores] = useState([]);
  const [transactionDate, setTransactionDate] = useState('24 Mei 2025');
  const [budgetLimit, setBudgetLimit] = useState(350000);
  // State keranjang belanja terisolasi per akun (akun baru tanpa transaksi mulai dari state kosong [])
  const [cartItems, setCartItems] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('Online Sync Live');

  // State Global untuk Master Produk & Barang Kustom (Terintegrasi Supabase)
  const [customProducts, setCustomProducts] = useState([]);
  // State Global untuk Lokasi Supermarket Kustom (Terintegrasi Supabase custom_stores)
  const [customSupermarkets, setCustomSupermarkets] = useState([]);

  // Base catalog items bawaan (dengan struktur dynamic 4-store pricing)
  const baseDefaultItems = useMemo(() => [
    {
      id: 'base-1',
      name: 'Beras 5kg',
      barcode: '899275300101',
      price: 74000,
      lastMonthPrice: 68000,
      category: 'Bahan Pokok',
      unit: '5kg',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 74000, history: 68000 },
        'Super Indo - Pesanggrahan': { current: 71900, history: 74900 },
        'Hypermart - Puri Mall': { current: 73000, history: 73000 },
        'Indogrosir Daan Mogot': { current: 67000, history: 62000 }
      }
    },
    {
      id: 'base-2',
      name: 'Telur Ayam Ras 1kg',
      price: 28000,
      lastMonthPrice: 32000,
      category: 'Bahan Pokok',
      unit: '1 kg',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 28000, history: 32000 },
        'Super Indo - Pesanggrahan': { current: 27900, history: 31900 },
        'Hypermart - Puri Mall': { current: 29000, history: 29000 },
        'Indogrosir Daan Mogot': { current: 25500, history: 24000 }
      }
    },
    {
      id: 'base-3',
      name: 'Garam 500g',
      price: 5000,
      lastMonthPrice: 5000,
      category: 'Bahan Pokok',
      unit: '500g',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 5000, history: 5000 },
        'Super Indo - Pesanggrahan': { current: 4900, history: 5900 },
        'Hypermart - Puri Mall': { current: 5000, history: 5000 },
        'Indogrosir Daan Mogot': { current: 4500, history: 4000 }
      }
    },
    {
      id: 'base-4',
      name: 'Minyak Goreng Sawit Murni 2L',
      price: 38500,
      lastMonthPrice: 35000,
      category: 'Bahan Pokok',
      unit: '2L',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 38500, history: 35000 },
        'Super Indo - Pesanggrahan': { current: 37900, history: 39900 },
        'Hypermart - Puri Mall': { current: 38000, history: 38000 },
        'Indogrosir Daan Mogot': { current: 34000, history: 32000 }
      }
    },
    {
      id: 'base-5',
      name: 'Gula Pasir Kristal Putih 1kg',
      price: 17500,
      lastMonthPrice: 17500,
      category: 'Bahan Pokok',
      unit: '1 kg',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 17500, history: 17500 },
        'Super Indo - Pesanggrahan': { current: 16900, history: 18900 },
        'Hypermart - Puri Mall': { current: 17000, history: 17000 },
        'Indogrosir Daan Mogot': { current: 15500, history: 14500 }
      }
    },
    {
      id: 'base-6',
      name: 'Indomie Goreng (5 pcs)',
      price: 15500,
      lastMonthPrice: 15500,
      category: 'Bahan Pokok',
      unit: '5 pcs',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 15500, history: 15500 },
        'Super Indo - Pesanggrahan': { current: 14900, history: 16900 },
        'Hypermart - Puri Mall': { current: 15000, history: 15000 },
        'Indogrosir Daan Mogot': { current: 13500, history: 12500 }
      }
    },
    {
      id: 'base-7',
      name: 'Susu UHT Ultra Milk 1L',
      price: 19500,
      lastMonthPrice: 21000,
      category: 'Bahan Pokok',
      unit: '1L',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 19500, history: 21000 },
        'Super Indo - Pesanggrahan': { current: 18900, history: 21900 },
        'Hypermart - Puri Mall': { current: 19500, history: 19500 },
        'Indogrosir Daan Mogot': { current: 17500, history: 16500 }
      }
    },
    {
      id: 'base-8',
      name: 'Kecap Manis Bango 550ml',
      price: 24500,
      lastMonthPrice: 22000,
      category: 'Bumbu Dapur',
      unit: '550ml',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 24500, history: 22000 },
        'Super Indo - Pesanggrahan': { current: 23900, history: 25900 },
        'Hypermart - Puri Mall': { current: 24000, history: 24000 },
        'Indogrosir Daan Mogot': { current: 21500, history: 20000 }
      }
    },
    {
      id: 'base-9',
      name: 'Bawang Merah Brebes 500g',
      price: 19000,
      lastMonthPrice: 22000,
      category: 'Bumbu Dapur',
      unit: '500g',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 19000, history: 22000 },
        'Super Indo - Pesanggrahan': { current: 18900, history: 22900 },
        'Hypermart - Puri Mall': { current: 19000, history: 19000 },
        'Indogrosir Daan Mogot': { current: 16500, history: 15000 }
      }
    },
    {
      id: 'base-10',
      name: 'Bawang Putih Kating 500g',
      price: 22000,
      lastMonthPrice: 21000,
      category: 'Bumbu Dapur',
      unit: '500g',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 22000, history: 21000 },
        'Super Indo - Pesanggrahan': { current: 21900, history: 24900 },
        'Hypermart - Puri Mall': { current: 22000, history: 22000 },
        'Indogrosir Daan Mogot': { current: 19500, history: 18000 }
      }
    },
    {
      id: 'base-11',
      name: 'Cabe Rawit Merah 250g',
      price: 18000,
      lastMonthPrice: 16000,
      category: 'Sayuran Segar',
      unit: '250g',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 18000, history: 16000 },
        'Super Indo - Pesanggrahan': { current: 17900, history: 19900 },
        'Hypermart - Puri Mall': { current: 18000, history: 18000 },
        'Indogrosir Daan Mogot': { current: 15500, history: 14000 }
      }
    },
    {
      id: 'base-12',
      name: 'Sabun Mandi Dettol 400ml',
      price: 26500,
      lastMonthPrice: 29000,
      category: 'Peralatan Kebersihan',
      unit: '400ml',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 26500, history: 29000 },
        'Super Indo - Pesanggrahan': { current: 25900, history: 28900 },
        'Hypermart - Puri Mall': { current: 26500, history: 26500 },
        'Indogrosir Daan Mogot': { current: 23500, history: 22000 }
      }
    },
    {
      id: 'base-13',
      name: 'Deterjen Rinso Cair 750ml',
      barcode: '899450239019',
      price: 21500,
      lastMonthPrice: 20000,
      category: 'Peralatan Kebersihan',
      unit: '750ml',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 21500, history: 20000 },
        'Super Indo - Pesanggrahan': { current: 20900, history: 22900 },
        'Hypermart - Puri Mall': { current: 21000, history: 21000 },
        'Indogrosir Daan Mogot': { current: 18500, history: 17500 }
      }
    },
    {
      id: 'base-14',
      name: 'Beras Premium Rojolele 5kg',
      barcode: '899275300101',
      price: 74000,
      lastMonthPrice: 68000,
      category: 'Bahan Pokok',
      unit: 'karung / 5kg',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 74000, history: 68000 },
        'Super Indo - Pesanggrahan': { current: 71900, history: 74900 },
        'Hypermart - Puri Mall': { current: 73000, history: 73000 },
        'Indogrosir Daan Mogot': { current: 67000, history: 62000 }
      }
    },
    {
      id: 'base-15',
      name: 'Minyak Goreng Sania 2L',
      barcode: '899100120045',
      price: 33500,
      lastMonthPrice: 35000,
      category: 'Bahan Pokok',
      unit: 'pouch / 2L',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 33500, history: 35000 },
        'Super Indo - Pesanggrahan': { current: 33000, history: 34000 },
        'Hypermart - Puri Mall': { current: 33500, history: 33500 },
        'Indogrosir Daan Mogot': { current: 31500, history: 32000 }
      }
    },
    {
      id: 'base-16',
      name: 'Susu UHT Full Cream Greenfields 1L',
      barcode: '899300511029',
      price: 21500,
      lastMonthPrice: 21500,
      category: 'Minuman',
      unit: 'kotak / 1L',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 21500, history: 21500 },
        'Super Indo - Pesanggrahan': { current: 21000, history: 21000 },
        'Hypermart - Puri Mall': { current: 21500, history: 21500 },
        'Indogrosir Daan Mogot': { current: 19500, history: 19500 }
      }
    },
    {
      id: 'base-17',
      name: 'Sabun Mandi Dettol Reff 450ml',
      barcode: '899450239018',
      price: 28500,
      lastMonthPrice: 29000,
      category: 'Peralatan Kebersihan',
      unit: 'pouch / 450ml',
      isCustom: false,
      prices: {
        'Lotte Mart - Puri Indah': { current: 28500, history: 29000 },
        'Super Indo - Pesanggrahan': { current: 28000, history: 28500 },
        'Hypermart - Puri Mall': { current: 28500, history: 28500 },
        'Indogrosir Daan Mogot': { current: 26000, history: 26000 }
      }
    }
  ], []);

  // State global recommendedItems (menggabungkan master bawaan + custom products)
  const [recommendedItems, setRecommendedItems] = useState(baseDefaultItems);

  // 1. Fetch data barang rekomendasi menggunakan useCallback (Single Source of Truth)
  const fetchRecommendedItems = useCallback(async (userId = null) => {
    try {
      const activeUserId = userId || currentUserRef.current?.id || currentUser?.id;
      const prods = await getCustomProducts(activeUserId);
      if (prods && Array.isArray(prods)) {
        // 1. Pemetaan (mapping) untuk mengonversi base_price kembali menjadi format objek prices
        const formattedData = prods.map(item => {
          const rawPrice = Number(String(item.base_price ?? item.price ?? 0).replace(/[^0-9]/g, ''));
          return {
            ...item,
            price: rawPrice,
            base_price: rawPrice,
            isCustom: true,
            description: item.description || `Barang kustom: ${item.name}`,
            // Rekonstruksi struktur harga agar tidak Rp 0 di fallback
            prices: item.prices || generateDefaultPrices(rawPrice)
          };
        });

        // 2. DEDUPLIKASI TOTAL (Penyelesaian Konflik State):
        // Replace (timpa) seluruh state barang kustom dengan formattedData dari database.
        // Buang seluruh item kustom lokal yang menggunakan tempId (fake ID).
        setCustomProducts(formattedData);
        setRecommendedItems(() => {
          const baseList = baseDefaultItems.filter(item => !item.isCustom);
          // Timpa seluruh barang kustom dengan data resmi dari Supabase (tanpa duplikasi tempId)
          const combined = [...formattedData, ...baseList];
          return Array.from(new Map(combined.map(item => [item.name.toLowerCase(), item])).values());
        });
      }
    } catch (e) {
      console.warn('[fetchRecommendedItems Error]:', e);
    }
  }, [currentUser?.id, baseDefaultItems]);

  // 2. Fetch data toko kustom menggunakan useCallback
  const fetchCustomStores = useCallback(async (userId = null) => {
    try {
      const targetUid = userId || currentUserRef.current?.id || currentUser?.id;
      const stores = await getCustomStores(targetUid);
      if (stores && Array.isArray(stores)) {
        setCustomSupermarkets(stores);
        setCustomStores(stores);
      }
    } catch (e) {
      console.warn('[fetchCustomStores Error]:', e);
    }
  }, [currentUser?.id]);

  // Muat data awal saat komponen pertama kali dimuat atau currentUser berganti
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchRecommendedItems(currentUser?.id);
      fetchCustomStores(currentUser?.id);
    }
    return () => { isMounted = false; };
  }, [currentUser?.id, fetchRecommendedItems, fetchCustomStores]);

  // Handler simpan lokasi supermarket baru ke Supabase & state lokal
  const handleAddNewStore = async (newStoreName) => {
    if (!newStoreName || !newStoreName.trim()) return false;
    const cleanName = newStoreName.trim();

    // 1. Optimistic update ke state lokal customSupermarkets
    const tempStoreObj = {
      id: 'store-' + Date.now(),
      name: cleanName,
      store_name: cleanName,
      isCustom: true
    };

    let nextStores = [];
    setCustomSupermarkets(prev => {
      const exists = prev.some(s => (typeof s === 'string' ? s : s.name || s.store_name) === cleanName);
      if (exists) {
        nextStores = prev;
        return prev;
      }
      nextStores = [...prev, tempStoreObj];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(nextStores));
      }
      return nextStores;
    });

    // 2. Otomatis atur toko yang baru dibuat sebagai selectedSupermarket yang aktif
    setCurrentStore(cleanName);
    persistState(undefined, undefined, cleanName, undefined, nextStores);

    // 3. Multi-device Broadcast Instan via Supabase Realtime WebSocket (0 DELAY)
    try {
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_STORE_CHANGE',
        payload: {
          action: 'ADD_STORE',
          store: tempStoreObj,
          allStores: nextStores,
          selectedStore: cleanName
        }
      });
    } catch (e) {}

    // 4. Simpan permanen ke Supabase Cloud (tabel custom_stores & Cloud Sync Hub)
    try {
      const res = await insertCustomStore(cleanName, currentUser?.id);
      if (res && res.data && res.data.id) {
        setCustomSupermarkets(prev => prev.map(s => {
          const sName = typeof s === 'string' ? s : s.name || s.store_name;
          if (sName === cleanName) {
            return {
              id: res.data.id,
              name: cleanName,
              store_name: cleanName,
              isCustom: true
            };
          }
          return s;
        }));
      }
    } catch (e) {
      console.warn('[Sync Custom Store Error]:', e);
    }
    return true;
  };

  // Handler hapus lokasi supermarket kustom dari Supabase & state lokal
  const handleDeleteCustomStore = async (storeToDelete) => {
    if (!storeToDelete) return;
    const storeId = typeof storeToDelete === 'object' ? storeToDelete.id : null;
    const storeName = typeof storeToDelete === 'string' ? storeToDelete : (storeToDelete.name || storeToDelete.store_name);

    // 1. Optimistic remove dari state lokal customSupermarkets
    let remainingStores = [];
    setCustomSupermarkets(prev => {
      remainingStores = prev.filter(s => {
        const sId = typeof s === 'object' ? s.id : null;
        const sName = typeof s === 'string' ? s : (s.name || s.store_name);
        if (storeId && sId === storeId) return false;
        if (storeName && sName === storeName) return false;
        return true;
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(remainingStores));
      }
      return remainingStores;
    });

    // 2. Fallback Aktif: Jika toko yang dihapus kebetulan sedang menjadi selectedSupermarket aktif,
    // otomatis ubah selectedSupermarket kembali ke "Lotte Mart - Puri Indah"
    const nextStore = currentStore === storeName ? 'Lotte Mart - Puri Indah' : currentStore;
    if (currentStore === storeName) {
      setCurrentStore('Lotte Mart - Puri Indah');
      persistState(undefined, undefined, 'Lotte Mart - Puri Indah', undefined, remainingStores);
    }

    // 3. Multi-device Broadcast Instan via Supabase Realtime WebSocket (0 DELAY)
    try {
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_STORE_CHANGE',
        payload: {
          action: 'DELETE_STORE',
          storeName: storeName,
          storeId: storeId,
          allStores: remainingStores,
          selectedStore: nextStore
        }
      });
    } catch (e) {}

    // 4. Hapus dari Supabase Cloud (tabel custom_stores & Cloud Sync Hub)
    try {
      await deleteCustomStore(storeId, storeName, currentUser?.id);
    } catch (e) {
      console.warn('[Delete Custom Store Error]:', e);
    }
  };

  // Handler simpan barang kustom baru: True Optimistic Update + Non-Blocking Background Sync
  const handleAddCustomProduct = (productData) => {
    if (!productData || !productData.name) return;
    const cleanName = productData.name.trim();
    // 1. Sanitasi Data (Solusi Bug Harga): Ambil murni integer angka
    const rawPrice = Number(String(productData.price ?? productData.originalPrice ?? 0).replace(/[^0-9]/g, ''));
    const defaultPrices = productData.prices || generateDefaultPrices(rawPrice);
    const activeUserId = currentUser?.id || currentUserRef.current?.id;

    // 1. Generate UUID Resmi dari Frontend HANYA SEKALI via Web Crypto API (Client-Side UUID Generation)
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
    const generatedId = (productData.id && isUuid(productData.id)) ? productData.id : generateUUID();

    // 2. Samakan ID untuk Optimistic UI dan Database (Zero Mismatch)
    const newProductObj = {
      id: generatedId,
      name: cleanName,
      category: productData.category || 'Bahan Pokok',
      unit: productData.unit || 'pcs',
      price: rawPrice,
      originalPrice: rawPrice,
      description: `Barang kustom: ${cleanName}`,
      prices: defaultPrices,
      isCustom: true,
      lastMonthPrice: null,
      historyPrice: null,
      user_id: activeUserId,
      base_price: rawPrice
    };

    // 3. OPTIMISTIC UPDATE: Langsung suntik ke Rekomendasi Belanja & LocalStorage (0 Detik Delay)
    let nextProducts = [];
    setCustomProducts(prev => {
      nextProducts = [newProductObj, ...(prev || []).filter(p => p.id !== generatedId && p.name.toLowerCase() !== cleanName.toLowerCase())];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sakugrosir_custom_products_v1', JSON.stringify(nextProducts));
      }
      return nextProducts;
    });
    setRecommendedItems(prev => [newProductObj, ...(prev || []).filter(p => p.id !== generatedId && p.name.toLowerCase() !== cleanName.toLowerCase())]);

    // 4. Multi-device Broadcast Instan via Supabase Realtime WebSocket (0 DELAY)
    try {
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_PRODUCT_CHANGE',
        payload: {
          action: 'ADD_PRODUCT',
          product: newProductObj,
          allProducts: nextProducts
        }
      });
    } catch (e) {}

    // 5. BACKGROUND SYNC: WAJIB masukkan generatedId ini ke dalam payload saat operasi INSERT ke Supabase
    supabase
      .from('products')
      .insert([{
        id: generatedId, // ID INI HARUS SAMA DENGAN STATE LOKAL
        name: newProductObj.name,
        category: newProductObj.category,
        is_custom: true,
        user_id: newProductObj.user_id,
        base_price: rawPrice
      }])
      .then(({ error }) => {
        if (error) {
          console.warn('[Background sync notice]:', error.message);
        }
        // Simpan juga ke cloud config & fallback
        insertCustomProduct({ ...newProductObj, id: generatedId, base_price: rawPrice }).catch(() => {});
      })
      .catch((err) => {
        console.warn('[Background sync exception]:', err);
      });
  };

  // Handler hapus barang kustom: Supabase + LocalStorage + Realtime Broadcast + Cart Filter (Single-Click Delete)
  const handleDeleteCustomProduct = async (itemId, itemName) => {
    const activeUserId = currentUser?.id || currentUserRef.current?.id;

    // 1. Eksekusi hapus di database
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(itemId));
      let query = supabase.from('products').delete();
      if (isUuid) {
        query = query.eq('id', itemId);
      } else if (itemName) {
        query = query.eq('name', itemName);
      }
      if (activeUserId) {
        query = query.eq('user_id', activeUserId);
      }
      await query;
      await deleteCustomProduct(itemId, itemName, activeUserId);
    } catch (e) {
      console.warn('[Delete Custom Product DB Error]:', e);
    }

    // 2. Langsung hapus dari layar secara bersamaan tanpa delay
    let remainingProducts = [];
    setCustomProducts(prev => {
      remainingProducts = (prev || []).filter(p => p.id !== itemId && p.name?.toLowerCase() !== (itemName || '').toLowerCase());
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sakugrosir_custom_products_v1', JSON.stringify(remainingProducts));
      }
      return remainingProducts;
    });
    setRecommendedItems(prev => (prev || []).filter(item => item.id !== itemId && item.name?.toLowerCase() !== (itemName || '').toLowerCase()));
    setCartItems(prev => {
      const remainingCart = (prev || []).filter(item => item.id !== itemId && item.name?.toLowerCase() !== (itemName || '').toLowerCase());
      persistState(remainingCart);
      return remainingCart;
    });

    // Multi-device Broadcast Instan via Supabase Realtime WebSocket (0 DELAY)
    try {
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_PRODUCT_CHANGE',
        payload: {
          action: 'DELETE_PRODUCT',
          itemId: itemId,
          itemName: itemName,
          allProducts: remainingProducts
        }
      });
    } catch (e) {}

    try {
      await fetchRecommendedItems(activeUserId);
    } catch (e) {}
  };

  // Alias refreshCustomData ke fetchRecommendedItems untuk kompatibilitas props
  const refreshCustomData = fetchRecommendedItems;

  // =========================================================================
  // SUPABASE REALTIME SUBSCRIPTIONS (Cross-Device Sync & Zero Flickering)
  // Kunci useEffect Realtime: Menggunakan cleanup supabase.removeChannel & callback stabil
  // =========================================================================
  useEffect(() => {
    const targetUserId = currentUser?.id || currentUserRef.current?.id;
    if (!targetUserId) return;

    const channelName = `realtime-custom-sync-${targetUserId}`;
    const customChannel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `user_id=eq.${targetUserId}`
      }, (payload) => {
        console.log('⚡ [Realtime products change]:', payload);
        // Single Source of Truth: Panggil fetchRecommendedItems secara otomatis HANYA SATU KALI
        fetchRecommendedItems(targetUserId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_stores',
        filter: `user_id=eq.${targetUserId}`
      }, (payload) => {
        console.log('⚡ [Realtime custom_stores change]:', payload);
        fetchCustomStores(targetUserId);
      })
      .subscribe();

    return () => {
      // WAJIB removeChannel untuk mencegah memory leak, duplicate listeners & flickering loop
      supabase.removeChannel(customChannel);
    };
  }, [currentUser?.id, fetchRecommendedItems, fetchCustomStores]);

  const handleAddCustomStore = async (storeName) => {
    if (!storeName || !storeName.trim()) return;
    const cleanName = storeName.trim();
    const newStoreObj = await saveCustomStoreToSupabase(cleanName, currentUser?.id);
    await fetchCustomStores(currentUser?.id);
    setCurrentStore(cleanName);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STORE, cleanName);
    }
    // Broadcast perubahan ke perangkat lain secara realtime
    try {
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_STORE_ADDED_EVENT',
        payload: { store: cleanName, storeObj: newStoreObj, timestamp: Date.now() }
      });
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_CART_SYNC',
        payload: { store: cleanName, timestamp: Date.now() }
      });
    } catch (e) {}
  };

  // Splash & Initialization State
  const [showSplash, setShowSplash] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Simpan penanda ke sessionStorage saat splash screen nonaktif
  useEffect(() => {
    if (!showSplash && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.SPLASH_SHOWN, 'true');
      } catch (e) {}
    }
  }, [showSplash]);

  const handleSplashFinish = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.SPLASH_SHOWN, 'true');
      } catch (e) {}
    }
    setShowSplash(false);
  };

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isDigitalReceiptOpen, setIsDigitalReceiptOpen] = useState(false);
  const [digitalReceiptData, setDigitalReceiptData] = useState(null);
  const [isEmptyCartModalOpen, setIsEmptyCartModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Quick autofill state for input tab
  const [inputInitialValues, setInputInitialValues] = useState(null);

  // Refs for Multi-Device Realtime Sync & Firestore onSnapshot
  const isLocalMutatingRef = useRef(false);
  const firestoreDocRef = useRef(null);
  const firestoreSetDocRef = useRef(null);
  const supabaseSyncChannelRef = useRef(null);
  const loadCloudHistoryRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Ref penangkal glitch splash screen saat pengguna berpindah tab atau Alt+Tab
  const isTabSwitchRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isTabSwitchRef.current = true;
      } else if (document.visibilityState === 'visible') {
        // Beri jeda proteksi 1500ms setelah tab aktif kembali agar event auth/focus background tidak memicu splash
        setTimeout(() => {
          isTabSwitchRef.current = false;
        }, 1500);
      }
    };

    const handleWindowFocus = () => {
      isTabSwitchRef.current = true;
      setTimeout(() => {
        isTabSwitchRef.current = false;
      }, 1500);
    };

    const handleWindowBlur = () => {
      isTabSwitchRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // 1. Initialize State & LocalStorage Persistence safely after client mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    try {
      // a. Cek status autentikasi dari LocalStorage
      const isAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.USER);
      const sessionSplash = sessionStorage.getItem(STORAGE_KEYS.SPLASH_SHOWN);

      if (isAuth === 'true' && savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          if (parsedUser && parsedUser.id) {
            setCurrentUser(parsedUser);
            setIsAuthenticated(true);
            setShowSplash(false);
            setIsInitializing(true);

            // Isolasi keranjang belanja untuk akun aktif
            const userCartKey = `${STORAGE_KEYS.CART}_${parsedUser.id}`;
            const savedCart = localStorage.getItem(userCartKey) || localStorage.getItem(STORAGE_KEYS.CART);
            if (savedCart) {
              try {
                const parsedCart = JSON.parse(savedCart);
                if (Array.isArray(parsedCart)) {
                  setCartItems(parsedCart.map((item) => {
                    const clean = { ...item };
                    delete clean.image;
                    return clean;
                  }));
                }
              } catch (e) {}
            }

            if (typeof loadCloudHistoryRef.current === 'function') {
              loadCloudHistoryRef.current(parsedUser.id);
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (e) {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        // Tampilkan splash screen pembuka hanya pada kunjungan pertama sesi ini
        if (sessionSplash !== 'true') {
          setShowSplash(true);
        } else {
          setShowSplash(false);
        }
      }

      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (savedBudget) setBudgetLimit(Number(savedBudget));

      const savedStore = localStorage.getItem(STORAGE_KEYS.STORE);
      if (savedStore) setCurrentStore(savedStore);

      const savedDate = localStorage.getItem(STORAGE_KEYS.DATE);
      if (savedDate) {
        setTransactionDate(savedDate);
      } else {
        setTransactionDate(toIndoDisplayDate(new Date()));
      }

      // Area 3: Prioritas Sumber Data (Supabase vs LocalStorage)
      // Jika pengguna sedang login (isAuth === 'true'), data MURNI HANYA dari Supabase.
      // DILARANG memuat savedHistory dari LocalStorage saat login agar tidak muncul ghost data.
      if (isAuth !== 'true') {
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (savedHistory) {
          try {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed)) {
              setHistoryList(parsed);
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }

    // b. Auto-update Service Worker & bersihkan cache lama di browser laptop/HP
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name !== 'sakugrosir-pwa-v7') {
            caches.delete(name);
          }
        });
      }).catch(() => {});
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.update().catch(() => {});
      }).catch(() => {});
    }

    // 2. Tangani Google OAuth Callback Redirect jika ada di URL hash (#access_token=...)
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        if (accessToken) {
          const payloadBase64 = accessToken.split('.')[1];
          if (payloadBase64) {
            const jsonStr = decodeURIComponent(
              atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonStr);
            const email = payload.email || payload.user_metadata?.email;
            const name = payload.user_metadata?.full_name || payload.user_metadata?.name || email?.split('@')[0];
            const avatar = payload.user_metadata?.avatar_url || payload.user_metadata?.picture || null;

            if (email) {
              const profile = {
                id: payload.sub || 'user-google-' + Date.now(),
                name: name || (email ? email.split('@')[0] : 'Pengguna'),
                email: email,
                avatar_url: avatar,
                provider: 'google',
                role: 'user',
                authenticated_at: new Date().toISOString()
              };

              saveDeviceAccount(profile);
              setCurrentUser(profile);
              setIsAuthenticated(true);
              setActiveTab('cart');
              setAuthErrorMessage('');

              localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));

              // Jika jendela ini adalah pop-up Google OAuth, kirim data ke jendela utama dan tutup pop-up
              if (window.opener && window.opener !== window) {
                try {
                  window.opener.postMessage({
                    type: 'SUPABASE_OAUTH_TOKEN_TRANSFER',
                    hash: window.location.hash,
                    user: {
                      id: payload.sub,
                      email: email,
                      user_metadata: {
                        full_name: name,
                        avatar_url: avatar
                      }
                    }
                  }, '*');
                  window.close();
                  return;
                } catch (e) {
                  try { window.close(); } catch (err) {}
                }
              }

              // Bersihkan token dari address bar agar URL kembali rapi
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          }
        }
      } catch (oauthErr) {
        console.warn('[Google OAuth Callback Parse Error]:', oauthErr);
      }
    }

    // 3. Listener PostMessage dari Google OAuth Callback
    const handleOAuthMessage = async (event) => {
      if (event.data?.type === 'SUPABASE_OAUTH_TOKEN_TRANSFER') {
        const u = event.data.user || {};
        const meta = u.user_metadata || {};
        let email = u.email || meta.email || '';
        let name = meta.full_name || meta.name || u.name || '';
        let avatar = meta.avatar_url || meta.picture || u.avatar_url || null;

        if (event.data.hash && event.data.hash.includes('access_token')) {
          try {
            const params = new URLSearchParams(event.data.hash.replace(/^#/, ''));
            const at = params.get('access_token');
            const rt = params.get('refresh_token');
            if (at) {
              try {
                await supabase.auth.setSession({
                  access_token: at,
                  refresh_token: rt || at
                });
              } catch (e) {}

              const payload = JSON.parse(decodeURIComponent(
                atob(at.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
                  .split('')
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              ));
              email = email || payload.email || payload.user_metadata?.email || '';
              name = name || payload.user_metadata?.full_name || payload.user_metadata?.name || '';
              avatar = avatar || payload.user_metadata?.avatar_url || payload.user_metadata?.picture || null;
            }
          } catch (e) {}
        }

        if (email) {
          const profile = {
            id: u.id || 'user-google-' + Date.now(),
            name: name || email.split('@')[0],
            email: email,
            avatar_url: avatar,
            provider: 'google',
            role: 'user',
            authenticated_at: new Date().toISOString()
          };

          saveDeviceAccount(profile);
          setCurrentUser(profile);
          setIsAuthenticated(true);
          setActiveTab('cart');
          setAuthErrorMessage('');

          // Tampilkan SentinelLoadingScreen pasca-login
          if (!isTabSwitchRef.current && !isAuthenticated) {
            setIsInitializing(true);
          }

          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(STORAGE_KEYS.SPLASH_SHOWN, 'true');
            } catch (e) {}
          }

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
          }
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    // 4. Sesi Supabase getSession (Auto-Restore jika ada sesi aktif)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const profile = {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          email: u.email,
          avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          user_metadata: u.user_metadata || {},
          provider: session.user.app_metadata?.provider || 'supabase',
          role: 'user',
          authenticated_at: new Date().toISOString()
        };
        saveDeviceAccount(profile);
        setCurrentUser(profile);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_KEYS.SPLASH_SHOWN, 'true');
          } catch (e) {}
        }

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
        }
      }
    }).catch(() => {});

    // Multi-Device Cloud History Synchronization Terisolasi per User ID (Pencegahan Data Bleeding)
    const fetchCloudHistory = async (overrideUserId = null) => {
      try {
        let activeUid = overrideUserId || currentUserRef.current?.id;
        if (!activeUid && typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem(STORAGE_KEYS.USER);
            if (saved) {
              const parsed = JSON.parse(saved);
              activeUid = parsed?.id;
            }
          } catch (e) {}
        }

        // Ambil data riwayat murni langsung dari Supabase Cloud (Single Source of Truth)
        const cloudHistory = await getShoppingHistoryList(activeUid);

        // Area 1 & 3: Jika query dari Supabase mengembalikan array (baik ada isi atau kosong []):
        // State aplikasi HARUS menerima data murni tersebut dan TIDAK BOLEH fallback ke mock data.
        if (Array.isArray(cloudHistory)) {
          setHistoryList(cloudHistory);

          if (typeof localStorage !== 'undefined') {
            if (cloudHistory.length > 0) {
              localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(cloudHistory));
              if (activeUid) {
                localStorage.setItem(`${STORAGE_KEYS.HISTORY}_${activeUid}`, JSON.stringify(cloudHistory));
              }
            } else {
              // Jika data di cloud sudah kosong ([]), bersihkan juga localStorage agar tidak ada data hantu tertinggal
              localStorage.removeItem(STORAGE_KEYS.HISTORY);
              localStorage.removeItem('shoppingHistory');
              localStorage.removeItem('history');
              if (activeUid) {
                localStorage.removeItem(`${STORAGE_KEYS.HISTORY}_${activeUid}`);
              }
            }
          }
        }
      } catch (e) {
        console.warn('[CloudHistory] Fetch error:', e);
        // Jangan menyuntikkan mock data apapun saat error
      }
    };
    loadCloudHistoryRef.current = fetchCloudHistory;
    if (currentUser?.id) {
      fetchCloudHistory(currentUser.id);
    }

    // Setup Multi-tab BroadcastChannel (Same Machine / Browser Tabs)
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('smart_grocery_sentinel_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SYNC_STATE' && !isLocalMutatingRef.current) {
            if (event.data.cart) setCartItems(event.data.cart);
            if (event.data.budget) setBudgetLimit(event.data.budget);
            if (event.data.store) setCurrentStore(event.data.store);
            if (event.data.date) setTransactionDate(event.data.date);
          }
        };
        broadcastChannelRef.current = bc;
      } catch (e) {}
    }

    // 1. Supabase Realtime Multi-Device Sync Channel (Instant Cross-Device Sync)
    const realtimeChannel = supabase.channel('shopping_session_sync', {
      config: { broadcast: { self: false } }
    });

    realtimeChannel
      .on('broadcast', { event: 'REALTIME_CART_SYNC' }, (payload) => {
        const data = payload?.payload;
        if (!data || isLocalMutatingRef.current) return;
        console.log('⚡ [Realtime Cart Sync Event]:', data);

        if (data.cart && Array.isArray(data.cart)) {
          setCartItems(data.cart);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(data.cart));
          }
        }
        if (data.budget !== undefined) {
          const b = Number(data.budget);
          setBudgetLimit(b);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.BUDGET, String(b));
          }
        }
        if (data.store) {
          setCurrentStore(data.store);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.STORE, data.store);
          }
          // Jika lokasi adalah kustom, pastikan otomatis masuk ke pilihan customSupermarkets di HP/Laptop
          setCustomSupermarkets(prev => {
            const isDef = ['Lotte Mart - Puri Indah', 'Lotte Mart Grocery - Puri Indah', 'Super Indo - Pesanggrahan', 'Hypermart - Puri Mall', 'Indogrosir Daan Mogot'].some(
              d => d.toLowerCase() === data.store.toLowerCase()
            );
            if (!isDef && !prev.some(s => (typeof s === 'string' ? s : s.name || s.store_name).toLowerCase() === data.store.toLowerCase())) {
              const newCustom = {
                id: 'store-' + Date.now(),
                name: data.store,
                store_name: data.store,
                isCustom: true
              };
              const updated = [...prev, newCustom];
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(updated));
              }
              return updated;
            }
            return prev;
          });
        }
        if (data.customStores && Array.isArray(data.customStores)) {
          setCustomSupermarkets(data.customStores);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(data.customStores));
          }
        }
        if (data.customProducts && Array.isArray(data.customProducts) && data.customProducts.length > 0) {
          fetchRecommendedItems();
        }
        if (data.date) {
          setTransactionDate(data.date);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.DATE, data.date);
          }
        }
        setSyncStatus('Realtime Multi-Device Live');
      })
      .on('broadcast', { event: 'REALTIME_STORE_CHANGE' }, (payload) => {
        const data = payload?.payload;
        if (!data || isLocalMutatingRef.current) return;
        console.log('⚡ [Realtime Store Change Event]:', data);

        if (data.action === 'ADD_STORE') {
          if (data.allStores && Array.isArray(data.allStores)) {
            setCustomSupermarkets(data.allStores);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(data.allStores));
            }
          } else if (data.store) {
            setCustomSupermarkets(prev => {
              const sName = data.store.name || data.store.store_name;
              if (prev.some(s => (typeof s === 'string' ? s : s.name || s.store_name).toLowerCase() === sName.toLowerCase())) {
                return prev;
              }
              const updated = [...prev, data.store];
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(updated));
              }
              return updated;
            });
          }
          if (data.selectedStore) {
            setCurrentStore(data.selectedStore);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.STORE, data.selectedStore);
            }
          }
        } else if (data.action === 'DELETE_STORE') {
          if (data.allStores && Array.isArray(data.allStores)) {
            setCustomSupermarkets(data.allStores);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(data.allStores));
            }
          } else {
            setCustomSupermarkets(prev => {
              const updated = prev.filter(s => {
                const sId = typeof s === 'object' ? s.id : null;
                const sName = typeof s === 'string' ? s : (s.name || s.store_name);
                if (data.storeId && sId === data.storeId) return false;
                if (data.storeName && sName === data.storeName) return false;
                return true;
              });
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(updated));
              }
              return updated;
            });
          }
          if (data.selectedStore) {
            setCurrentStore(data.selectedStore);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.STORE, data.selectedStore);
            }
          }
        }
      })
      .on('broadcast', { event: 'REALTIME_PRODUCT_CHANGE' }, (payload) => {
        const data = payload?.payload;
        if (!data || isLocalMutatingRef.current) return;
        console.log('⚡ [Realtime Product Change Event]:', data);

        // Panggil fetchRecommendedItems untuk sinkronisasi tanpa race condition
        fetchRecommendedItems();
      })
      .on('broadcast', { event: 'REALTIME_CHECKOUT_EVENT' }, () => {
        // Multi-device: Ambil history terupdate dari cloud dan kosongkan keranjang aktif
        if (typeof loadCloudHistoryRef.current === 'function') {
          loadCloudHistoryRef.current();
        }
        setCartItems([]);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grocery_history' }, () => {
        fetchCloudHistory();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'grocery_history' }, () => {
        fetchCloudHistory();
      })
      .on('broadcast', { event: 'REALTIME_DELETE_EVENT' }, (payload) => {
        const tripId = payload?.payload?.tripId;
        if (tripId) {
          setHistoryList(prev => {
            const updated = (prev || []).filter(h => h.id !== tripId);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
            }
            return updated;
          });
        }
      })
      .on('broadcast', { event: 'REALTIME_CLEAR_ALL_HISTORY_EVENT' }, () => {
        setHistoryList([]);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
        }
      })
      .on('broadcast', { event: 'REALTIME_STORE_ADDED_EVENT' }, (payload) => {
        console.log('⚡ [Realtime Store Added Broadcast]:', payload);
        fetchCustomStores();
        if (payload?.payload?.store) {
          setCurrentStore(payload.payload.store);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('Realtime Multi-Device Live');
        }
      });

    supabaseSyncChannelRef.current = realtimeChannel;

    // 2. Firebase Cloud Firestore onSnapshot Realtime Listener (SRS F-06B)
    // DILARANG menggunakan getDoc() / getDocs() sekali panggil!
    // Wajib menggunakan onSnapshot() untuk mendengarkan mutasi data seketika tanpa reload browser
    let unsubscribeFirestore = null;
    const initFirestoreSync = async () => {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getFirestore, doc, onSnapshot, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        const app = initializeApp({
          apiKey: "AIzaSyDemoSmartGroceryTracker2026Mb2",
          projectId: "smart-grocery-price-tracker"
        }, 'sentinel_app_' + Date.now());
        
        const db = getFirestore(app);
        const sessionRef = doc(db, 'shopping_sessions', 'lotte_mart_puri_indah_dt2');
        firestoreDocRef.current = sessionRef;
        firestoreSetDocRef.current = setDoc;

        unsubscribeFirestore = onSnapshot(sessionRef, (snap) => {
          if (snap.exists() && !isLocalMutatingRef.current) {
            const data = snap.data();
            console.log('⚡ [Firestore onSnapshot Event]:', data);
            setSyncStatus('Firestore Live');

            if (data.items && Array.isArray(data.items)) {
              setCartItems(data.items);
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(data.items));
              }
            }
            if (data.budget_limit) {
              const b = Number(data.budget_limit);
              setBudgetLimit(b);
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.BUDGET, String(b));
              }
            }
            if (data.store_name) {
              setCurrentStore(data.store_name);
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.STORE, data.store_name);
              }
            }
            if (data.transaction_date) {
              setTransactionDate(data.transaction_date);
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.DATE, data.transaction_date);
              }
            }
          }
        }, (err) => {
          console.warn('[Firestore onSnapshot Status]:', err.message);
        });
      } catch (err) {
        console.warn('[Firestore Init Error]:', err.message);
      }
    };

    initFirestoreSync();

    // 4. Live Supabase Auth State Change Listener
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('⚡ [Supabase onAuthStateChange Event]:', event);

      // PENTING: Jika pengguna sedang dalam proses registrasi akun baru, DILARANG auto-login!
      if (typeof window !== 'undefined' && window.__isRegistering) {
        console.log('⚡ [Supabase onAuthStateChange]: Pendaftaran akun baru sedang berlangsung, abaikan event auto-login.');
        return;
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
        const u = session.user;

        // Jika jendela saat ini adalah pop-up Google OAuth, kirim session ke jendela utama dan tutup pop-up seketika
        if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
          try {
            window.opener.postMessage({
              type: 'SUPABASE_OAUTH_TOKEN_TRANSFER',
              user: u
            }, '*');
            window.close();
            return;
          } catch (e) {
            try { window.close(); } catch (err) {}
            return;
          }
        }

        const profile = {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          email: u.email,
          avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          user_metadata: u.user_metadata || {},
          provider: session.user.app_metadata?.provider || 'supabase',
          role: 'user',
          authenticated_at: new Date().toISOString()
        };

        saveDeviceAccount(profile);
        setCurrentUser(profile);
        setIsAuthenticated(true);
        setAuthErrorMessage('');

        // Tampilkan SentinelLoadingScreen pasca-login (DILARANG jika user hanya pindah tab)
        if (event === 'SIGNED_IN' && !isTabSwitchRef.current && !isAuthenticated) {
          setIsInitializing(true);
        }
        if (typeof loadCloudHistoryRef.current === 'function') {
          loadCloudHistoryRef.current(u.id);
        }

        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_KEYS.SPLASH_SHOWN, 'true');
          } catch (e) {}
        }

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCartItems([]);
        setHistoryList([]);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('cartItems');
          localStorage.removeItem('budgetLimit');
          localStorage.removeItem('shoppingHistory');
          localStorage.removeItem(STORAGE_KEYS.AUTH);
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.CART);
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
          localStorage.removeItem(STORAGE_KEYS.BUDGET);
        }
      }
    });

    return () => {
      window.removeEventListener('message', handleOAuthMessage);
      broadcastChannelRef.current?.close();
      if (supabaseSyncChannelRef.current) {
        supabase.removeChannel(supabaseSyncChannelRef.current);
      }
      if (unsubscribeFirestore) unsubscribeFirestore();
      authSub?.unsubscribe();
    };
  }, []);

  // Auto-Sync Riwayat Belanja saat pengguna membuka tab Riwayat
  useEffect(() => {
    if (activeTab === 'history' && typeof loadCloudHistoryRef.current === 'function') {
      loadCloudHistoryRef.current(currentUser?.id);
    }
  }, [activeTab, currentUser]);

  // Broadcast & Save changes to LocalStorage & Realtime Cloud (Multi-Device Sync)
  const persistState = (newCart, newBudget, newStore, newDate, newCustomStores, newCustomProducts) => {
    if (typeof localStorage === 'undefined') return;

    const rawCart = newCart !== undefined ? newCart : cartItems;
    const finalCart = (rawCart || []).map((item) => ({
      ...item,
      image: item.image || getProductImage(item.name, item.category)
    }));
    const finalBudget = newBudget !== undefined ? newBudget : budgetLimit;
    const finalStore = newStore !== undefined ? newStore : currentStore;
    const finalDate = newDate !== undefined ? newDate : transactionDate;
    const finalCustomStores = newCustomStores !== undefined ? newCustomStores : customSupermarkets;
    const finalCustomProducts = newCustomProducts !== undefined ? newCustomProducts : customProducts;

    if (newCart !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(finalCart));
      if (currentUser?.id) {
        localStorage.setItem(`${STORAGE_KEYS.CART}_${currentUser.id}`, JSON.stringify(finalCart));
      }
    }
    if (newBudget !== undefined) {
      localStorage.setItem(STORAGE_KEYS.BUDGET, String(newBudget));
    }
    if (newStore !== undefined) {
      localStorage.setItem(STORAGE_KEYS.STORE, newStore);
    }
    if (newDate !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DATE, newDate);
    }
    if (newCustomStores !== undefined) {
      localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(newCustomStores));
    }
    if (newCustomProducts !== undefined) {
      localStorage.setItem('sakugrosir_custom_products_v1', JSON.stringify(newCustomProducts));
    }

    // Flag mutasi lokal sementara agar listener realtime tidak memicu echo-loop
    isLocalMutatingRef.current = true;
    setTimeout(() => { isLocalMutatingRef.current = false; }, 400);

    const payload = {
      cart: finalCart,
      budget: finalBudget,
      store: finalStore,
      date: finalDate,
      customStores: finalCustomStores,
      customProducts: finalCustomProducts,
      timestamp: Date.now()
    };

    // 1. Broadcast ke perangkat lain seketika via Supabase Realtime WebSocket (0 DELAY)
    try {
      supabaseSyncChannelRef.current?.send({
        type: 'broadcast',
        event: 'REALTIME_CART_SYNC',
        payload: payload
      });
    } catch (e) {}

    // 2. Simpan ke dokumen sesi Cloud Firestore
    if (firestoreDocRef.current && firestoreSetDocRef.current) {
      try {
        firestoreSetDocRef.current(firestoreDocRef.current, {
          store_name: finalStore,
          transaction_date: finalDate,
          budget_limit: finalBudget,
          items: finalCart,
          timestamp: Date.now()
        }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    // 3. Broadcast ke tab lain di browser perangkat yang sama
    try {
      broadcastChannelRef.current?.postMessage({
        type: 'SYNC_STATE',
        ...payload
      });
    } catch (e) {}
  };

  // Auth Operations
  const handleLoginSuccess = (userProfile) => {
    // DILARANG memicu splash screen jika user sedang pindah tab / Alt+Tab
    if (isTabSwitchRef.current) {
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      return;
    }

    // Jika user sudah login di akun yang sama, jangan re-trigger splash screen
    if (isAuthenticated && currentUser?.id === userProfile?.id) {
      return;
    }

    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    setActiveTab('cart');

    // 1. Isolasi Keranjang: Akun baru/berpindah akun mulai dari keranjang kosong jika belum ada transaksi untuk akun ini
    const userCartKey = `${STORAGE_KEYS.CART}_${userProfile.id}`;
    let initialUserCart = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(userCartKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            initialUserCart = parsed.map((item) => ({
              ...item,
              image: item.image || getProductImage(item.name, item.category)
            }));
          }
        }
      } catch (e) {}
    }
    setCartItems(initialUserCart);
    setHistoryList([]);

    // 2. Tampilkan SentinelLoadingScreen pasca-login
    setIsInitializing(true);

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.SPLASH_SHOWN, 'true');
      } catch (e) {}
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(initialUserCart));
      localStorage.setItem(userCartKey, JSON.stringify(initialUserCart));
    }

    // 3. Ambil histori belanja yang murni hanya milik akun ini dari database Supabase
    if (typeof loadCloudHistoryRef.current === 'function') {
      loadCloudHistoryRef.current(userProfile.id);
    }
  };

  const handleLogout = async () => {
    playTapSound();
    try {
      await signOutUser();
    } catch (e) {}

    // 1. Reset seluruh React State ke kondisi awal bersih (Pencegahan Data Bleeding)
    setCartItems([]);
    setHistoryList([]);
    setCustomProducts([]);
    setCustomSupermarkets([]);
    setRecommendedItems(baseDefaultItems);
    setBudgetLimit(350000);
    setCurrentStore('Lotte Mart - Puri Indah');
    setTransactionDate(toIndoDisplayDate(new Date()));
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsInitializing(false);
    setIsProfileModalOpen(false);
    setShowSplash(false);

    // 2. Pembersihan Total LocalStorage (Termasuk keys yang diminta user)
    if (typeof localStorage !== 'undefined') {
      // Hapus kunci spesifik yang diminta user
      localStorage.removeItem('cartItems');
      localStorage.removeItem('budgetLimit');
      localStorage.removeItem('shoppingHistory');

      // Hapus kunci state aplikasi
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.BUDGET);
      localStorage.removeItem(STORAGE_KEYS.STORE);
      localStorage.removeItem(STORAGE_KEYS.DATE);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.SPLASH_SHOWN);

      // Hapus custom data
      localStorage.removeItem('sakugrosir_custom_stores_v1');
      localStorage.removeItem('sakugrosir_custom_products_v1');

      // Hapus kunci session/offline
      localStorage.removeItem(SINGLE_USER_STORAGE_KEY);
      localStorage.removeItem('sakugrosir_is_logged_in');
      localStorage.removeItem('sakugrosir_offline_history');
      localStorage.removeItem('sakugrosir_offline_budget');
      localStorage.removeItem('sakugrosir_sample_history_initialized');
    }
  };

  // Cart Operations
  const handleUpdateQuantity = (productId, newQty) => {
    setCartItems((prev) => {
      let updated;
      if (newQty <= 0) {
        updated = prev.filter((i) => i.id !== productId);
      } else {
        updated = prev.map((i) => (i.id === productId ? { ...i, quantity: newQty } : i));
      }
      persistState(updated);
      return updated;
    });
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== productId);
      persistState(updated);
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    persistState([]);
  };

  const handleAddToCart = (newItem) => {
    if (!newItem) return;
    const cleanItem = {
      ...newItem
    };
    delete cleanItem.image;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.name.toLowerCase() === cleanItem.name.toLowerCase());
      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + (cleanItem.quantity || 1) } : i
        );
      } else {
        updated = [cleanItem, ...prev];
      }
      persistState(updated);
      return updated;
    });
    setActiveTab('cart');
  };

  // Potong Sekunder: Automatically remove/cut secondary items to restore budget limit
  const handleCutSecondaryItems = () => {
    playSuccessSound();
    setCartItems((prev) => {
      const remainingItems = prev.filter((i) => !i.isSecondary);
      persistState(remainingItems);
      return remainingItems;
    });
  };

  // Scenario Loader
  const handleLoadMockupNormal = () => {
    setBudgetLimit(350000);
    setCartItems(MOCKUP_NORMAL_CART);
    persistState(MOCKUP_NORMAL_CART, 350000);
  };

  const handleLoadMockupOverbudget = () => {
    setBudgetLimit(350000);
    setCartItems(MOCKUP_OVERBUDGET_CART);
    persistState(MOCKUP_OVERBUDGET_CART, 350000);
  };

  // Budget Cap Save
  const handleSaveBudgetLimit = (newLimit) => {
    setBudgetLimit(newLimit);
    persistState(undefined, newLimit);
    updateBudgetSettings(newLimit);
  };

  // Store & Date Save with Date Picker Standardization
  const handleSaveStore = (store, displayDate, isoDate) => {
    setCurrentStore(store);
    const finalDate = displayDate || toIndoDisplayDate(isoDate || new Date());
    setTransactionDate(finalDate);
    persistState(undefined, undefined, store, finalDate);
  };

  const handleDateChange = (displayDate, isoDate) => {
    const finalDate = displayDate || toIndoDisplayDate(isoDate || new Date());
    setTransactionDate(finalDate);
    persistState(undefined, undefined, undefined, finalDate);
  };

  // Delete History Handlers (Safety Modal Confirmation with Server Sync & Awaited Delete)
  const handleRequestDeleteTrip = (trip) => {
    setDeleteTargetItem(trip);
    setIsDeletingAll(false);
    setDeleteErrorMessage('');
    setIsDeletingLoading(false);
    setIsDeleteModalOpen(true);
  };

  const handleRequestClearAll = () => {
    setDeleteTargetItem(null);
    setIsDeletingAll(true);
    setDeleteErrorMessage('');
    setIsDeletingLoading(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeletingLoading(true);
    setDeleteErrorMessage('');

    try {
      if (isDeletingAll) {
        // a & b: Eksekusi await delete pada Supabase
        const res = await clearAllShoppingHistory(currentUser?.id);

        if (!res.success) {
          // d: JIKA ada error dari Supabase, tampilkan pesan error, JANGAN kosongkan layar
          setIsDeletingLoading(false);
          setDeleteErrorMessage(res.error || 'Gagal menghapus riwayat dari server Supabase.');
          return;
        }

        // c: JIKA tidak ada error dari Supabase, BARU kosongkan state React dan LocalStorage
        playSuccessSound();
        setHistoryList([]);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
          localStorage.removeItem('shoppingHistory');
          localStorage.removeItem('history');
          if (currentUser?.id) {
            localStorage.removeItem(`${STORAGE_KEYS.HISTORY}_${currentUser.id}`);
          }
        }
        try {
          supabaseSyncChannelRef.current?.send({
            type: 'broadcast',
            event: 'REALTIME_CLEAR_ALL_HISTORY_EVENT',
            payload: {}
          });
        } catch (e) {}

        setIsDeletingLoading(false);
        setIsDeleteModalOpen(false);
        setIsDeletingAll(false);
        setDeleteTargetItem(null);
      } else if (deleteTargetItem?.id) {
        const targetId = deleteTargetItem.id;
        const res = await deleteShoppingTrip(targetId, currentUser?.id);

        if (!res.success) {
          // d: JIKA ada error dari Supabase, tampilkan pesan error, JANGAN kosongkan layar
          setIsDeletingLoading(false);
          setDeleteErrorMessage(res.error || 'Gagal menghapus transaksi dari server Supabase.');
          return;
        }

        // c: JIKA tidak ada error dari Supabase, BARU update state React dan LocalStorage
        playSuccessSound();
        setHistoryList(prev => {
          const updated = (prev || []).filter(h => h.id !== targetId);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
            if (currentUser?.id) {
              localStorage.setItem(`${STORAGE_KEYS.HISTORY}_${currentUser.id}`, JSON.stringify(updated));
            }
          }
          return updated;
        });
        try {
          supabaseSyncChannelRef.current?.send({
            type: 'broadcast',
            event: 'REALTIME_DELETE_EVENT',
            payload: { tripId: targetId }
          });
        } catch (e) {}

        setIsDeletingLoading(false);
        setIsDeleteModalOpen(false);
        setDeleteTargetItem(null);
      }
    } catch (err) {
      setIsDeletingLoading(false);
      setDeleteErrorMessage(err.message || 'Terjadi kesalahan sistem saat menghapus data.');
    }
  };

  // Auto-Detect & Add to Cart untuk Pemindai Barcode
  const handleBarcodeScanned = (scanned) => {
    if (!scanned) return;

    let targetItem = null;
    let barcodeCode = '';

    if (typeof scanned === 'string') {
      barcodeCode = scanned.trim();
      targetItem = recommendedItems.find(
        (i) => String(i.barcode || i.code || i.id || '').trim() === barcodeCode
      );
    } else if (typeof scanned === 'object') {
      targetItem = scanned;
      barcodeCode = scanned.barcode || scanned.code || '';
    }

    if (targetItem) {
      playBarcodeBeep();
      const rawPrice = Number(String(targetItem.price || targetItem.base_price || 0).replace(/[^0-9]/g, ''));
      const itemToAdd = {
        ...targetItem,
        barcode: targetItem.barcode || barcodeCode,
        price: rawPrice,
        prices: targetItem.prices || generateDefaultPrices(rawPrice),
        quantity: 1
      };
      handleAddToCart(itemToAdd);
    } else {
      // AI Item Estimation Fallback
      playBarcodeBeep();
      let estimatedName = "Barang Kustom (" + barcodeCode + ")";
      let estimatedCategory = "📦 Yang Lainnya";
      let estimatedPrice = 15000;

      if (barcodeCode.startsWith('8993')) {
        estimatedCategory = "Minuman";
        estimatedPrice = 18000;
        estimatedName = `Minuman Kemasan (${barcodeCode})`;
      } else if (barcodeCode.startsWith('8994')) {
        estimatedCategory = "Peralatan Kebersihan";
        estimatedPrice = 22000;
        estimatedName = `Peralatan Kebersihan (${barcodeCode})`;
      } else if (barcodeCode.startsWith('8991') || barcodeCode.startsWith('8992')) {
        estimatedCategory = "Bahan Pokok";
        estimatedPrice = 15000;
        estimatedName = `Bahan Pokok (${barcodeCode})`;
      } else {
        estimatedCategory = "📦 Yang Lainnya";
        estimatedPrice = 15000;
        estimatedName = `Barang Kustom (${barcodeCode})`;
      }

      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const estimatedItem = {
        id: generateUUID(),
        name: estimatedName,
        category: estimatedCategory,
        unit: 'pcs',
        price: estimatedPrice,
        base_price: estimatedPrice,
        isCustom: true,
        barcode: barcodeCode,
        prices: generateDefaultPrices(estimatedPrice),
        quantity: 1
      };

      handleAddToCart(estimatedItem);
      try {
        insertCustomProduct(estimatedItem);
      } catch (err) {}
    }
  };

  // Checkout Save & Double Submit Prevention (Evaluasi Dinamis Berdasarkan Toko Terpilih)
  const totalCartPrice = cartItems.reduce((acc, i) => {
    const sp = getItemStorePrice(i, currentStore);
    const p = i.prices?.[currentStore]?.current || i.prices?.["Lotte Mart - Puri Indah"]?.current || sp.current || i.price || 0;
    return acc + (p * (i.quantity || 1));
  }, 0);

  const handleConfirmCheckout = async () => {
    // 1. Cegah eksekusi ganda jika sedang proses simpan atau keranjang kosong
    if (isCheckoutLoading) return;
    if (!cartItems || cartItems.length === 0) {
      setIsEmptyCartModalOpen(true);
      return;
    }
    setIsCheckoutLoading(true);

    try {
      // 2. Simpan transaksi secara permanen ke Supabase Cloud PostgreSQL
      const safeShoppingDate = toISODateString(transactionDate);

      // Hitung rincian subtotal, promo potongan, dan simulasi pajak PPN 11%
      const subtotalVal = cartItems.reduce((acc, i) => {
        const sp = getItemStorePrice(i, currentStore);
        const orig = i.prices?.[currentStore]?.history || i.prices?.["Lotte Mart - Puri Indah"]?.history || sp.history || i.originalPrice || sp.current || i.price || 0;
        return acc + (orig * (i.quantity || 1));
      }, 0);

      const promoVal = Math.max(0, subtotalVal - totalCartPrice);
      const pajakVal = Math.round(totalCartPrice * 0.11);
      const grandTotalVal = totalCartPrice + pajakVal;

      // Ambil snapshot lengkap data belanja untuk dicetak pada Struk Belanja Digital
      const receiptSnapshot = {
        id: 'TRX-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000),
        storeName: currentStore,
        store_name: currentStore,
        notes: currentStore,
        date: toIndoDisplayDate(safeShoppingDate),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        customerName: currentUser?.user_metadata?.full_name || currentUser?.name || currentUser?.email?.split('@')[0] || 'Pelanggan Setia',
        cashier: 'Self-Checkout (Smart Grocery)',
        items: cartItems.map(i => {
          const sp = getItemStorePrice(i, currentStore);
          const p = i.prices?.[currentStore]?.current || i.prices?.["Lotte Mart - Puri Indah"]?.current || sp.current || i.price || 0;
          const orig = i.prices?.[currentStore]?.history || i.prices?.["Lotte Mart - Puri Indah"]?.history || sp.history || i.originalPrice || p;
          return {
            name: i.name,
            price: p,
            originalPrice: orig,
            quantity: i.quantity || 1,
            unit: i.unit || 'pcs',
            category: i.category || 'Bahan Pokok'
          };
        }),
        subtotal: subtotalVal,
        promo: promoVal,
        pajak: pajakVal,
        grandTotal: grandTotalVal,
        rawTotalSpent: totalCartPrice
      };

      const saveRes = await saveShoppingTrip({
        user_id: currentUser?.id,
        shopping_date: safeShoppingDate,
        total_spent: totalCartPrice,
        notes: currentStore,
        store_name: currentStore,
        storeName: currentStore
      }, cartItems.map(i => {
        const sp = getItemStorePrice(i, currentStore);
        const p = i.prices?.[currentStore]?.current || i.prices?.["Lotte Mart - Puri Indah"]?.current || sp.current || i.price || 0;
        const orig = i.prices?.[currentStore]?.history || i.prices?.["Lotte Mart - Puri Indah"]?.history || sp.history || i.originalPrice || p;
        return {
          nama_barang: i.name,
          kategori: i.category,
          satuan: i.unit,
          kuantitas: i.quantity || 1,
          harga_satuan: orig,
          harga_akhir_per_satuan: p,
          total_harga_item: p * (i.quantity || 1)
        };
      }), currentUser?.id);

      // 3. Broadcast sinyal checkout ke perangkat lain via Realtime Channel
      try {
        supabaseSyncChannelRef.current?.send({
          type: 'broadcast',
          event: 'REALTIME_CHECKOUT_EVENT',
          payload: { timestamp: Date.now() }
        });
      } catch (e) {}

      // 4. Update data Single Source of Truth & Optimistic UI Update
      const activeUserId = currentUser?.id || currentUserRef.current?.id;
      const isLocalStorageFallback = saveRes?.source === 'localStorage_fallback' || saveRes?.source === 'local';

      const completedSession = {
        id: saveRes?.historyId || ('sesi-' + Date.now()),
        storeName: currentStore,
        store_name: currentStore,
        notes: currentStore,
        totalSpent: totalCartPrice,
        total_spent: totalCartPrice,
        savings: promoVal,
        date: toIndoDisplayDate(safeShoppingDate),
        shopping_date: safeShoppingDate,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        itemCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        items_count: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        statusTier: 'safe',
        statusBadge: isLocalStorageFallback ? 'Tersimpan Offline' : 'Transaksi Sukses',
        iconType: 'cart',
        items: cartItems.map(i => ({
          ...i,
          name: i.name,
          nama_barang: i.name,
          price: i.price,
          harga_akhir_per_satuan: i.price,
          quantity: i.quantity,
          kuantitas: i.quantity,
          unit: i.unit || 'pcs',
          satuan: i.unit || 'pcs'
        }))
      };

      // Segera update state historyList & LocalStorage agar UI langsung menampilkan riwayat seketika
      setHistoryList(prev => {
        const list = [completedSession, ...(prev || []).filter(h => h.id !== completedSession.id)];
        const unique = Array.from(new Map(list.map(item => [item.id, item])).values());
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(unique));
          if (activeUserId) {
            localStorage.setItem(`${STORAGE_KEYS.HISTORY}_${activeUserId}`, JSON.stringify(unique));
          }
        }
        return unique;
      });

      // Lakukan sync latar belakang dari server Supabase
      if (typeof loadCloudHistoryRef.current === 'function') {
        loadCloudHistoryRef.current(activeUserId).catch(() => {});
      }

      // 5. Buka Struk Belanja Digital tepat setelah transaksi & animasi selesai
      setDigitalReceiptData(receiptSnapshot);
      setIsCheckoutModalOpen(false);
      setIsDigitalReceiptOpen(true);
    } catch (err) {
      console.warn('[Checkout Cloud Save Error]:', err);
    } finally {
      // Kembalikan state loading ke false
      setIsCheckoutLoading(false);
      setIsCheckoutModalOpen(false);
    }
  };

  // Handler untuk menutup Struk Belanja Digital, mengosongkan keranjang, dan belanja lagi
  const handleFinishAndShopAgain = () => {
    playTapSound();
    setCartItems([]);
    persistState([]);
    setIsDigitalReceiptOpen(false);
    setDigitalReceiptData(null);
    setActiveTab('cart');
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'cart': return 'Keranjang Aktif';
      case 'input': return 'Katalog & Input';
      case 'history': return 'Riwayat Belanja';
      default: return 'Keranjang Aktif';
    }
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#e2e8f0] via-[#e8eff2] to-[#d6e6e6] flex items-center justify-center p-0 md:p-6 lg:p-8 font-sans selection:bg-emerald-800 selection:text-white">
        <div className="w-full max-w-[430px] bg-white min-h-screen md:min-h-[900px] md:max-h-[920px] md:rounded-[44px] shadow-2xl md:ring-12 md:ring-slate-800/90 overflow-hidden flex flex-col items-center justify-center relative">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center text-white shadow-md animate-pulse">
              <span className="text-2xl font-bold">🛒</span>
            </div>
            <span className="text-xs font-bold text-slate-500">Memuat Smart Grocery Sentinel...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e2e8f0] via-[#e8eff2] to-[#d6e6e6] flex items-center justify-center p-0 md:p-6 lg:p-8 font-sans selection:bg-emerald-800 selection:text-white">
      {/* Mobile Shell Mockup Wrapper (iPhone 16 Pro Max 430px Standard) */}
      <div className="w-full max-w-[430px] bg-white min-h-screen md:min-h-[900px] md:max-h-[920px] md:rounded-[44px] shadow-2xl md:ring-12 md:ring-slate-800/90 overflow-hidden flex flex-col relative transition-all duration-300">
        
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : isInitializing ? (
          <SentinelLoadingScreen onFinish={() => setIsInitializing(false)} />
        ) : (
          <>
            {/* ============================================================== */}
            {/* HEADER TOP BAR CONTAINER: Sticky Header dengan Background Troli Bergerak Kontinu */}
            {/* ============================================================== */}
            <header className="relative overflow-hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 shrink-0 sticky top-0 z-30 shadow-2xs">
              {/* Background Animasi Troli & Garis Angin Kecepatan Tinggi (Continuous Loop) */}
              <HeaderBackgroundTrolley />

              {/* Foreground UI Elements */}
              <div className="relative z-10">
                {/* Global Header Bar: Info Toko, Avatar, Tanggal, Limit Budget */}
                {isAuthenticated && (
                  <HeaderBar
                    currentStore={currentStore}
                    onOpenStoreModal={() => setIsStoreModalOpen(true)}
                    activeTabTitle={getActiveTabTitle()}
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsProfileModalOpen(true)}
                    syncStatus={syncStatus}
                    transactionDate={transactionDate}
                    onDateChange={handleDateChange}
                    budgetLimit={budgetLimit}
                    onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                  />
                )}
              </div>
            </header>

            {/* ============================================================== */}
            {/* VIEW 1: INITIAL LOGIN SCREEN (MOCKUP 1 - SMART GROCERY SENTINEL) */}
            {/* ============================================================== */}
            {!isAuthenticated ? (
              <div className="flex-1 overflow-y-auto no-scrollbar bg-gradient-to-b from-sky-50/50 via-white to-slate-50 flex flex-col">
                <LoginScreen 
                  onLoginSuccess={handleLoginSuccess} 
                  externalError={authErrorMessage}
                />
              </div>
            ) : (
              /* ============================================================== */
              /* VIEW 2: AUTHENTICATED APP (MOCKUPS 2, 3, 4, 5 + BOTTOM NAV)    */
              /* ============================================================== */
              <>
                {/* Scrollable Viewport Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-slate-50 relative">
                  {activeTab === 'cart' && (
                    <ActiveCartScreen
                      cartItems={cartItems}
                      budgetLimit={budgetLimit}
                      currentStore={currentStore}
                      transactionDate={transactionDate}
                      onDateChange={handleDateChange}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      onClearCart={handleClearCart}
                      onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                      onOpenStoreModal={() => setIsStoreModalOpen(true)}
                      onOpenCheckout={() => {
                        if (!cartItems || cartItems.length === 0) {
                          setIsEmptyCartModalOpen(true);
                          return;
                        }
                        setIsOrderSummaryOpen(true);
                      }}
                      onOpenBarcodeModal={() => setIsBarcodeModalOpen(true)}
                      onCutSecondaryItems={handleCutSecondaryItems}
                      onLoadMockupOverbudget={handleLoadMockupOverbudget}
                      onLoadMockupNormal={handleLoadMockupNormal}
                      onAddToCart={handleAddToCart}
                      recommendedItems={recommendedItems}
                      setRecommendedItems={setRecommendedItems}
                      setCartItems={setCartItems}
                      customProducts={customProducts}
                      onDeleteCustomProduct={handleDeleteCustomProduct}
                      onRefreshCustomProducts={refreshCustomData}
                      currentUser={currentUser}
                    />
                  )}

                  {activeTab === 'input' && (
                    <CatalogInputScreen
                      currentStore={currentStore}
                      currentRemainingBudget={Math.max(0, budgetLimit - totalCartPrice)}
                      onAddToCart={handleAddToCart}
                      onOpenBarcodeModal={() => setIsBarcodeModalOpen(true)}
                      initialValues={inputInitialValues}
                      historyList={historyList}
                      recommendedItems={recommendedItems}
                      onAddCustomProduct={handleAddCustomProduct}
                    />
                  )}

                  {activeTab === 'history' && (
                    <HistoryScreen
                      historyList={historyList}
                      onOpenReceiptDetail={(session) => {
                        setSelectedReceipt({
                          ...session,
                          storeName: session.storeName || session.store_name || session.notes || currentStore,
                          store_name: session.store_name || session.storeName || session.notes || currentStore
                        });
                      }}
                      onRequestDeleteTrip={handleRequestDeleteTrip}
                      onRequestClearAllHistory={handleRequestClearAll}
                    />
                  )}
                </div>

                {/* Permanent Bottom Navigation Bar (3 Menus: Keranjang Aktif, Katalog & Input, Riwayat Belanja) */}
                <BottomNav
                  activeTab={activeTab}
                  onChangeTab={(tabId) => setActiveTab(tabId)}
                  cartCount={cartItems.length}
                />

                {/* User Profile & Logout Modal */}
                <UserProfileModal
                  isOpen={isProfileModalOpen}
                  onClose={() => setIsProfileModalOpen(false)}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />

                {/* Interactive Functional Modals */}
                <BudgetLimitModal
                  isOpen={isBudgetModalOpen}
                  onClose={() => setIsBudgetModalOpen(false)}
                  currentLimit={budgetLimit}
                  onSaveLimit={handleSaveBudgetLimit}
                />

                <StoreModal
                  isOpen={isStoreModalOpen}
                  onClose={() => setIsStoreModalOpen(false)}
                  currentStore={currentStore}
                  currentDate={transactionDate}
                  onSaveStore={handleSaveStore}
                  customSupermarkets={customSupermarkets}
                  onAddNewStore={handleAddNewStore}
                  onDeleteCustomStore={handleDeleteCustomStore}
                  userId={currentUser?.id}
                  customStores={customStores}
                  onAddCustomStore={handleAddCustomStore}
                  currentUser={currentUser}
                />

                <BarcodeScannerModal
                  isOpen={isBarcodeModalOpen}
                  onClose={() => setIsBarcodeModalOpen(false)}
                  onScannedItem={handleBarcodeScanned}
                  catalogItems={recommendedItems}
                  onAddToCart={handleAddToCart}
                />

                <ReceiptDetailModal
                  isOpen={Boolean(selectedReceipt)}
                  onClose={() => setSelectedReceipt(null)}
                  session={selectedReceipt}
                  currentUser={{ ...currentUser, currentStore }}
                />

                <OrderSummaryModal
                  isOpen={isOrderSummaryOpen}
                  onClose={() => setIsOrderSummaryOpen(false)}
                  cartItems={cartItems}
                  totalSpent={totalCartPrice}
                  budgetLimit={budgetLimit}
                  storeName={currentStore}
                  onConfirmPay={() => {
                    setIsOrderSummaryOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                />

                <CheckoutModal
                  isOpen={isCheckoutModalOpen}
                  onClose={() => !isCheckoutLoading && setIsCheckoutModalOpen(false)}
                  totalSpent={totalCartPrice}
                  storeName={currentStore}
                  itemCount={cartItems.length}
                  cartItems={cartItems}
                  onConfirmCheckout={handleConfirmCheckout}
                  isCheckoutLoading={isCheckoutLoading}
                />

                <DigitalReceiptModal
                  isOpen={isDigitalReceiptOpen}
                  onClose={handleFinishAndShopAgain}
                  receiptData={digitalReceiptData}
                  onFinishAndShopAgain={handleFinishAndShopAgain}
                  currentUser={{ ...currentUser, currentStore }}
                />

                <EmptyCartModal
                  isOpen={isEmptyCartModalOpen}
                  onClose={() => setIsEmptyCartModalOpen(false)}
                />

                <DeleteConfirmationModal
                  isOpen={isDeleteModalOpen}
                  onClose={() => {
                    if (!isDeletingLoading) {
                      setIsDeleteModalOpen(false);
                      setDeleteErrorMessage('');
                    }
                  }}
                  onConfirmDelete={handleConfirmDelete}
                  targetItem={deleteTargetItem}
                  isDeletingAll={isDeletingAll}
                  isLoading={isDeletingLoading}
                  errorMessage={deleteErrorMessage}
                />
              </>
            )}
          </>
        )}

        {/* Home Indicator bar on mobile shell */}
        <div className="hidden md:flex justify-center pb-2 bg-white shrink-0 pointer-events-none">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </main>
  );
}
