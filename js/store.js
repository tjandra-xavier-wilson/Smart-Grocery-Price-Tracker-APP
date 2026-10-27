// Reactive Store & LocalStorage Persistence for SakuGrosir
// Terhubung dengan LocalStorage, Cloud Firestore Realtime onSnapshot, dan Supabase

class GroceryStore {
  constructor() {
    this.STORAGE_KEYS = {
      CART: 'sakugrosir_cart_v1',
      BUDGET: 'sakugrosir_budget_v1',
      STORE_NAME: 'sakugrosir_store_name_v1',
      TRANS_DATE: 'sakugrosir_trans_date_v1',
      HISTORY: 'sakugrosir_history_v1',
      PRICE_CATALOG: 'sakugrosir_price_catalog_v1',
      PREFERENCES: 'sakugrosir_prefs_v1'
    };

    this.listeners = [];
    this.isLocalMutating = false;
    this.init();
  }

  init() {
    // 1. Inisialisasi default lokasi toko belanja untuk skenario DT2
    if (!localStorage.getItem(this.STORAGE_KEYS.STORE_NAME)) {
      localStorage.setItem(this.STORAGE_KEYS.STORE_NAME, 'Lotte Mart Grocery - Puri Indah');
    }

    // 2. Inisialisasi selector tanggal transaksi
    if (!localStorage.getItem(this.STORAGE_KEYS.TRANS_DATE)) {
      localStorage.setItem(this.STORAGE_KEYS.TRANS_DATE, new Date().toISOString().split('T')[0]);
    }

    // 3. Inisialisasi limit saku (Rp 100.000 sesuai skenario guru)
    if (!localStorage.getItem(this.STORAGE_KEYS.BUDGET)) {
      localStorage.setItem(this.STORAGE_KEYS.BUDGET, '100000');
    }

    // 4. Inisialisasi item keranjang
    if (!localStorage.getItem(this.STORAGE_KEYS.CART)) {
      this.resetToDefaults();
    } else {
      if (!localStorage.getItem(this.STORAGE_KEYS.PRICE_CATALOG)) {
        localStorage.setItem(this.STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(window.INITIAL_PRICE_DATABASE || {}));
      }
    }

    // Sinkronisasi awal dengan Supabase Cloud jika online
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    if (!window.SupabaseHelper || !window.SupabaseHelper.isAvailable()) return;

    try {
      const cloudBudget = await window.SupabaseHelper.getBudgetSettings();
      if (cloudBudget && cloudBudget.monthly_budget_cap) {
        localStorage.setItem(this.STORAGE_KEYS.BUDGET, cloudBudget.monthly_budget_cap.toString());
        this.notify();
      }

      const syncBadge = document.getElementById('cloud-sync-badge');
      const syncText = document.getElementById('sync-text');
      if (syncBadge && syncText) {
        syncBadge.classList.remove('offline');
        syncText.textContent = 'Supabase & Firestore Live';
      }
    } catch (e) {
      console.warn('[GroceryStore] Supabase fallback to local storage:', e);
    }
  }

