'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CheckoutModal,
  UserProfileModal,
  DeleteConfirmationModal
} from './components/Modals';
import { 
  supabase, 
  getSingleUserSession, 
  signOutUser, 
  saveShoppingTrip, 
  getShoppingHistoryList,
  deleteShoppingTrip,
  clearAllShoppingHistory,
  updateBudgetSettings,
  saveDeviceAccount,
  isEmailRegistered
} from '../src/lib/supabaseClient';
import { toIndoDisplayDate, toISODateString } from './utils/date';
import { playTapSound, playSuccessSound } from './utils/sound';

// Storage Keys for LocalStorage Persistence
const STORAGE_KEYS = {
  CART: 'sakugrosir_cart_v1',
  BUDGET: 'sakugrosir_budget_v1',
  STORE: 'sakugrosir_store_name_v1',
  DATE: 'sakugrosir_trans_date_v1',
  HISTORY: 'sakugrosir_history_v1',
  USER: 'sakugrosir_single_user_v1',
  AUTH: 'sakugrosir_is_logged_in'
};

// Initial Mockup 2 Dataset (Normal: Rp 284.000 / Rp 350.000)
const MOCKUP_NORMAL_CART = [
  {
    id: 'prod-1',
    name: 'Beras Premium Rojolele 5kg',
    price: 74000,
    originalPrice: 74000,
    quantity: 1,
    unit: 'karung / 5kg',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 70000, // +Rp 4.000 vs bln lalu
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-2',
    name: 'Minyak Goreng Sania 2L',
    price: 33500,
    originalPrice: 39500,
    discountLabel: 'Diskon 15%',
    quantity: 2,
    unit: 'pouch / 2L',
    category: 'Bahan Pokok',
    isSecondary: false,
    lastMonthPrice: 36000, // -Rp 2.500 hemat vs bln lalu
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-3',
    name: 'Sabun Mandi Dettol Reff 450ml',
    price: 28500,
    originalPrice: 35000,
    discountLabel: 'Promo: 20% + 10%',
    quantity: 2,
    unit: 'pouch / 450ml',
    category: 'Perlengkapan Mandi',
    isSecondary: false,
    lastMonthPrice: 28500, // Harga Stabil
    image: 'https://images.unsplash.com/photo-1608248597359-54359483c6f8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-4',
    name: 'Susu UHT Full Cream Greenfields 1L',
    price: 21500,
    originalPrice: 21500,
    quantity: 4,
    unit: 'kotak / 1L',
    category: 'Produk Susu & Telur',
    isSecondary: false,
    lastMonthPrice: 20000, // +Rp 1.500 vs bln lalu
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  }
];

// Mockup 3 Dataset (Overbudget: Rp 382.500 / Rp 350.000)
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
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80'
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
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'over-3',
    name: 'Beras Premium Pandan Wangi 5kg',
    price: 78500,
    originalPrice: 78500,
    quantity: 1,
    unit: 'zak',
    category: 'Primer / Pokok',
    subcat: 'Kebutuhan Pokok Utama',
    isSecondary: false,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'over-4',
    name: 'Telur Ayam Negeri Fresh 1 Tray',
    price: 56000,
    originalPrice: 56000,
    quantity: 1,
    unit: 'tray',
    category: 'Primer / Protein',
    subcat: 'Protein Harian',
    isSecondary: false,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80'
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
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'
  }
];

