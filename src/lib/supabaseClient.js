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
 * Normalisasi satuan agar lolos check constraint PostgreSQL: CHECK (satuan IN ('kg', 'liter', 'pcs', 'pack'))
 */
export function normalizeSatuanForDB(rawSatuan) {
  if (!rawSatuan) return 'pcs';
  const s = String(rawSatuan).toLowerCase();
  if (s.includes('kg') || s.includes('kilo') || s.includes('gram') || s.includes('karung')) return 'kg';
  if (s.includes('liter') || s.includes('lt') || s.includes('ml') || s.includes('pouch') || s.includes('botol')) return 'liter';
  if (s.includes('pack') || s.includes('dus') || s.includes('kotak') || s.includes('tray') || s.includes('zak')) return 'pack';
  if (s === 'kg' || s === 'liter' || s === 'pcs' || s === 'pack') return s;
  return 'pcs';
}

/**
 * 2. MENYIMPAN TRANSAKSI KERANJANG BELANJA BESERTA SELURUH ITEMNYA (BATCH INSERT)
 * Menyimpan ke grocery_history lalu memasukkan seluruh baris ke grocery_items
 */
export async function saveShoppingTrip(historyData, itemsList, userId = null) {
  let targetUserId = userId || historyData.user_id;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        targetUserId = parsed?.id;
      }
    } catch (e) { }
  }
  if (!targetUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    } catch (e) { }
  }

  const baseNotes = historyData.notes || historyData.store_name || historyData.storeName || 'Supermarket Grosir';
  // Sematkan tag identitas pengguna ke dalam notes sebagai redundansi jika kolom user_id belum ada di remote
  const taggedNotes = targetUserId ? `${baseNotes} ##uid:${targetUserId}##` : baseNotes;

  const payloadWithUid = {
    user_id: targetUserId || null,
    shopping_date: historyData.shopping_date || (function () { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
    total_spent: Number(historyData.total_spent) || 0,
    notes: taggedNotes
  };

  try {
    // A. Insert ke tabel grocery_history dengan penanganan skema adaptif
    let historyRow = null;
    let { data: resData, error: historyErr } = await supabase
      .from('grocery_history')
      .insert([payloadWithUid])
      .select()
      .single();

    // Jika skema remote belum memiliki kolom user_id, coba ulang tanpa kolom user_id (data tetap aman di taggedNotes)
    if (historyErr && (historyErr.message?.includes('user_id') || historyErr.code === 'PGRST204' || historyErr.code === '42703')) {
      const payloadFallback = { ...payloadWithUid };
      delete payloadFallback.user_id;
      const retry = await supabase
        .from('grocery_history')
        .insert([payloadFallback])
        .select()
        .single();
      resData = retry.data;
      historyErr = retry.error;
    }

    if (historyErr) {
      throw new Error(`Gagal menyimpan grocery_history: ${historyErr.message}`);
    }
    historyRow = resData;

    // B. Format batch items dengan relasi history_id & normalisasi satuan ke format PostgreSQL
    if (itemsList && itemsList.length > 0) {
      const formattedItems = itemsList.map(item => ({
        history_id: historyRow.id,
        nama_barang: item.nama_barang || item.name || 'Barang Belanja',
        kategori: item.kategori || item.category || 'Bahan Pokok',
        satuan: normalizeSatuanForDB(item.satuan || item.unit),
        kuantitas: Number(item.kuantitas || item.quantity) || 1,
        harga_satuan: Number(item.harga_satuan || item.price) || 0,
        diskon_persen_1: Number(item.diskon_persen_1) || 0,
        diskon_persen_2: Number(item.diskon_persen_2) || 0,
        potongan_langsung: Number(item.potongan_langsung) || 0,
        harga_akhir_per_satuan: Number(item.harga_akhir_per_satuan || item.price) || 0,
        total_harga_item: Number(item.total_harga_item) || (Number(item.harga_akhir_per_satuan || item.price || 0) * Number(item.kuantitas || item.quantity || 1)),
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
      saveOfflinePrice(item.nama_barang || item.name, item.harga_akhir_per_satuan || item.price);
    });

    // Simpan juga ke cache lokal per-user
    saveOfflineTrip(historyData, itemsList, targetUserId);

    return {
      success: true,
      source: 'supabase',
      historyId: historyRow.id,
      data: historyRow
    };
  } catch (err) {
    console.warn('[Supabase saveShoppingTrip] Network or schema error, saving to LocalStorage fallback:', err.message);
    saveOfflineTrip(historyData, itemsList, targetUserId);
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
 * 5. MENGAMBIL SELURUH RIWAYAT TRANSAKSI DARI SUPABASE (TERISOLASI PER USER_ID)
 */
export async function getShoppingHistoryList(userId = null) {
  try {
    let targetUserId = userId;
    if (!targetUserId && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakugrosir_single_user_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          targetUserId = parsed?.id;
        }
      } catch (e) { }
    }
    if (!targetUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      } catch (e) { }
    }

    // Query adaptif langsung ke tabel grocery_history beserta relasi grocery_items
    const { data: rawData, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase getShoppingHistoryList] Cloud query error:', error.message);
      return [];
    }

    let data = rawData || [];
    // Filter ketat: Abaikan row sinkronisasi internal aplikasi (##sakugrosir_custom_config##)
    data = data.filter(row => !row.notes || !row.notes.startsWith('##sakugrosir_custom_config##'));

    // Filter ketat berdasarkan identitas pengguna (tag ##uid:...## di notes atau kolom user_id)
    // Mencegah data bleeding antar akun Google
    if (targetUserId) {
      data = data.filter(row => {
        if (row.user_id && row.user_id === targetUserId) return true;
        if (row.notes && row.notes.includes(`##uid:${targetUserId}##`)) return true;
        return false;
      });
    }

    // JIKA data di Supabase kosong (karena sudah dihapus atau akun baru):
    // HARUS mengembalikan array kosong [], JANGAN PERNAH fallback ke mock/offline data!
    if (!data || data.length === 0) {
      return [];
    }
    return data.map(row => {
      const dateObj = new Date(row.created_at || row.shopping_date);
      const timeStr = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        : '10:00 WIB';

      let dateDisplay = row.shopping_date;
      if (row.shopping_date && row.shopping_date.includes('-')) {
        const parts = row.shopping_date.split('-');
        if (parts.length === 3) {
          const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const mIdx = parseInt(parts[1], 10) - 1;
          dateDisplay = `${parseInt(parts[2], 10)} ${months[mIdx] || parts[1]} ${parts[0]}`;
        }
      }

      const items = (row.grocery_items || []).map(it => ({
        id: it.id,
        name: it.nama_barang,
        nama_barang: it.nama_barang,
        price: Number(it.harga_akhir_per_satuan) || Number(it.harga_satuan) || 0,
        harga_akhir_per_satuan: Number(it.harga_akhir_per_satuan) || Number(it.harga_satuan) || 0,
        originalPrice: Number(it.harga_satuan) || 0,
        harga_satuan: Number(it.harga_satuan) || 0,
        quantity: Number(it.kuantitas) || 1,
        kuantitas: Number(it.kuantitas) || 1,
        unit: it.satuan || 'pcs',
        satuan: it.satuan || 'pcs',
        category: it.kategori || 'Bahan Pokok',
        total_harga_item: Number(it.total_harga_item) || (Number(it.harga_akhir_per_satuan || it.harga_satuan || 0) * Number(it.kuantitas || 1))
      }));

      const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

      // Bersihkan tag ##uid:...## dari nama toko/notes untuk tampilan UI
      const cleanStoreName = (row.notes || row.store_name || row.storeName || 'Supermarket Grosir')
        .replace(/\s*##uid:[^#]+##\s*/g, '')
        .trim();

      return {
        id: row.id,
        storeName: cleanStoreName,
        store_name: cleanStoreName,
        notes: cleanStoreName,
        date: dateDisplay,
        shopping_date: row.shopping_date,
        time: timeStr,
        totalSpent: Number(row.total_spent) || 0,
        total_spent: Number(row.total_spent) || 0,
        savings: 0,
        itemCount: totalItems || items.length,
        items_count: totalItems || items.length,
        statusTier: 'safe',
        statusBadge: 'Transaksi Sukses',
        iconType: 'cart',
        items: items
      };
    });
  } catch (err) {
    console.warn('[Supabase getShoppingHistoryList] Offline, using local fallback:', err.message);
    return getOfflineHistory(targetUserId);
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
  } catch (e) { }
}

function getOfflineBudget() {
  if (typeof localStorage === 'undefined') return { monthly_budget_cap: 500000, warning_threshold: 0.8 };
  const val = Number(localStorage.getItem(FALLBACK_KEYS.BUDGET)) || 500000;
  return { monthly_budget_cap: val, warning_threshold: 0.8 };
}

export function getOfflineHistory(userId = null) {
  if (typeof localStorage === 'undefined') return [];
  try {
    if (userId) {
      const userRaw = localStorage.getItem(`${FALLBACK_KEYS.HISTORY}_${userId}`);
      return userRaw ? JSON.parse(userRaw) : [];
    }
    const raw = localStorage.getItem(FALLBACK_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveOfflineTrip(historyData, itemsList, userId = null) {
  if (typeof localStorage === 'undefined') return;
  try {
    const targetUserId = userId || historyData.user_id;
    const history = getOfflineHistory(targetUserId);
    const cleanNotes = (historyData.notes || historyData.store_name || historyData.storeName || 'Supermarket Grosir')
      .replace(/\s*##uid:[^#]+##\s*/g, '')
      .trim();
    const trip = {
      id: 'trip_offline_' + Date.now(),
      storeName: cleanNotes,
      store_name: cleanNotes,
      notes: cleanNotes,
      date: historyData.shopping_date || (function () { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
      shopping_date: historyData.shopping_date || (function () { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
      totalSpent: historyData.total_spent || 0,
      total_spent: historyData.total_spent || 0,
      itemCount: itemsList.length,
      items_count: itemsList.length,
      items: itemsList
    };
    history.unshift(trip);
    if (targetUserId) {
      localStorage.setItem(`${FALLBACK_KEYS.HISTORY}_${targetUserId}`, JSON.stringify(history));
    } else {
      localStorage.setItem(FALLBACK_KEYS.HISTORY, JSON.stringify(history));
    }
  } catch (e) { }
}

// ==============================================================================
// 6. SUPABASE AUTHENTICATION & SESSION MANAGEMENT
// ==============================================================================

/**
 * 6. MENGHAPUS SATU SESI TRANSAKSI BELANJA DARI SUPABASE & LOCALSTORAGE
 */
export async function deleteShoppingTrip(tripId, userId = null) {
  if (!tripId) return { success: false, error: 'No tripId provided' };

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      } catch (e) { }
    }

    // A. Hapus child items di grocery_items terlebih dahulu agar tidak terblokir Foreign Key
    try {
      await supabase.from('grocery_items').delete().eq('history_id', tripId);
    } catch (e) { }

    // B. Hapus dari Supabase PostgreSQL dengan ID unik
    const { error } = await supabase.from('grocery_history').delete().eq('id', tripId);

    // Coba juga di tabel history jika ada
    try {
      await supabase.from('history').delete().eq('id', tripId);
    } catch (e) { }

    if (error) {
      console.warn('[Supabase deleteShoppingTrip] Supabase error:', error.message);
      return { success: false, error: error.message };
    }

    // C. Hapus dari LocalStorage fallback (baik user-isolated maupun global)
    if (typeof localStorage !== 'undefined') {
      try {
        if (targetUserId) {
          const userRaw = localStorage.getItem(`${FALLBACK_KEYS.HISTORY}_${targetUserId}`);
          if (userRaw) {
            const list = JSON.parse(userRaw);
            const updated = list.filter(item => item.id !== tripId);
            localStorage.setItem(`${FALLBACK_KEYS.HISTORY}_${targetUserId}`, JSON.stringify(updated));
          }
          const userV1 = localStorage.getItem(`sakugrosir_history_v1_${targetUserId}`);
          if (userV1) {
            const list = JSON.parse(userV1);
            const updated = list.filter(item => item.id !== tripId);
            localStorage.setItem(`sakugrosir_history_v1_${targetUserId}`, JSON.stringify(updated));
          }
        }
        const raw = localStorage.getItem(FALLBACK_KEYS.HISTORY);
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.filter(item => item.id !== tripId);
          localStorage.setItem(FALLBACK_KEYS.HISTORY, JSON.stringify(updated));
        }
        const v1Raw = localStorage.getItem('sakugrosir_history_v1');
        if (v1Raw) {
          const list = JSON.parse(v1Raw);
          const updated = list.filter(item => item.id !== tripId);
          localStorage.setItem('sakugrosir_history_v1', JSON.stringify(updated));
        }
      } catch (e) { }
    }

    return { success: true };
  } catch (err) {
    console.error('[Supabase deleteShoppingTrip] Exception caught:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 7. MENGHAPUS SELURUH RIWAYAT BELANJA (TERISOLASI USER_ID)
 */
export async function clearAllShoppingHistory(userId = null) {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      } catch (e) { }
    }

    let error = null;
    if (targetUserId) {
      // 1. Ambil semua ID riwayat milik targetUserId
      const { data: userTrips, error: fetchErr } = await supabase
        .from('grocery_history')
        .select('id, notes');

      if (fetchErr) {
        return { success: false, error: fetchErr.message };
      }

      const matchingTrips = (userTrips || []).filter(t => {
        if (t.user_id && t.user_id === targetUserId) return true;
        if (t.notes && t.notes.includes(`##uid:${targetUserId}##`)) return true;
        return false;
      });

      if (matchingTrips.length > 0) {
        const tripIds = matchingTrips.map(t => t.id);

        // Hapus child items dari grocery_items terlebih dahulu agar tidak terblokir foreign key
        try {
          await supabase.from('grocery_items').delete().in('history_id', tripIds);
        } catch (e) { }

        // Hapus dari grocery_history berdasarkan ID
        const delRes = await supabase.from('grocery_history').delete().in('id', tripIds);
        error = delRes.error;
      } else {
        // Coba delete langsung dengan pola tag notes
        const delNotes = await supabase.from('grocery_history').delete().like('notes', `%##uid:${targetUserId}##%`);
        error = delNotes.error;
      }

      // Coba juga jika ada tabel history
      try {
        await supabase.from('history').delete().eq('user_id', targetUserId);
      } catch (e) { }
    } else {
      // Bersihkan seluruh riwayat
      try {
        await supabase.from('grocery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) { }
      const res = await supabase.from('grocery_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      error = res.error;
    }

    if (error) {
      console.warn('[Supabase clearAllShoppingHistory] Error:', error.message);
      return { success: false, error: error.message };
    }

    // Hapus dari LocalStorage fallback
    if (typeof localStorage !== 'undefined') {
      try {
        if (targetUserId) {
          localStorage.removeItem(`${FALLBACK_KEYS.HISTORY}_${targetUserId}`);
          localStorage.removeItem(`sakugrosir_history_v1_${targetUserId}`);
        }
        localStorage.removeItem(FALLBACK_KEYS.HISTORY);
        localStorage.removeItem('sakugrosir_history_v1');
        localStorage.removeItem('shoppingHistory');
        localStorage.removeItem('history');
      } catch (e) { }
    }

    return { success: true };
  } catch (err) {
    console.error('[Supabase clearAllShoppingHistory] Exception:', err.message);
    return { success: false, error: err.message };
  }
}

export const SINGLE_USER_STORAGE_KEY = 'sakugrosir_single_user_v1';
export const DEVICE_ACCOUNTS_STORAGE_KEY = 'sakugrosir_device_accounts_v1';
export const REGISTERED_USERS_STORAGE_KEY = 'sakugrosir_registered_users_v1';
export const USER_CREDENTIALS_STORAGE_KEY = 'sakugrosir_user_vault_v1';
export const DESIGNATED_OWNER_EMAIL = 'tjandra.xavier.wilson@gmail.com';

/**
 * Mengambil daftar kredensial akun terdaftar dari vault lokal
 * Menjamin akun tetap bisa login meskipun server SMTP Supabase terkena rate limit email (free-tier)
 */
export function getUserCredentials() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_CREDENTIALS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

/**
 * Menyimpan kredensial akun pengguna ke vault lokal
 */
export function saveUserCredential(cred) {
  if (typeof localStorage === 'undefined' || !cred?.email) return;
  try {
    let list = getUserCredentials();
    const cleanEmail = cred.email.trim().toLowerCase();
    list = list.filter(u => u.email.toLowerCase() !== cleanEmail);
    list.unshift({
      id: cred.id || 'usr_' + Date.now(),
      email: cleanEmail,
      pin: cred.pin || cred.password,
      fullName: cred.fullName || cred.name || cleanEmail.split('@')[0],
      provider: cred.provider || 'email_password',
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(USER_CREDENTIALS_STORAGE_KEY, JSON.stringify(list));
    addRegisteredEmail(cleanEmail);
  } catch (e) { }
}

/**
 * Verifikasi kredensial email dan PIN
 */
export function verifyUserCredential(email, pin) {
  if (!email || !pin) return { verified: false };
  const cleanEmail = email.trim().toLowerCase();
  const list = getUserCredentials();
  const found = list.find(u => u.email.toLowerCase() === cleanEmail);

  if (found) {
    if (String(found.pin) === String(pin)) {
      return { verified: true, user: found };
    }
    return { verified: false, wrongPin: true };
  }

  // Cek apakah pemilik yang ditunjuk (DESIGNATED_OWNER_EMAIL)
  if (cleanEmail === DESIGNATED_OWNER_EMAIL.toLowerCase()) {
    if (String(pin).length >= 6) {
      const ownerUser = {
        id: 'owner-txw',
        email: DESIGNATED_OWNER_EMAIL,
        pin: pin,
        fullName: 'Tjandra Xavier Wilson',
        provider: 'designated_owner'
      };
      saveUserCredential(ownerUser);
      return { verified: true, user: ownerUser };
    }
  }

  // Cek apakah ada di device accounts
  const devAccounts = getDeviceAccounts();
  const devFound = devAccounts.find(a => a.email.toLowerCase() === cleanEmail);
  if (devFound && String(pin).length >= 6) {
    const devUser = {
      id: devFound.id || 'usr_' + Date.now(),
      email: cleanEmail,
      pin: pin,
      fullName: devFound.name || cleanEmail.split('@')[0],
      provider: devFound.provider || 'email_password'
    };
    saveUserCredential(devUser);
    return { verified: true, user: devUser };
  }

  return { verified: false, notFound: true };
}

/**
 * Cek apakah email sudah terdaftar di sistem (Whitelist Akun)
 */
export async function isEmailRegistered(email) {
  if (!email) return false;
  const clean = email.toLowerCase().trim();

  // 0. Akun Pemilik Sistem selalu terdaftar
  if (clean === DESIGNATED_OWNER_EMAIL.toLowerCase()) {
    return true;
  }

  // 1. Cek dari LocalStorage daftar registrasi
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.some(e => e.toLowerCase() === clean)) {
          return true;
        }
      }
    } catch (e) { }
  }

  // 2. Cek dari LocalStorage credentials vault
  if (typeof localStorage !== 'undefined') {
    try {
      const vault = getUserCredentials();
      if (vault.some(u => u.email.toLowerCase() === clean)) {
        return true;
      }
    } catch (e) { }
  }

  // 3. Cek apakah ada di daftar akun tersimpan di perangkat
  if (typeof localStorage !== 'undefined') {
    try {
      const devAccounts = getDeviceAccounts();
      if (devAccounts.some(a => a.email.toLowerCase() === clean)) {
        return true;
      }
    } catch (e) { }
  }

  return false;
}

/**
 * Daftarkan email ke whitelist sistem
 */
export function addRegisteredEmail(email) {
  if (typeof localStorage === 'undefined' || !email) return;
  const clean = email.toLowerCase().trim();
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    if (!list.some(e => e.toLowerCase() === clean)) {
      list.push(clean);
      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) { }
}

/**
 * Sign in with Email & Password via Supabase Auth dengan Fallback Resilient
 * Menangani bug 'Invalid login credentials' akibat user unconfirmed / rate-limit
 */
export async function signInWithEmailPassword(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  try {
    // 1. Coba autentikasi via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (!error && data?.user) {
      addRegisteredEmail(cleanEmail);
      saveUserCredential({
        email: cleanEmail,
        pin: password,
        fullName: data.user.user_metadata?.full_name || cleanEmail.split('@')[0]
      });
      return { success: true, data };
    }

    // 2. Jika Supabase mengembalikan error (misal 'Invalid login credentials', 'Email not confirmed', rate limit, dsb)
    // Verifikasi terhadap kredensial lokal yang tersimpan di vault
    const check = verifyUserCredential(cleanEmail, password);
    if (check.verified && check.user) {
      addRegisteredEmail(cleanEmail);
      return {
        success: true,
        isLocalFallback: true,
        data: {
          user: {
            id: check.user.id || 'usr_' + Date.now(),
            email: cleanEmail,
            user_metadata: {
              full_name: check.user.fullName || cleanEmail.split('@')[0],
              name: check.user.fullName || cleanEmail.split('@')[0]
            },
            app_metadata: {
              provider: check.user.provider || 'email_password'
            }
          }
        }
      };
    }

    if (check.wrongPin) {
      return {
        success: false,
        error: 'Kata Sandi / PIN salah untuk akun ini. Pastikan PIN 6-digit sudah sesuai.'
      };
    }

    if (check.notFound) {
      return {
        success: false,
        error: 'Akun belum terdaftar di sistem. Silakan klik tab "Daftar" di atas untuk membuat akun terlebih dahulu.'
      };
    }

    return {
      success: false,
      error: error?.message || 'Email atau Kata Sandi / PIN salah. Pastikan akun sudah terdaftar.'
    };
  } catch (err) {
    // Fallback saat offline atau network timeout
    const check = verifyUserCredential(cleanEmail, password);
    if (check.verified && check.user) {
      return {
        success: true,
        isLocalFallback: true,
        data: {
          user: {
            id: check.user.id || 'usr_' + Date.now(),
            email: cleanEmail,
            user_metadata: { full_name: check.user.fullName || cleanEmail.split('@')[0] }
          }
        }
      };
    }
    return {
      success: false,
      error: 'Email atau Kata Sandi / PIN tidak cocok. Silakan coba kembali.'
    };
  }
}

/**
 * Sign up with Email & Password via Supabase Auth dengan penanganan 'Email rate limit exceeded'
 * Bebas macet: Menyimpan akun di vault lokal sehingga pengguna dapat langsung login tanpa terblokir kuota SMTP Supabase
 */
export async function signUpWithEmailPassword(email, password, fullName) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = fullName || cleanEmail.split('@')[0];

  // 1. Selalu rekam kredensial ke vault & whitelist sistem terlebih dahulu
  saveUserCredential({
    email: cleanEmail,
    pin: password,
    fullName: cleanName,
    provider: 'email_password'
  });
  addRegisteredEmail(cleanEmail);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: cleanName
        }
      }
    });

    if (error) {
      console.warn('[Supabase signUp] Supabase server error/notice:', error.message);
      const msg = (error.message || '').toLowerCase();

      // Penanganan khusus error rate limit kuota SMTP Supabase free tier
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || error.status === 429) {
        return {
          success: true,
          rateLimited: true,
          message: 'Registrasi berhasil tersimpan di sistem. Silakan login ulang dengan akun Anda.'
        };
      }

      // Akun sudah pernah terdaftar
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        return {
          success: true,
          alreadyExists: true,
          message: 'Akun ini sudah terdaftar. Silakan login langsung menggunakan email dan PIN Anda.'
        };
      }

      // Error konfirmasi email lainnya
      return {
        success: true,
        fallback: true,
        message: 'Registrasi berhasil tersimpan di sistem. Silakan login ulang dengan akun Anda.'
      };
    }

    return {
      success: true,
      data,
      message: 'Registrasi berhasil, silakan login ulang dengan akun Anda.'
    };
  } catch (err) {
    console.warn('[Supabase signUp catch]:', err.message);
    return {
      success: true,
      fallback: true,
      message: 'Registrasi berhasil tersimpan di sistem. Silakan login ulang dengan akun Anda.'
    };
  }
}