  resetToDefaults() {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(window.SAMPLE_INITIAL_ITEMS || []));
    localStorage.setItem(this.STORAGE_KEYS.BUDGET, '100000');
    localStorage.setItem(this.STORAGE_KEYS.STORE_NAME, 'Lotte Mart Grocery - Puri Indah');
    localStorage.setItem(this.STORAGE_KEYS.TRANS_DATE, new Date().toISOString().split('T')[0]);
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(window.SAMPLE_SHOPPING_HISTORY || []));
    localStorage.setItem(this.STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(window.INITIAL_PRICE_DATABASE || {}));
    this.broadcastToCloud();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- SESI BELANJA & TOKO METADATA (F-01 & F-06A) ---

  getSessionMetadata() {
    return {
      storeName: localStorage.getItem(this.STORAGE_KEYS.STORE_NAME) || 'Lotte Mart Grocery - Puri Indah',
      transDate: localStorage.getItem(this.STORAGE_KEYS.TRANS_DATE) || new Date().toISOString().split('T')[0]
    };
  }

  setSessionMetadata(storeName, transDate) {
    if (storeName) localStorage.setItem(this.STORAGE_KEYS.STORE_NAME, storeName.trim());
    if (transDate) localStorage.setItem(this.STORAGE_KEYS.TRANS_DATE, transDate);
    this.broadcastToCloud();
    this.notify();
  }

  // Sinkronisasi otomatis dari Firebase Cloud Firestore onSnapshot (F-06B)
  applyCloudSnapshot(cloudData) {
    if (!cloudData) return;
    let changed = false;

    if (cloudData.items && Array.isArray(cloudData.items)) {
      localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cloudData.items));
      changed = true;
    }
    if (cloudData.budget_limit) {
      localStorage.setItem(this.STORAGE_KEYS.BUDGET, cloudData.budget_limit.toString());
      changed = true;
    }
    if (cloudData.store_name) {
      localStorage.setItem(this.STORAGE_KEYS.STORE_NAME, cloudData.store_name);
      changed = true;
    }
    if (cloudData.transaction_date) {
      localStorage.setItem(this.STORAGE_KEYS.TRANS_DATE, cloudData.transaction_date);
      changed = true;
    }

    if (changed) {
      this.notify();
    }
  }

  broadcastToCloud() {
    const state = {
      store_name: this.getSessionMetadata().storeName,
      transaction_date: this.getSessionMetadata().transDate,
      budget_limit: this.getBudgetLimit(),
      items: this.getItems()
    };

    if (window.FirebaseSync && typeof window.FirebaseSync.broadcastChange === 'function') {
      this.isLocalMutating = true;
      window.FirebaseSync.broadcastChange(state);
      setTimeout(() => { this.isLocalMutating = false; }, 350);
    }
  }

  // --- OPERASI KERANJANG BELANJA (F-01, F-02, F-06A) ---

  getItems() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveItems(items) {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(items));
    this.broadcastToCloud();
    this.notify();
  }

  getItemById(id) {
    return this.getItems().find(i => i.id === id);
  }

  addItem(rawItem) {
    const items = this.getItems();
    const id = rawItem.id || 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    let hargaBulanLalu = Number(rawItem.harga_bulan_lalu);
    if (!hargaBulanLalu || hargaBulanLalu <= 0) {
      hargaBulanLalu = this.lookupPastPrice(rawItem.nama_barang) || 0;
    }

    const calc = window.GroceryCalculator.calculateItemPricing(rawItem);

    const newItem = {
      id: id,
      nama_barang: (rawItem.nama_barang || '').trim(),
      kategori: rawItem.kategori || 'Bahan Pokok',
      satuan: rawItem.satuan || 'pcs',
      kuantitas: Math.max(1, Number(rawItem.kuantitas) || 1),
      harga_satuan: Math.max(0, Number(rawItem.harga_satuan) || 0),
      diskon_persen_1: Math.max(0, Number(rawItem.diskon_persen_1) || 0),
      diskon_persen_2: Math.max(0, Number(rawItem.diskon_persen_2) || 0),
      potongan_langsung: Math.max(0, Number(rawItem.potongan_langsung) || 0),
      harga_akhir_per_satuan: calc.harga_akhir_per_satuan,
      total_harga_item: calc.total_harga_item,
      harga_bulan_lalu: hargaBulanLalu
    };

    items.unshift(newItem);
    this.saveItems(items);
    this.recordPriceInCatalog(newItem.nama_barang, newItem.harga_akhir_per_satuan);

    return newItem;
  }

  updateItem(id, rawItem) {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = items[index];
    const calc = window.GroceryCalculator.calculateItemPricing({
      ...current,
      ...rawItem
    });

    items[index] = {
      ...current,
      nama_barang: (rawItem.nama_barang !== undefined ? rawItem.nama_barang : current.nama_barang).trim(),
      kategori: rawItem.kategori !== undefined ? rawItem.kategori : current.kategori,
      satuan: rawItem.satuan !== undefined ? rawItem.satuan : current.satuan,
      kuantitas: Math.max(1, Number(rawItem.kuantitas !== undefined ? rawItem.kuantitas : current.kuantitas)),
      harga_satuan: Math.max(0, Number(rawItem.harga_satuan !== undefined ? rawItem.harga_satuan : current.harga_satuan)),
      diskon_persen_1: Math.max(0, Number(rawItem.diskon_persen_1 !== undefined ? rawItem.diskon_persen_1 : current.diskon_persen_1)),
      diskon_persen_2: Math.max(0, Number(rawItem.diskon_persen_2 !== undefined ? rawItem.diskon_persen_2 : current.diskon_persen_2)),
      potongan_langsung: Math.max(0, Number(rawItem.potongan_langsung !== undefined ? rawItem.potongan_langsung : current.potongan_langsung)),
      harga_bulan_lalu: Number(rawItem.harga_bulan_lalu !== undefined ? rawItem.harga_bulan_lalu : current.harga_bulan_lalu) || 0,
      harga_akhir_per_satuan: calc.harga_akhir_per_satuan,
      total_harga_item: calc.total_harga_item
    };

    this.saveItems(items);
    this.recordPriceInCatalog(items[index].nama_barang, items[index].harga_akhir_per_satuan);
    return items[index];
  }

  // Penggandaan kuantitas otomatis tanpa delay (F-02)
  updateQuantity(id, deltaOrAbsolute, isAbsolute = false) {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return null;

    let newQty;
    if (isAbsolute) {
      newQty = Math.max(1, Number(deltaOrAbsolute) || 1);
    } else {
      newQty = Math.max(1, (Number(item.kuantitas) || 1) + deltaOrAbsolute);
    }

    item.kuantitas = newQty;
    item.total_harga_item = item.harga_akhir_per_satuan * newQty;

    this.saveItems(items);
    return item;
  }

  // Hapus item permanen (F-06A)
  deleteItem(id) {
    const items = this.getItems().filter(i => i.id !== id);
    this.saveItems(items);
  }

  clearCart() {
    this.saveItems([]);
  }

  getCartTotals() {
    const items = this.getItems();
    let runningTotal = 0;
    let totalSavings = 0;
    let totalItemsCount = 0;

    items.forEach(item => {
      runningTotal += item.total_harga_item;
      totalItemsCount += item.kuantitas;
      const normalTotal = item.harga_satuan * item.kuantitas;
      totalSavings += Math.max(0, normalTotal - item.total_harga_item);
    });

    const budgetLimit = this.getBudgetLimit();
    const budgetCap = window.GroceryCalculator.calculateBudgetCap(runningTotal, budgetLimit);

    return {
      runningTotal,
      totalSavings,
      totalItemsCount,
      uniqueCount: items.length,
      budgetCap
    };
  }

  // --- PENGENDALI ANGGARAN (F-05) ---

  getBudgetLimit() {
    const val = localStorage.getItem(this.STORAGE_KEYS.BUDGET);
    return Math.max(10000, Number(val) || 100000);
  }

  setBudgetLimit(newLimit) {
    const limit = Math.max(10000, Number(newLimit) || 100000);
    localStorage.setItem(this.STORAGE_KEYS.BUDGET, limit.toString());
    this.broadcastToCloud();
    this.notify();

    if (window.SupabaseHelper && window.SupabaseHelper.isAvailable()) {
      window.SupabaseHelper.updateBudgetSettings(limit);
    }
    return limit;
  }

  // --- RIWAYAT STRUK BELANJA & CHECKOUT (F-06A) ---

  getHistory() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  checkoutCart(storeName = null, customDate = null) {
    const items = this.getItems();
    if (items.length === 0) return null;

    const totals = this.getCartTotals();
    const session = this.getSessionMetadata();
    const finalStore = storeName || session.storeName || 'Lotte Mart Grocery - Puri Indah';
    const now = new Date();
    const dateStr = customDate || session.transDate || now.toISOString().split('T')[0];
    const dateDisplay = new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const receipt = {
      id: 'trip_' + Date.now(),
      store_name: finalStore,
      date: dateStr,
      date_display: dateDisplay,
      budget_limit: totals.budgetCap.budgetLimit,
      total_spent: totals.runningTotal,
      total_savings: totals.totalSavings,
      items_count: totals.totalItemsCount,
      items: items.map(item => ({
        nama_barang: item.nama_barang,
        kategori: item.kategori,
        satuan: item.satuan,
        kuantitas: item.kuantitas,
        harga_satuan: item.harga_satuan,
        diskon_persen_1: item.diskon_persen_1,
        diskon_persen_2: item.diskon_persen_2,
        potongan_langsung: item.potongan_langsung,
        harga_akhir_per_satuan: item.harga_akhir_per_satuan,
        total_harga_item: item.total_harga_item,
        harga_bulan_lalu: item.harga_bulan_lalu
      }))
    };

    // Update database harga bulan lalu
    items.forEach(item => {
      this.recordPriceInCatalog(item.nama_barang, item.harga_akhir_per_satuan);
    });

    const history = this.getHistory();
    history.unshift(receipt);
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));

    // Sinkronisasi riwayat ke Supabase
    if (window.SupabaseHelper && window.SupabaseHelper.isAvailable()) {
      window.SupabaseHelper.saveShoppingTrip(
        { shopping_date: dateStr, total_spent: totals.runningTotal, notes: finalStore },
        receipt.items
      );
    }

    this.clearCart();
    return receipt;
  }

  deleteHistoryTrip(tripId) {
    const history = this.getHistory().filter(h => h.id !== tripId);
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));
    this.notify();
  }

  reloadTripToCart(tripId) {
    const trip = this.getHistory().find(h => h.id === tripId);
    if (!trip || !trip.items) return false;

    const items = trip.items.map(oldItem => {
      const calc = window.GroceryCalculator.calculateItemPricing(oldItem);
      return {
        id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        nama_barang: oldItem.nama_barang,
        kategori: oldItem.kategori || 'Bahan Pokok',
        satuan: oldItem.satuan || 'pcs',
        kuantitas: oldItem.kuantitas || 1,
        harga_satuan: oldItem.harga_satuan || oldItem.harga_akhir_per_satuan,
        diskon_persen_1: oldItem.diskon_persen_1 || 0,
        diskon_persen_2: oldItem.diskon_persen_2 || 0,
        potongan_langsung: oldItem.potongan_langsung || 0,
        harga_akhir_per_satuan: calc.harga_akhir_per_satuan,
        total_harga_item: calc.total_harga_item,
        harga_bulan_lalu: oldItem.harga_akhir_per_satuan
      };
    });

    this.saveItems(items);
    return true;
  }

  // --- DATABASE KATALOG HARGA (F-04) ---

  getPriceCatalog() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PRICE_CATALOG);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  recordPriceInCatalog(itemName, price) {
    if (!itemName || !price) return;
    const catalog = this.getPriceCatalog();
    catalog[itemName.trim()] = Number(price);
    localStorage.setItem(this.STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(catalog));
  }

  lookupPastPrice(itemName) {
    if (!itemName) return null;
    const cleanName = itemName.trim().toLowerCase();
    const catalog = this.getPriceCatalog();

    for (const [key, val] of Object.entries(catalog)) {
      if (key.toLowerCase() === cleanName) {
        return Number(val);
      }
    }
    for (const [key, val] of Object.entries(catalog)) {
      if (key.toLowerCase().includes(cleanName) || cleanName.includes(key.toLowerCase())) {
        return Number(val);
      }
    }
    return null;
  }
}

window.groceryStore = new GroceryStore();
