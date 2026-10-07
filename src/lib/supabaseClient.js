/**
 * Supabase Client & Service Helper for Smart Grocery Price Tracker (SakuGrosir)
 * Features:
 * - Inisialisasi menggunakan Environment Variables (Universal Node / Vite / Next.js / Browser)
 * - Lookup harga bulan lalu real-time
 * - Batch insert transaksi struk belanja ke grocery_history & grocery_items
 * - Sinkronisasi batas anggaran saku ke budget_settings
 * - Offline-First Fallback (LocalStorage) untuk ketahanan saat di basement supermarket
 */

import { createClient } from '@supabase/supabase-js';

// Environment variable resolution with fallback to user-provided project credentials
const SUPABASE_URL = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_URL) ||
  'https://ihickxbofezjqxncegda.supabase.co';

const SUPABASE_ANON_KEY = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaWNreGJvZmV6anF4bmNlZ2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzAzOTAsImV4cCI6MjEwNjkwNjM5MH0.6ralu-BuIifgYvA3ep-ItX4mAlky7i7dlz1x0vtNzzE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Storage fallback keys
const FALLBACK_KEYS = {
  CATALOG: 'sakugrosir_price_catalog_v1',
  HISTORY: 'sakugrosir_history_v1',
  BUDGET: 'sakugrosir_budget_v1'
};

/**
 * 1. MENGAMBIL HARGA TERAKHIR / BULAN LALU BERDASARKAN NAMA BARANG
 * Query memanfaatkan indeks composite (lower(nama_barang), created_at DESC)
 */
export async function getLastPrice(namaBarang) {
  if (!namaBarang || !namaBarang.trim()) return null;
  const cleanName = namaBarang.trim();

  try {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('harga_akhir_per_satuan, created_at')
      .ilike('nama_barang', cleanName)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase getLastPrice] Query error, falling back to LocalStorage:', error.message);
      return getOfflineLastPrice(cleanName);
    }

    if (data && data.harga_akhir_per_satuan !== undefined) {
      return Number(data.harga_akhir_per_satuan);
    }

    // Jika tidak ditemukan di Supabase, cek fallback lokal
    return getOfflineLastPrice(cleanName);
  } catch (err) {
    console.warn('[Supabase getLastPrice] Network offline, using fallback:', err.message);
    return getOfflineLastPrice(cleanName);
  }
}

/**
 * 2. MENYIMPAN TRANSAKSI KERANJANG BELANJA BESERTA SELURUH ITEMNYA (BATCH INSERT)
 * Menyimpan ke grocery_history lalu memasukkan seluruh baris ke grocery_items
 */
export async function saveShoppingTrip(historyData, itemsList) {
  const payloadHistory = {
    shopping_date: historyData.shopping_date || new Date().toISOString().split('T')[0],
    total_spent: Number(historyData.total_spent) || 0,
    notes: historyData.notes || 'Supermarket Grosir'
  };

  try {
    // A. Insert ke tabel grocery_history
    const { data: historyRow, error: historyErr } = await supabase
      .from('grocery_history')
      .insert([payloadHistory])
      .select()
      .single();

    if (historyErr) {
      throw new Error(`Gagal menyimpan grocery_history: ${historyErr.message}`);
    }

    // B. Format batch items dengan relasi history_id
    if (itemsList && itemsList.length > 0) {
      const formattedItems = itemsList.map(item => ({
        history_id: historyRow.id,
        nama_barang: item.nama_barang,
        kategori: item.kategori || 'Kebutuhan Pokok',
        satuan: item.satuan || 'pcs',
        kuantitas: Number(item.kuantitas) || 1,
        harga_satuan: Number(item.harga_satuan) || 0,
        diskon_persen_1: Number(item.diskon_persen_1) || 0,
        diskon_persen_2: Number(item.diskon_persen_2) || 0,
        potongan_langsung: Number(item.potongan_langsung) || 0,
        harga_akhir_per_satuan: Number(item.harga_akhir_per_satuan) || 0,
        total_harga_item: Number(item.total_harga_item) || 0,
        harga_bulan_lalu: Number(item.harga_bulan_lalu) || 0
      }));

      // C. Batch insert ke tabel grocery_items
      const { error: itemsErr } = await supabase
        .from('grocery_items')
        .insert(formattedItems);

      if (itemsErr) {
        console.error('[Supabase saveShoppingTrip] Items batch insert error:', itemsErr.message);
      }
    }

    // Update catalog lokal juga untuk redundansi
    itemsList.forEach(item => {
      saveOfflinePrice(item.nama_barang, item.harga_akhir_per_satuan);
    });

    return {
      success: true,
      source: 'supabase',
      historyId: historyRow.id,
      data: historyRow
    };
  } catch (err) {
    console.warn('[Supabase saveShoppingTrip] Network or schema error, saving to LocalStorage fallback:', err.message);
    saveOfflineTrip(historyData, itemsList);
    return {
      success: true,
      source: 'localStorage_fallback',
      error: err.message
    };
  }
}

/**
 * 3. MENGAMBIL PENGATURAN ANGGARAN DOMPET (BUDGET SETTINGS)
 */