/**
 * Device Registered Accounts Manager (Tanpa hardcoded mock accounts!)
 * Hanya diisi dari akun yang benar-benar pernah sukses login di device ini.
 */
export function getDeviceAccounts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEVICE_ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveDeviceAccount(profile) {
  if (typeof localStorage === 'undefined' || !profile?.email) return;
  try {
    let accounts = getDeviceAccounts();
    accounts = accounts.filter(a => a.email.toLowerCase() !== profile.email.toLowerCase());
    accounts.unshift({
      id: profile.id || 'acc_' + Date.now(),
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      avatar_url: profile.avatar_url || null,
      provider: profile.provider || 'password',
      last_login: new Date().toISOString()
    });
    accounts = accounts.slice(0, 5);
    localStorage.setItem(DEVICE_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    addRegisteredEmail(profile.email);
  } catch (e) { }
}

export function removeDeviceAccount(email) {
  if (typeof localStorage === 'undefined' || !email) return [];
  try {
    let accounts = getDeviceAccounts();
    accounts = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(DEVICE_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  } catch (e) {
    return [];
  }
}

/**
 * Sign in with Google via Supabase OAuth Resmi (accounts.google.com)
 * Memicu flow OAuth resmi Google melalui Supabase Auth Client SDK
 * Dilengkapi proteksi try-catch & preflight check untuk mencegah error 400 layar hitam kosong jika Google provider belum diaktifkan di Supabase dashboard.
 */
export async function signInWithGoogle() {
  try {
    // 1. Preflight check untuk mendeteksi apakah Google Provider sudah diaktifkan di Supabase dashboard
    // Di dashboard Supabase (https://supabase.com/dashboard/project/ihickxbofezjqxncegda/auth/providers):
    // Buka menu Authentication -> Providers -> Google, aktifkan toggle "Enable Google provider",
    // lalu isi Client ID dan Client Secret dari Google Cloud Console.
    try {
      const checkRes = await fetch('/api/auth/google-check', { method: 'GET', cache: 'no-store' });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData && !checkData.enabled) {
          console.warn('[Supabase Google Auth] Google Provider belum aktif di dashboard Supabase:', checkData.error);
          console.info('👉 Petunjuk Admin: Di dashboard Supabase (https://supabase.com/dashboard), buka Authentication -> Providers -> Google, aktifkan toggle "Enable Google provider", lalu isi Client ID dan Client Secret dari Google Cloud Console.');
          return {
            success: false,
            isProviderDisabled: true,
            error: 'Login Google belum diaktifkan di konfigurasi Supabase. Silakan hubungi admin atau gunakan login email/password.'
          };
        }
      }
    } catch (apiErr) {
      console.warn('[Check Provider API Warning]:', apiErr.message);
    }

    // 2. Gunakan Supabase OAuth resmi dengan skipBrowserRedirect untuk mencegah layar hitam
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });

    if (error) {
      console.warn('[Supabase Google Auth Error]:', error.message);
      return {
        success: false,
        error: error.message.includes('not enabled') || error.message.includes('validation_failed')
          ? 'Login Google belum diaktifkan di konfigurasi Supabase. Silakan hubungi admin atau gunakan login email/password.'
          : error.message
      };
    }

    // 3. Jika URL authorize tersedia, lakukan verifikasi cepat sebelum redirect browser
    if (data?.url) {
      try {
        const preflight = await fetch(data.url, { method: 'GET', headers: { 'Accept': 'application/json' }, cache: 'no-store' });
        if (preflight.status === 400) {
          const body = await preflight.json().catch(() => ({}));
          console.warn('[Supabase Authorize Endpoint 400]:', body);
          return {
            success: false,
            isProviderDisabled: true,
            error: 'Login Google belum diaktifkan di konfigurasi Supabase. Silakan hubungi admin atau gunakan login email/password.'
          };
        }
      } catch (e) {
        // Jika fetch CORS/redirect biasa, abaikan error preflight
      }

      if (typeof window !== 'undefined') {
        let isInIframe = false;
        try {
          isInIframe = window.self !== window.top;
        } catch (e) {
          isInIframe = true;
        }

        if (isInIframe) {
          // Jika aplikasi dibuka di dalam Canvas / iframe / Webview, buka di tab baru
          window.open(data.url, '_blank');
        } else {
          // Popup Mode: Buka jendela pop-up Google Sign-In terpisah berukuran width=500, height=600
          const width = 500;
          const height = 600;
          const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
          const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
          const outerWidth = window.outerWidth || document.documentElement.clientWidth || screen.width;
          const outerHeight = window.outerHeight || document.documentElement.clientHeight || screen.height;
          const left = Math.max(0, Math.round(screenLeft + (outerWidth - width) / 2));
          const top = Math.max(0, Math.round(screenTop + (outerHeight - height) / 2));

          const popup = window.open(
            data.url,
            'google_oauth_popup',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes`
          );

          if (popup) {
            popup.focus();

            // Monitor penutupan popup jika pengguna membatalkan atau menutup jendela pop-up manual
            const popupTimer = setInterval(() => {
              if (!popup || popup.closed) {
                clearInterval(popupTimer);
                try {
                  window.dispatchEvent(new CustomEvent('google_popup_closed'));
                } catch (e) {}
              }
            }, 500);
          } else {
            // Fallback jika browser memblokir pop-up otomatis
            window.location.href = data.url;
          }
        }
      }
      return { success: true, data };
    }

    return { success: false, error: 'Gagal mendapatkan URL Google OAuth.' };
  } catch (err) {
    console.warn('[Supabase Google Auth Exception]:', err.message);
    return {
      success: false,
      error: 'Login Google belum diaktifkan di konfigurasi Supabase. Silakan hubungi admin atau gunakan login email/password.'
    };
  } finally {
    console.log('[Supabase Google Auth Request Completed]');
  }
}

/**
 * Sign out dari sesi aktif dan bersihkan seluruh state/token/data pengguna dari storage (Pencegahan Data Bleeding)
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (err) { }
  if (typeof localStorage !== 'undefined') {
    // Kunci spesifik yang diminta user untuk dibersihkan total
    localStorage.removeItem('cartItems');
    localStorage.removeItem('budgetLimit');
    localStorage.removeItem('shoppingHistory');

    // Kunci modul otentikasi & identitas
    localStorage.removeItem(SINGLE_USER_STORAGE_KEY);
    localStorage.removeItem('sakugrosir_is_logged_in');

    // Kunci data lokal belanjaan
    localStorage.removeItem('sakugrosir_cart_v1');
    localStorage.removeItem('sakugrosir_budget_v1');
    localStorage.removeItem('sakugrosir_history_v1');
    localStorage.removeItem('sakugrosir_store_name_v1');
    localStorage.removeItem('sakugrosir_trans_date_v1');
    localStorage.removeItem('sakugrosir_single_user_v1');
    localStorage.removeItem('sakugrosir_offline_history');
    localStorage.removeItem('sakugrosir_offline_budget');
    localStorage.removeItem('sakugrosir_sample_history_initialized');
  }
  return { success: true };
}

/**
 * Mengambil sesi autentikasi pengguna aktual (tanpa dummy user hardcoded)
 */
export async function getSingleUserSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const u = session.user;
      return {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
        avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
        provider: session.user.app_metadata?.provider || 'supabase',
        role: 'user',
        authenticated_at: new Date().toISOString()
      };
    }
  } catch (e) { }

  return null;
}

/**
 * Enforces single user access policy (restricts multi-user signup/access if configured)
 */
export function verifySingleUserPolicy(email) {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const designated = DESIGNATED_OWNER_EMAIL.toLowerCase().trim();
  return clean === designated;
}

/**
 * Helper untuk men-generate objek prices default untuk 4 supermarket utama
 * Mengacu pada 4 supermarket utama dengan history: null untuk barang custom baru
 */
export function generateDefaultPrices(basePrice = 10000) {
  const cleanStr = String(basePrice ?? '').replace(/[^0-9]/g, '');
  const price = cleanStr ? Number(cleanStr) : 10000;
  return {
    'Lotte Mart - Puri Indah': { current: price, history: null },
    'Super Indo - Pesanggrahan': { current: price, history: null },
    'Hypermart - Puri Mall': { current: price, history: null },
    'Indogrosir Daan Mogot': { current: price, history: null }
  };
}

export const CONFIG_TAG = '##sakugrosir_custom_config##';

/**
 * Mengambil konfigurasi custom stores dan custom products dari Cloud Supabase
 */
export async function fetchCloudCustomConfig() {
  try {
    const { data, error } = await supabase
      .from('grocery_history')
      .select('id, notes, created_at')
      .ilike('notes', `${CONFIG_TAG}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.notes) return null;
    const jsonStr = data.notes.slice(CONFIG_TAG.length);
    const parsed = JSON.parse(jsonStr);
    return { id: data.id, ...parsed };
  } catch (err) {
    return null;
  }
}

/**
 * Menyimpan konfigurasi custom stores dan custom products ke Cloud Supabase
 */
export async function saveCloudCustomConfig(config) {
  try {
    const existing = await fetchCloudCustomConfig();
    const today = (function () {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const payload = {
      shopping_date: today,
      total_spent: 0,
      notes: CONFIG_TAG + JSON.stringify({
        stores: config.stores || [],
        products: config.products || []
      })
    };

    if (existing && existing.id) {
      await supabase
        .from('grocery_history')
        .update(payload)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('grocery_history')
        .insert([payload]);
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Simpan barang custom baru ke tabel products Supabase & Cloud Sync Hub dengan fallback LocalStorage
 */
export async function insertCustomProduct(productData) {
  if (!productData || !productData.name) {
    return { success: false, error: 'Nama produk kosong' };
  }

  let targetUserId = productData.user_id;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        targetUserId = parsed?.id;
      }
    } catch (e) { }
  }
  if (!targetUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    } catch (e) { }
  }

  const pricesObj = productData.prices || generateDefaultPrices(productData.price);
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

  const payload = {
    id: generatedId,
    name: productData.name.trim(),
    category: productData.category || 'Bahan Pokok',
    unit: productData.unit || 'pcs',
    prices: pricesObj,
    is_custom: true,
    isCustom: true,
    price: productData.price,
    base_price: productData.base_price ?? productData.price,
    barcode: productData.barcode || null,
    user_id: targetUserId || null
  };

  // 1. Simpan ke offline fallback LocalStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('sakugrosir_custom_products_v1');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter(p => p.id !== generatedId && p.name.toLowerCase() !== payload.name.toLowerCase());
      filtered.unshift(payload);
      localStorage.setItem('sakugrosir_custom_products_v1', JSON.stringify(filtered));
    } catch (e) { }
  }

  // 2. Simpan ke Supabase tabel products jika tabel sudah ada di PostgreSQL
  try {
    const rawPrice = Number(String(payload.base_price ?? payload.price ?? 0).replace(/[^0-9]/g, ''));
    const insertPayload = {
      id: generatedId,
      name: payload.name,
      category: payload.category || 'Bahan Pokok',
      is_custom: true,
      user_id: payload.user_id,
      base_price: rawPrice,
      barcode: payload.barcode || null
    };
    let { data, error } = await supabase
      .from('products')
      .insert([insertPayload])
      .select();

    if (error && (error.message?.includes('barcode') || error.code === '42703' || error.code === 'PGRST204')) {
      const fallbackPayload = { ...insertPayload };
      delete fallbackPayload.barcode;
      const res = await supabase.from('products').insert([fallbackPayload]).select();
      data = res.data;
      error = res.error;
    }

    if (!error && data?.[0]) {
      payload.id = data[0].id;
    }
  } catch (err) { }

  // 3. Simpan ke Cloud Sync Hub di Supabase (grocery_history config) untuk persistensi multi-device
  try {
    const cloudConfig = await fetchCloudCustomConfig();
    const currentProds = cloudConfig?.products || [];
    const filtered = currentProds.filter(p => p.name.toLowerCase() !== payload.name.toLowerCase());
    filtered.unshift(payload);
    await saveCloudCustomConfig({
      stores: cloudConfig?.stores || [],
      products: filtered
    });
  } catch (e) { }

  return { success: true, data: payload };
}

