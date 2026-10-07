// Browser-Ready Supabase Client Helper for SakuGrosir PWA

(function() {
  const SUPABASE_URL = 
    (window.__ENV__ && window.__ENV__.SUPABASE_URL) ||
    'https://ihickxbofezjqxncegda.supabase.co';

  const SUPABASE_ANON_KEY = 
    (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaWNreGJvZmV6anF4bmNlZ2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzAzOTAsImV4cCI6MjEwNjkwNjM5MH0.6ralu-BuIifgYvA3ep-ItX4mAlky7i7dlz1x0vtNzzE';

  let client = null;
  function getClient() {
    if (!client && window.supabase && window.supabase.createClient) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return client;
  }

  const SupabaseHelper = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,

    isAvailable() {
      return !!getClient();
    },

    /**
     * 1. Mengambil harga terakhir berdasarkan nama_barang
     */
    async getLastPrice(namaBarang) {
      if (!namaBarang || !namaBarang.trim()) return null;
      const cleanName = namaBarang.trim();
      const sb = getClient();

      if (!sb) {
        return window.groceryStore?.lookupPastPrice(cleanName) || null;
      }

      try {
        const { data, error } = await sb
          .from('grocery_items')
          .select('harga_akhir_per_satuan, created_at')
          .ilike('nama_barang', cleanName)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('[Supabase getLastPrice] Error or table not created yet:', error.message);
          return window.groceryStore?.lookupPastPrice(cleanName) || null;
        }

        if (data && data.harga_akhir_per_satuan !== undefined) {
          return Number(data.harga_akhir_per_satuan);
        }
        return window.groceryStore?.lookupPastPrice(cleanName) || null;
      } catch (e) {
        console.warn('[Supabase getLastPrice] Offline fallback:', e.message);
        return window.groceryStore?.lookupPastPrice(cleanName) || null;
      }
    },

    /**
     * 2. Menyimpan seluruh transaksi keranjang belanja (batch insert ke grocery_history & grocery_items)
     */
    async saveShoppingTrip(historyData, itemsList) {
      const sb = getClient();
      if (!sb) return { success: false, offline: true };

      try {
        // A. Insert ke grocery_history
        const { data: historyRow, error: historyErr } = await sb
          .from('grocery_history')
          .insert([{
            shopping_date: historyData.shopping_date || new Date().toISOString().split('T')[0],
            total_spent: Number(historyData.total_spent) || 0,
            notes: historyData.notes || 'Supermarket Grosir'
          }])
          .select()
          .single();

        if (historyErr) {
          console.warn('[Supabase saveShoppingTrip] History error:', historyErr.message);
          return { success: false, error: historyErr.message };
        }

        // B. Insert batch ke grocery_items
        if (itemsList && itemsList.length > 0) {
          const batchItems = itemsList.map(item => ({
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

          const { error: itemsErr } = await sb
            .from('grocery_items')
            .insert(batchItems);

          if (itemsErr) {
            console.warn('[Supabase saveShoppingTrip] Items batch error:', itemsErr.message);
          }
        }

        return { success: true, historyId: historyRow.id };
      } catch (e) {
        console.warn('[Supabase saveShoppingTrip] Exception caught, fallback active:', e.message);
        return { success: false, error: e.message };
      }
    },

    /**
     * 3. Mengambil batas anggaran dompet
     */
    async getBudgetSettings() {
      const sb = getClient();
      if (!sb) return null;

      try {
        const { data, error } = await sb
          .from('budget_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) return null;
        return {
          monthly_budget_cap: Number(data.monthly_budget_cap),
          warning_threshold: Number(data.warning_threshold) || 0.8
        };
      } catch (e) {
        return null;
      }
    },

    /**
     * 4. Memperbarui batas anggaran dompet
     */
    async updateBudgetSettings(monthlyBudgetCap, warningThreshold = 0.8) {
      const sb = getClient();
      if (!sb) return false;

      try {
        const { data: existing } = await sb
          .from('budget_settings')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (existing && existing.id) {
          await sb
            .from('budget_settings')
            .update({
              monthly_budget_cap: Number(monthlyBudgetCap),
              warning_threshold: Number(warningThreshold),
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          await sb
            .from('budget_settings')
            .insert([{
              monthly_budget_cap: Number(monthlyBudgetCap),
              warning_threshold: Number(warningThreshold)
            }]);
        }
        return true;
      } catch (e) {
        console.warn('[Supabase updateBudgetSettings] Sync error:', e.message);
        return false;
      }
    }
  };

  window.SupabaseHelper = SupabaseHelper;
})();
