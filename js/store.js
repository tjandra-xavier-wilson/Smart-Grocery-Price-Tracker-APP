// Reactive Store & LocalStorage Persistence for SakuGrosir

class GroceryStore {
  constructor() {
    this.STORAGE_KEYS = {
      CART: 'sakugrosir_cart_v1',
      BUDGET: 'sakugrosir_budget_v1',
      HISTORY: 'sakugrosir_history_v1',
      PRICE_CATALOG: 'sakugrosir_price_catalog_v1',
      PREFERENCES: 'sakugrosir_prefs_v1'
    };

    this.listeners = [];
    this.init();
  }

  init() {
    // Check if first time run, initialize with sample data
    if (!localStorage.getItem(this.STORAGE_KEYS.CART)) {
      this.resetToDefaults();
    } else {
      // Ensure catalog has seeds if empty
      if (!localStorage.getItem(this.STORAGE_KEYS.PRICE_CATALOG)) {
        localStorage.setItem(this.STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(window.INITIAL_PRICE_DATABASE || {}));
      }
    }

    // Background sync with Supabase if available
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    if (!window.SupabaseHelper || !window.SupabaseHelper.isAvailable()) return;

    try {
      // 1. Sinkronisasi Budget Settings
      const cloudBudget = await window.SupabaseHelper.getBudgetSettings();
      if (cloudBudget && cloudBudget.monthly_budget_cap) {
        localStorage.setItem(this.STORAGE_KEYS.BUDGET, cloudBudget.monthly_budget_cap.toString());
        this.notify();
      }

      // Update cloud sync badge di header
      const syncBadge = document.getElementById('cloud-sync-badge');
      const syncText = document.getElementById('sync-text');
      if (syncBadge && syncText) {
        syncBadge.classList.remove('offline');
        syncText.textContent = 'Supabase Cloud';
        syncBadge.title = 'Terhubung ke Supabase Database';
      }
    } catch (e) {
      console.warn('[GroceryStore] Supabase sync fallback to offline:', e);
      const syncBadge = document.getElementById('cloud-sync-badge');
      const syncText = document.getElementById('sync-text');
      if (syncBadge && syncText) {
        syncBadge.classList.add('offline');
        syncText.textContent = 'Mode Lokal';
        syncBadge.title = 'Bekerja secara offline / lokal';
      }
    }
  }

  resetToDefaults() {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(window.SAMPLE_INITIAL_ITEMS || []));
    localStorage.setItem(this.STORAGE_KEYS.BUDGET, '500000');
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(window.SAMPLE_SHOPPING_HISTORY || []));
    localStorage.setItem(this.STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(window.INITIAL_PRICE_DATABASE || {}));
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

  // --- CART OPERATIONS ---

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
    this.notify();
  }

  getItemById(id) {
    return this.getItems().find(i => i.id === id);
  }

  addItem(rawItem) {
    const items = this.getItems();
    const id = rawItem.id || 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    // If past price not explicitly given, try looking up in catalog
    let hargaBulanLalu = Number(rawItem.harga_bulan_lalu);
    if (!hargaBulanLalu || hargaBulanLalu <= 0) {
      hargaBulanLalu = this.lookupPastPrice(rawItem.nama_barang) || 0;
    }

    const calc = window.GroceryCalculator.calculateItemPricing(rawItem);

    const newItem = {
      id: id,
      nama_barang: (rawItem.nama_barang || '').trim(),
      kategori: rawItem.kategori || 'Kebutuhan Pokok',
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

    items.unshift(newItem); // place newest at top for immediate thumb visibility
    this.saveItems(items);

    // Also remember this price in catalog
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

  updateQuantity(id, delta) {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return null;

    const newQty = Math.max(1, (Number(item.kuantitas) || 1) + delta);
    item.kuantitas = newQty;
    item.total_harga_item = item.harga_akhir_per_satuan * newQty;

    this.saveItems(items);
    return item;
  }

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

  // --- BUDGET SETTINGS ---

  getBudgetLimit() {
    const val = localStorage.getItem(this.STORAGE_KEYS.BUDGET);
    return Math.max(10000, Number(val) || 500000);
  }

  setBudgetLimit(newLimit) {
    const limit = Math.max(10000, Number(newLimit) || 500000);
    localStorage.setItem(this.STORAGE_KEYS.BUDGET, limit.toString());
    this.notify();

    // Async sync ke Supabase
    if (window.SupabaseHelper && window.SupabaseHelper.isAvailable()) {
      window.SupabaseHelper.updateBudgetSettings(limit);
    }
    return limit;
  }

  // --- SHOPPING HISTORY & CHECKOUT (F-06) ---

  getHistory() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  checkoutCart(storeName = 'Supermarket Grosir', customDate = null) {
    const items = this.getItems();
    if (items.length === 0) return null;

    const totals = this.getCartTotals();
    const now = new Date();
    const dateStr = customDate || now.toISOString().split('T')[0];
    const dateDisplay = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const receipt = {
      id: 'trip_' + Date.now(),
      store_name: storeName.trim() || 'Supermarket Grosir',
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

    // 1. Update historical database lokal so prices become "harga_bulan_lalu" for next trips
    items.forEach(item => {
      this.recordPriceInCatalog(item.nama_barang, item.harga_akhir_per_satuan);
    });

    // 2. Prepend to history lokal
    const history = this.getHistory();
    history.unshift(receipt);
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));

    // 3. Simpan ke Supabase (Batch Insert grocery_history & grocery_items)
    if (window.SupabaseHelper && window.SupabaseHelper.isAvailable()) {
      window.SupabaseHelper.saveShoppingTrip(
        { shopping_date: dateStr, total_spent: totals.runningTotal, notes: storeName },
        receipt.items
      );
    }

    // 4. Clear active cart
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

    // Load items into current cart, updating their harga_bulan_lalu from the trip
    const items = trip.items.map(oldItem => {
      const calc = window.GroceryCalculator.calculateItemPricing(oldItem);
      return {
        id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        nama_barang: oldItem.nama_barang,
        kategori: oldItem.kategori || 'Kebutuhan Pokok',
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

  // --- PRICE CATALOG / HISTORICAL REFERENCE DATABASE ---

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

    // Exact match or case-insensitive match
    for (const [key, val] of Object.entries(catalog)) {
      if (key.toLowerCase() === cleanName) {
        return Number(val);
      }
    }
    // Partial fuzzy match
    for (const [key, val] of Object.entries(catalog)) {
      if (key.toLowerCase().includes(cleanName) || cleanName.includes(key.toLowerCase())) {
        return Number(val);
      }
    }
    return null;
  }
}

window.groceryStore = new GroceryStore();