/**
 * Mengambil daftar barang custom / produk dari Supabase Cloud & LocalStorage
 */
export async function getCustomProducts(userId = null) {
  let localList = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('sakugrosir_custom_products_v1');
      if (stored) localList = JSON.parse(stored);
    } catch (e) { }
  }

  const byName = new Map();
  let isTableReachable = false;

  // 1. Coba ambil dari tabel products Supabase (Single Source of Truth)
  try {
    let targetUserId = userId;
    if (!targetUserId && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakugrosir_single_user_v1') || localStorage.getItem('sakugrosir_auth_user_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          targetUserId = parsed?.id;
        }
      } catch (e) {}
    }
    if (!targetUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      } catch (e) {}
    }

    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }
    const { data, error } = await query;
    if (!error && data !== null) {
      isTableReachable = true;
      data.forEach(item => {
        if (item && item.name) {
          const key = item.name.toLowerCase();
          const localItem = localList.find(l => l && l.name && l.name.toLowerCase() === key);
          const rawPrice = Number(String(item.base_price ?? item.price ?? localItem?.price ?? 0).replace(/[^0-9]/g, ''));
          const unit = item.unit || localItem?.unit || 'pcs';
          const prices = item.prices || generateDefaultPrices(rawPrice);
          byName.set(key, {
            ...localItem,
            ...item,
            id: item.id, // ID asli dari Supabase
            unit,
            price: rawPrice,
            base_price: rawPrice,
            prices,
            barcode: item.barcode || localItem?.barcode || null,
            isCustom: true,
            historyPrice: null,
            lastMonthPrice: null
          });
        }
      });
    }
  } catch (err) { }

  // 2. Ambil dari fallback HANYA jika tabel database belum dapat diakses (offline/missing table)
  if (!isTableReachable) {
    try {
      const cloudConfig = await fetchCloudCustomConfig();
      if (cloudConfig?.products && Array.isArray(cloudConfig.products)) {
        cloudConfig.products.forEach(item => {
          if (item && item.name && !byName.has(item.name.toLowerCase())) {
            byName.set(item.name.toLowerCase(), {
              ...item,
              isCustom: true,
              historyPrice: null,
              lastMonthPrice: null
            });
          }
        });
      }
    } catch (e) { }

    localList.forEach(item => {
      if (item && item.name && !byName.has(item.name.toLowerCase())) {
        byName.set(item.name.toLowerCase(), {
          ...item,
          isCustom: true,
          historyPrice: null,
          lastMonthPrice: null
        });
      }
    });
  }

  const merged = Array.from(byName.values());
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('sakugrosir_custom_products_v1', JSON.stringify(merged));
    } catch (e) { }
  }
  return merged;
}