export default function Home() {
  // Authentication State: Session persistence across reload / Ctrl+R
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (isAuth === 'true' && savedUser) {
        return true;
      }
    }
    return false;
  });
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  // Navigation State: 'cart' | 'input' | 'history'
  const [activeTab, setActiveTab] = useState('cart');

  // Core App State
  const [currentStore, setCurrentStore] = useState('Lotte Mart - Puri Indah');
  const [transactionDate, setTransactionDate] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.DATE);
        if (saved) return saved;
      } catch (e) {}
    }
    return toIndoDisplayDate(new Date());
  });
  const [budgetLimit, setBudgetLimit] = useState(350000);
  const [cartItems, setCartItems] = useState(MOCKUP_NORMAL_CART);
  const [historyList, setHistoryList] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) return JSON.parse(savedUser);
      } catch (e) {}
    }
    return null;
  });
  const [syncStatus, setSyncStatus] = useState('Online Sync Live');

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Quick autofill state for input tab
  const [inputInitialValues, setInputInitialValues] = useState(null);

  // Refs for Multi-Device Realtime Sync & Firestore onSnapshot
  const isLocalMutatingRef = useRef(false);
  const firestoreDocRef = useRef(null);
  const firestoreSetDocRef = useRef(null);
  const supabaseSyncChannelRef = useRef(null);
  const loadCloudHistoryRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // 1. Initialize State & LocalStorage Persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) setCartItems(JSON.parse(savedCart));

      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (savedBudget) setBudgetLimit(Number(savedBudget));

      const savedStore = localStorage.getItem(STORAGE_KEYS.STORE);
      if (savedStore) setCurrentStore(savedStore);

      const savedDate = localStorage.getItem(STORAGE_KEYS.DATE);
      if (savedDate) setTransactionDate(savedDate);

      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            const unique = Array.from(new Map(parsed.map(item => [item?.id || Math.random(), item])).values());
            setHistoryList(unique);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
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
          provider: session.user.app_metadata?.provider || 'supabase',
          role: 'user',
          authenticated_at: new Date().toISOString()
        };
        saveDeviceAccount(profile);
        setCurrentUser(profile);
        setIsAuthenticated(true);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
        }
      }
    }).catch(() => {});

    // Multi-Device Cloud History Synchronization (Single Source of Truth)
    const fetchCloudHistory = async () => {
      try {
        const cloudHistory = await getShoppingHistoryList();
        if (cloudHistory && Array.isArray(cloudHistory)) {
          setHistoryList(() => {
            // Deduplikasi array berdasarkan ID unik - Cloud sebagai Single Source of Truth
            const uniqueHistory = Array.from(
              new Map(cloudHistory.map(item => [item?.id, item])).values()
            ).filter(Boolean);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(uniqueHistory));
            }
            return uniqueHistory;
          });
        }
      } catch (e) {
        console.warn('[CloudHistory] Fetch error:', e);
      }
    };
    loadCloudHistoryRef.current = fetchCloudHistory;
    fetchCloudHistory();

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
        }
        if (data.date) {
          setTransactionDate(data.date);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.DATE, data.date);
          }
        }
        setSyncStatus('Realtime Multi-Device Live');
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

      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
        const u = session.user;
        const profile = {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          email: u.email,
          avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          provider: session.user.app_metadata?.provider || 'supabase',
          role: 'user',
          authenticated_at: new Date().toISOString()
        };

        saveDeviceAccount(profile);
        setCurrentUser(profile);
        setIsAuthenticated(true);
        setAuthErrorMessage('');

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(null);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH);
          localStorage.removeItem(STORAGE_KEYS.USER);
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
      loadCloudHistoryRef.current();
    }
  }, [activeTab]);

  // Broadcast & Save changes to LocalStorage & Realtime Cloud (Multi-Device Sync)
  const persistState = (newCart, newBudget, newStore, newDate) => {
    if (typeof localStorage === 'undefined') return;

    const finalCart = newCart !== undefined ? newCart : cartItems;
    const finalBudget = newBudget !== undefined ? newBudget : budgetLimit;
    const finalStore = newStore !== undefined ? newStore : currentStore;
    const finalDate = newDate !== undefined ? newDate : transactionDate;

    if (newCart !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newCart));
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

    // Flag mutasi lokal sementara agar listener realtime tidak memicu echo-loop
    isLocalMutatingRef.current = true;
    setTimeout(() => { isLocalMutatingRef.current = false; }, 400);

    const payload = {
      cart: finalCart,
      budget: finalBudget,
      store: finalStore,
      date: finalDate,
      timestamp: Date.now()
    };

    // 1. Broadcast ke perangkat lain seketika via Supabase Realtime WebSocket
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
    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    setActiveTab('cart');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
    }
  };

  const handleLogout = async () => {
    playTapSound();
    try {
      await signOutUser();
    } catch (e) {}
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsProfileModalOpen(false);
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
    setCartItems((prev) => {
      const existing = prev.find((i) => i.name.toLowerCase() === newItem.name.toLowerCase());
      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      } else {
        updated = [newItem, ...prev];
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

  // Delete History Handlers (Safety Modal Confirmation)
  const handleRequestDeleteTrip = (trip) => {
    setDeleteTargetItem(trip);
    setIsDeletingAll(false);
    setIsDeleteModalOpen(true);
  };

  const handleRequestClearAll = () => {
    setDeleteTargetItem(null);
    setIsDeletingAll(true);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    playSuccessSound();
    setIsDeleteModalOpen(false);

    if (isDeletingAll) {
      setHistoryList([]);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      }
      try {
        supabaseSyncChannelRef.current?.send({
          type: 'broadcast',
          event: 'REALTIME_CLEAR_ALL_HISTORY_EVENT',
          payload: {}
        });
      } catch (e) {}
      await clearAllShoppingHistory();
    } else if (deleteTargetItem?.id) {
      const targetId = deleteTargetItem.id;
      setHistoryList(prev => {
        const updated = (prev || []).filter(h => h.id !== targetId);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
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
      await deleteShoppingTrip(targetId);
    }
    setDeleteTargetItem(null);
    setIsDeletingAll(false);
  };

  // Barcode scanned item
  const handleBarcodeScanned = (scanned) => {
    setInputInitialValues({
      name: scanned.name,
      price: scanned.price,
      category: scanned.category,
      unit: scanned.unit,
      quantity: 1
    });
    setActiveTab('input');
  };

  // Checkout Save & Double Submit Prevention
  const totalCartPrice = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const handleConfirmCheckout = async () => {
    // 1. Cegah eksekusi ganda jika sedang proses simpan atau keranjang kosong
    if (isCheckoutLoading || cartItems.length === 0) return;
    setIsCheckoutLoading(true);

    try {
      // 2. Simpan transaksi secara permanen ke Supabase Cloud PostgreSQL
      // Ambil string tanggal ISO (YYYY-MM-DD) murni dari state transactionDate
      // Mencegah pergeseran timezone UTC yang mengubah tanggal (misal 1 November menjadi 31 Oktober)
      const safeShoppingDate = toISODateString(transactionDate);

      const saveRes = await saveShoppingTrip({
        shopping_date: safeShoppingDate,
        total_spent: totalCartPrice,
        notes: currentStore
      }, cartItems.map(i => ({
        nama_barang: i.name,
        kategori: i.category,
        satuan: i.unit,
        kuantitas: i.quantity,
        harga_satuan: i.originalPrice || i.price,
        harga_akhir_per_satuan: i.price,
        total_harga_item: i.price * i.quantity
      })));

      // 3. Broadcast sinyal checkout ke perangkat lain via Realtime Channel
      try {
        supabaseSyncChannelRef.current?.send({
          type: 'broadcast',
          event: 'REALTIME_CHECKOUT_EVENT',
          payload: { timestamp: Date.now() }
        });
      } catch (e) {}

      // 4. Update data Single Source of Truth:
      // Jika offline fallback terjadi (saveRes.source === 'local'), simpan sesi lokal.
      // Jika berhasil ke Supabase Cloud, panggil loadCloudHistoryRef() untuk memuat satu data resmi dari server.
      if (saveRes?.source === 'local') {
        const fallbackSession = {
          id: saveRes.historyId || ('sesi-' + Date.now()),
          storeName: currentStore,
          store_name: currentStore,
          totalSpent: totalCartPrice,
          total_spent: totalCartPrice,
          savings: 0,
          date: toIndoDisplayDate(safeShoppingDate),
          shopping_date: safeShoppingDate,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          itemCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
          statusTier: 'safe',
          statusBadge: 'Tersimpan Offline',
          items: cartItems
        };
        setHistoryList(prev => {
          const list = [fallbackSession, ...(prev || []).filter(h => h.id !== fallbackSession.id)];
          const unique = Array.from(new Map(list.map(item => [item.id, item])).values());
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(unique));
          }
          return unique;
        });
      } else {
        if (typeof loadCloudHistoryRef.current === 'function') {
          await loadCloudHistoryRef.current();
        }
      }

      setCartItems([]);
      persistState([]);
      setActiveTab('history');
    } catch (err) {
      console.warn('[Checkout Cloud Save Error]:', err);
    } finally {
      // 5. Kembalikan state loading ke false dan tutup modal checkout
      setIsCheckoutLoading(false);
      setIsCheckoutModalOpen(false);
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'cart': return 'Keranjang Aktif';
      case 'input': return 'Katalog & Input';
      case 'history': return 'Riwayat Belanja';
      default: return 'Keranjang Aktif';
    }
  };

  return (
    <main className="min-h-screen bg-[#070D18] flex items-center justify-center p-0 md:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Mobile Shell Mockup Wrapper (iPhone 16 Pro Max 430px Standard) */}
      <div className="w-full max-w-[430px] bg-white min-h-screen md:min-h-[900px] md:max-h-[920px] md:rounded-[44px] shadow-2xl md:ring-12 md:ring-slate-800/90 overflow-hidden flex flex-col relative transition-all duration-300">
        
        {/* Simulated Mobile Status Bar (09:41, Notch, 5G Battery) */}
        <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-800 font-semibold shrink-0 select-none border-b border-slate-50">
          <span className="font-extrabold tracking-tight">09:41</span>
          <div className="w-20 h-4 bg-slate-200/80 rounded-full flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-700 font-bold">
            <span>5G</span>
            <span>●●●</span>
            <span>🔋 98%</span>
          </div>
        </div>

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
            {/* Global Header Bar with Store info, Avatar & Sync Status */}
            <HeaderBar
              currentStore={currentStore}
              onOpenStoreModal={() => setIsStoreModalOpen(true)}
              activeTabTitle={getActiveTabTitle()}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsProfileModalOpen(true)}
              syncStatus={syncStatus}
            />

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
                  onOpenCheckout={() => setIsCheckoutModalOpen(true)}
                  onOpenBarcodeModal={() => setIsBarcodeModalOpen(true)}
                  onCutSecondaryItems={handleCutSecondaryItems}
                  onLoadMockupOverbudget={handleLoadMockupOverbudget}
                  onLoadMockupNormal={handleLoadMockupNormal}
                  onAddToCart={handleAddToCart}
                />
              )}

              {activeTab === 'input' && (
                <CatalogInputScreen
                  currentStore={currentStore}
                  currentRemainingBudget={Math.max(0, budgetLimit - totalCartPrice)}
                  onAddToCart={handleAddToCart}
                  onOpenBarcodeModal={() => setIsBarcodeModalOpen(true)}
                  initialValues={inputInitialValues}
                />
              )}

              {activeTab === 'history' && (
                <HistoryScreen
                  historyList={historyList}
                  onOpenReceiptDetail={(session) => setSelectedReceipt(session)}
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
            />

            <BarcodeScannerModal
              isOpen={isBarcodeModalOpen}
              onClose={() => setIsBarcodeModalOpen(false)}
              onScannedItem={handleBarcodeScanned}
            />

            <ReceiptDetailModal
              isOpen={Boolean(selectedReceipt)}
              onClose={() => setSelectedReceipt(null)}
              session={selectedReceipt}
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

            <DeleteConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirmDelete={handleConfirmDelete}
              targetItem={deleteTargetItem}
              isDeletingAll={isDeletingAll}
            />
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