export async function getBudgetSettings() {
  try {
    const { data, error } = await supabase
      .from('budget_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase getBudgetSettings] Error, using local fallback:', error.message);
      return getOfflineBudget();
    }

    if (data) {
      // Sinkronkan ke lokal
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(FALLBACK_KEYS.BUDGET, data.monthly_budget_cap.toString());
      }
      return {
        monthly_budget_cap: Number(data.monthly_budget_cap),
        warning_threshold: Number(data.warning_threshold) || 0.8,
        id: data.id
      };
    }

    return getOfflineBudget();
  } catch (err) {
    console.warn('[Supabase getBudgetSettings] Offline, using local fallback:', err.message);
    return getOfflineBudget();
  }
}

/**
 * 4. MEMPERBARUI PENGATURAN ANGGARAN DOMPET (BUDGET SETTINGS)
 */
export async function updateBudgetSettings(monthlyBudgetCap, warningThreshold = 0.8) {
  const cap = Number(monthlyBudgetCap) || 500000;
  const threshold = Number(warningThreshold) || 0.8;

  // Update lokal terlebih dahulu
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(FALLBACK_KEYS.BUDGET, cap.toString());
  }

  try {
    // Ambil baris yang ada untuk diupdate atau insert baru
    const { data: existing } = await supabase
      .from('budget_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing && existing.id) {
      result = await supabase
        .from('budget_settings')
        .update({
          monthly_budget_cap: cap,
          warning_threshold: threshold,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('budget_settings')
        .insert([{
          monthly_budget_cap: cap,
          warning_threshold: threshold
        }]);
    }

    if (result.error) {
      console.warn('[Supabase updateBudgetSettings] Sync error:', result.error.message);
    }

    return { success: !result.error, monthly_budget_cap: cap, warning_threshold: threshold };
  } catch (err) {
    console.warn('[Supabase updateBudgetSettings] Offline, saved locally:', err.message);
    return { success: true, fallback: true, monthly_budget_cap: cap };
  }
}

/**
 * 5. MENGAMBIL SELURUH RIWAYAT TRANSAKSI DARI SUPABASE
 */
export async function getShoppingHistoryList() {
  try {
    const { data, error } = await supabase
      .from('grocery_history')
      .select(`
        id,
        shopping_date,
        total_spent,
        notes,
        created_at,
        grocery_items (
          id,
          nama_barang,
          kategori,
          satuan,
          kuantitas,
          harga_satuan,
          diskon_persen_1,
          diskon_persen_2,
          potongan_langsung,
          harga_akhir_per_satuan,
          total_harga_item,
          harga_bulan_lalu
        )
      `)
      .order('shopping_date', { ascending: false });

    if (error) {
      console.warn('[Supabase getShoppingHistoryList] Error, using local fallback:', error.message);
      return getOfflineHistory();
    }

    if (data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        store_name: row.notes || 'Supermarket Grosir',
        date: row.shopping_date,
        total_spent: Number(row.total_spent),
        items_count: row.grocery_items?.length || 0,
        items: row.grocery_items || []
      }));
    }

    return getOfflineHistory();
  } catch (err) {
    console.warn('[Supabase getShoppingHistoryList] Offline, using local fallback:', err.message);
    return getOfflineHistory();
  }
}

// ==============================================================================
// OFFLINE FALLBACK HELPERS (LOCAL STORAGE)
// ==============================================================================

function getOfflineLastPrice(namaBarang) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FALLBACK_KEYS.CATALOG);
    const catalog = raw ? JSON.parse(raw) : {};
    const target = namaBarang.trim().toLowerCase();

    for (const [k, v] of Object.entries(catalog)) {
      if (k.toLowerCase() === target) return Number(v);
    }
    for (const [k, v] of Object.entries(catalog)) {
      if (k.toLowerCase().includes(target) || target.includes(k.toLowerCase())) return Number(v);
    }
    return null;
  } catch (e) {
    return null;
  }
}

function saveOfflinePrice(namaBarang, harga) {
  if (typeof localStorage === 'undefined' || !namaBarang) return;
  try {
    const raw = localStorage.getItem(FALLBACK_KEYS.CATALOG);
    const catalog = raw ? JSON.parse(raw) : {};
    catalog[namaBarang.trim()] = Number(harga);
    localStorage.setItem(FALLBACK_KEYS.CATALOG, JSON.stringify(catalog));
  } catch (e) {}
}

function getOfflineBudget() {
  if (typeof localStorage === 'undefined') return { monthly_budget_cap: 500000, warning_threshold: 0.8 };
  const val = Number(localStorage.getItem(FALLBACK_KEYS.BUDGET)) || 500000;
  return { monthly_budget_cap: val, warning_threshold: 0.8 };
}

function getOfflineHistory() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FALLBACK_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveOfflineTrip(historyData, itemsList) {
  if (typeof localStorage === 'undefined') return;
  try {
    const history = getOfflineHistory();
    const trip = {
      id: 'trip_offline_' + Date.now(),
      store_name: historyData.notes || 'Supermarket Grosir',
      date: historyData.shopping_date || new Date().toISOString().split('T')[0],
      total_spent: historyData.total_spent || 0,
      items_count: itemsList.length,
      items: itemsList
    };
    history.unshift(trip);
    localStorage.setItem(FALLBACK_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {}
}