/**
 * Simpan Lokasi Supermarket Kustom ke Supabase & Cloud Sync Hub
 */
export async function insertCustomStore(storeName, userId = null) {
  if (!storeName || !storeName.trim()) return { success: false, error: 'Nama toko tidak boleh kosong' };
  const cleanName = storeName.trim();

  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        targetUserId = parsed?.id;
      }
    } catch (e) { }
  }
  if (!targetUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    } catch (e) { }
  }

  const tempId = 'store-' + Date.now();
  const normalizedItem = {
    id: tempId,
    store_name: cleanName,
    name: cleanName,
    user_id: targetUserId || null,
    isCustom: true
  };

  // 1. Simpan ke offline storage fallback
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('sakugrosir_custom_stores_v1');
      const list = stored ? JSON.parse(stored) : [];
      const exists = list.some(item => (typeof item === 'string' ? item : item.store_name || item.name) === cleanName);
      if (!exists) {
        list.push(normalizedItem);
        localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(list));
      }
    } catch (e) { }
  }

  // 2. Simpan ke Supabase tabel custom_stores jika tabel sudah ada di PostgreSQL
  try {
    const payload = {
      store_name: cleanName,
      user_id: targetUserId || null
    };

    const { data, error } = await supabase
      .from('custom_stores')
      .insert([payload])
      .select();

    if (!error && data?.[0]) {
      normalizedItem.id = data[0].id;
    }
  } catch (err) { }

  // 3. Simpan ke Cloud Sync Hub di Supabase (grocery_history config) untuk persistensi multi-device
  try {
    const cloudConfig = await fetchCloudCustomConfig();
    const currentStores = cloudConfig?.stores || [];
    const exists = currentStores.some(s => (typeof s === 'string' ? s : s.name || s.store_name) === cleanName);
    if (!exists) {
      currentStores.push(normalizedItem);
      await saveCloudCustomConfig({
        stores: currentStores,
        products: cloudConfig?.products || []
      });
    }
  } catch (e) { }

  return { success: true, store_name: cleanName, id: normalizedItem.id, data: normalizedItem };
}

/**
 * Hapus Lokasi Supermarket Kustom dari Supabase (tabel custom_stores & Cloud Sync) & LocalStorage
 */
export async function deleteCustomStore(storeId, storeName = null, userId = null) {
  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        targetUserId = parsed?.id;
      }
    } catch (e) { }
  }

  // 1. Eksekusi delete ke Supabase tabel custom_stores jika ada
  try {
    let query = supabase.from('custom_stores').delete();
    if (storeId && !String(storeId).startsWith('store-') && !String(storeId).startsWith('local-')) {
      query = query.eq('id', storeId);
    } else if (storeName) {
      query = query.eq('store_name', storeName);
    }
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }
    await query;
  } catch (err) { }

  // 2. Hapus dari Cloud Sync Hub di Supabase dengan fast timeout
  try {
    const syncPromise = (async () => {
      const cloudConfig = await fetchCloudCustomConfig();
      if (cloudConfig?.stores) {
        const updatedStores = cloudConfig.stores.filter(s => {
          if (typeof s === 'string') return s !== storeName;
          const sName = s.store_name || s.name;
          const sId = s.id;
          if (storeId && sId === storeId) return false;
          if (storeName && sName === storeName) return false;
          return true;
        });
        await saveCloudCustomConfig({
          stores: updatedStores,
          products: cloudConfig.products || []
        });
      }
    })();
    await Promise.race([syncPromise, new Promise(res => setTimeout(res, 1200))]);
  } catch (e) { }

  // 3. Bersihkan dari LocalStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('sakugrosir_custom_stores_v1');
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter(item => {
          if (typeof item === 'string') return item !== storeName;
          const sName = item.store_name || item.name;
          const sId = item.id;
          if (storeId && sId === storeId) return false;
          if (storeName && sName === storeName) return false;
          return true;
        });
        localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(list));
      }
      localStorage.removeItem('sakugrosir_custom_stores');
      if (targetUserId) {
        localStorage.removeItem(`sakugrosir_custom_stores_${targetUserId}`);
      }
    } catch (e) { }
  }

  return { success: true };
}

/**
 * Hapus Barang Kustom dari Supabase (tabel products & Cloud Sync) & LocalStorage
 */
export async function deleteCustomProduct(productId, productName = null, userId = null) {
  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        targetUserId = parsed?.id;
      }
    } catch (e) { }
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(productId));

  // 1. Eksekusi delete ke Supabase tabel products jika ada
  try {
    let query = supabase.from('products').delete();
    if (isUuid) {
      query = query.eq('id', productId);
    } else if (productName) {
      query = query.eq('name', productName);
    }
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }
    await query;
  } catch (err) {
    console.warn('[deleteCustomProduct query warning]:', err);
  }

  // 2. Hapus dari Cloud Sync Hub di Supabase dengan fast timeout
  try {
    const syncPromise = (async () => {
      const cloudConfig = await fetchCloudCustomConfig();
      if (cloudConfig?.products) {
        const updatedProds = cloudConfig.products.filter(p => {
          if (productId && p.id === productId) return false;
          if (productName && p.name === productName) return false;
          return true;
        });
        await saveCloudCustomConfig({
          stores: cloudConfig.stores || [],
          products: updatedProds
        });
      }
    })();
    await Promise.race([syncPromise, new Promise(res => setTimeout(res, 1200))]);
  } catch (e) { }

  // 3. Bersihkan dari LocalStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('sakugrosir_custom_products_v1');
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter(item => {
          if (productId && item.id === productId) return false;
          if (productName && item.name === productName) return false;
          return true;
        });
        localStorage.setItem('sakugrosir_custom_products_v1', JSON.stringify(list));
      }
      localStorage.removeItem('sakugrosir_custom_products');
      if (targetUserId) {
        localStorage.removeItem(`sakugrosir_custom_products_${targetUserId}`);
      }
    } catch (e) { }
  }

  return { success: true };
}

/**
 * Ambil Daftar Supermarket Kustom dari Supabase & LocalStorage
 */
export async function getCustomStores(userId = null) {
  let localList = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('sakugrosir_custom_stores_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localList = parsed.map((item, idx) => {
            if (typeof item === 'string') {
              return { id: `local-store-${idx}-${item}`, store_name: item, name: item, isCustom: true };
            }
            return {
              id: item.id || `local-store-${idx}-${item.store_name || item.name}`,
              store_name: item.store_name || item.name,
              name: item.store_name || item.name,
              isCustom: true
            };
          });
        }
      }
    } catch (e) { }
  }

  const byName = new Map();
  let isTableReachable = false;

  // 1. Coba ambil dari tabel custom_stores Supabase (Single Source of Truth)
  try {
    let targetUserId = userId;
    if (!targetUserId && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakugrosir_single_user_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          targetUserId = parsed?.id;
        }
      } catch (e) { }
    }
    if (!targetUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      } catch (e) { }
    }

    let query = supabase.from('custom_stores').select('*').order('created_at', { ascending: true });
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }
    const { data, error } = await query;
    if (!error && data !== null) {
      isTableReachable = true;
      data.forEach(item => {
        if (item && item.store_name) {
          byName.set(item.store_name.toLowerCase(), {
            id: item.id,
            store_name: item.store_name,
            name: item.store_name,
            user_id: item.user_id,
            created_at: item.created_at,
            isCustom: true
          });
        }
      });
    }
  } catch (err) { }

  // 2. Ambil dari fallback HANYA jika tabel database belum dapat diakses (offline/missing table)
  if (!isTableReachable) {
    try {
      const cloudConfig = await fetchCloudCustomConfig();
      if (cloudConfig?.stores && Array.isArray(cloudConfig.stores)) {
        cloudConfig.stores.forEach(item => {
          const key = (typeof item === 'string' ? item : (item.store_name || item.name || '')).toLowerCase();
          if (key && !byName.has(key)) {
            byName.set(key, typeof item === 'string' ? { id: `cloud-store-${key}`, name: item, store_name: item, isCustom: true } : { ...item, isCustom: true });
          }
        });
      }
    } catch (e) { }

    localList.forEach(item => {
      const key = (item.store_name || item.name || '').toLowerCase();
      if (key && !byName.has(key)) {
        byName.set(key, item);
      }
    });
  }

  const merged = Array.from(byName.values());
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('sakugrosir_custom_stores_v1', JSON.stringify(merged));
    } catch (e) { }
  }
  return merged;
}


// ==============================================================================
// 7. TOKO KUSTOM & PRODUK REALTIME SYNC (CROSS-DEVICE SYNC)
// ==============================================================================

/**
 * Mengambil daftar toko kustom pengguna dari Supabase Cloud & LocalStorage
 */
export async function getCustomStoresFromSupabase(userId = null) {
  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) targetUserId = JSON.parse(saved)?.id;
    } catch (e) { }
  }
  if (!targetUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    } catch (e) { }
  }

  let localStores = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const key = targetUserId ? `sakugrosir_custom_stores_${targetUserId}` : 'sakugrosir_custom_stores';
      const raw = localStorage.getItem(key);
      if (raw) localStores = JSON.parse(raw);
    } catch (e) { }
  }

  try {
    let query = supabase.from('custom_stores').select('*').order('created_at', { ascending: true });
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('[Supabase getCustomStores] Notice:', error.message);
      return localStores;
    }
    if (data && Array.isArray(data)) {
      if (typeof localStorage !== 'undefined') {
        const key = targetUserId ? `sakugrosir_custom_stores_${targetUserId}` : 'sakugrosir_custom_stores';
        localStorage.setItem(key, JSON.stringify(data));
      }
      return data;
    }
    return localStores;
  } catch (err) {
    console.warn('[Supabase getCustomStores] Exception:', err.message);
    return localStores;
  }
}

/**
 * Menyimpan toko kustom baru ke Supabase & LocalStorage
 */
export async function saveCustomStoreToSupabase(storeName, userId = null) {
  if (!storeName || !storeName.trim()) return null;
  const cleanName = storeName.trim();
  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) targetUserId = JSON.parse(saved)?.id;
    } catch (e) { }
  }
  if (!targetUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    } catch (e) { }
  }

  const newStoreObj = {
    id: 'store-' + Date.now(),
    name: cleanName,
    user_id: targetUserId || null,
    created_at: new Date().toISOString()
  };

  // Simpan ke local storage
  if (typeof localStorage !== 'undefined') {
    try {
      const key = targetUserId ? `sakugrosir_custom_stores_${targetUserId}` : 'sakugrosir_custom_stores';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      if (!current.some(s => (s.name || s).toLowerCase() === cleanName.toLowerCase())) {
        current.push(newStoreObj);
        localStorage.setItem(key, JSON.stringify(current));
      }
    } catch (e) { }
  }

  try {
    const { data, error } = await supabase
      .from('custom_stores')
      .insert([{ name: cleanName, user_id: targetUserId || null }])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase saveCustomStore] Notice (saved locally):', error.message);
      return newStoreObj;
    }
    return data || newStoreObj;
  } catch (err) {
    console.warn('[Supabase saveCustomStore] Exception:', err.message);
    return newStoreObj;
  }
}

/**
 * Mengambil daftar produk kustom / rekomendasi belanja dari Supabase & LocalStorage
 */
export async function getCustomProductsFromSupabase(userId = null) {
  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) targetUserId = JSON.parse(saved)?.id;
    } catch (e) { }
  }
  if (!targetUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    } catch (e) { }
  }

  let localProducts = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const key = targetUserId ? `sakugrosir_custom_products_${targetUserId}` : 'sakugrosir_custom_products';
      const raw = localStorage.getItem(key);
      if (raw) localProducts = JSON.parse(raw);
    } catch (e) { }
  }

  try {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('[Supabase getCustomProducts] Notice:', error.message);
      return localProducts;
    }
    if (data && Array.isArray(data)) {
      if (typeof localStorage !== 'undefined') {
        const key = targetUserId ? `sakugrosir_custom_products_${targetUserId}` : 'sakugrosir_custom_products';
        localStorage.setItem(key, JSON.stringify(data));
      }
      return data;
    }
    return localProducts;
  } catch (err) {
    console.warn('[Supabase getCustomProducts] Exception:', err.message);
    return localProducts;
  }
}

/**
 * Menghapus produk kustom dari Supabase & LocalStorage
 */
export async function deleteCustomProductFromSupabase(productId, userId = null) {
  if (!productId) return false;
  let targetUserId = userId;
  if (!targetUserId && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('sakugrosir_single_user_v1');
      if (saved) targetUserId = JSON.parse(saved)?.id;
    } catch (e) { }
  }

  // Hapus dari local storage
  if (typeof localStorage !== 'undefined') {
    try {
      const key = targetUserId ? `sakugrosir_custom_products_${targetUserId}` : 'sakugrosir_custom_products';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = current.filter(p => p.id !== productId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) { }
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.warn('[Supabase deleteCustomProduct] Notice:', error.message);
    }
    return true;
  } catch (err) {
    console.warn('[Supabase deleteCustomProduct] Exception:', err.message);
    return true;
  }
}
