-- ==============================================================================
-- SMART GROCERY PRICE TRACKER & BUDGET SAFETY CAP (SAKUGROSIR)
-- SUPABASE POSTGRESQL DDL SCHEMA SETUP
-- ==============================================================================

-- 1. AKTIFKAN EKSTENSI UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABEL: budget_settings
-- Menyimpan preferensi batas anggaran saku bulanan dan ambang batas peringatan
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budget_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Opsional / dapat berelasi dengan auth.users(id) jika menggunakan autentikasi
  monthly_budget_cap NUMERIC NOT NULL DEFAULT 500000,
  warning_threshold NUMERIC DEFAULT 0.8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL: grocery_history
-- Menyimpan sesi transaksi belanja bulanan (struk belanja)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.grocery_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  notes TEXT, -- Menyimpan nama supermarket/toko (misal: "Indogrosir Super Kos")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABEL: grocery_items
-- Menyimpan detail baris item belanjaan dengan formula diskon & harga riwayat
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  history_id UUID REFERENCES public.grocery_history(id) ON DELETE CASCADE,
  nama_barang TEXT NOT NULL,
  kategori TEXT,
  satuan TEXT CHECK (satuan IN ('kg', 'liter', 'pcs', 'pack')),
  kuantitas NUMERIC NOT NULL DEFAULT 1,
  harga_satuan NUMERIC NOT NULL,
  diskon_persen_1 NUMERIC DEFAULT 0,
  diskon_persen_2 NUMERIC DEFAULT 0,
  potongan_langsung NUMERIC DEFAULT 0,
  harga_akhir_per_satuan NUMERIC NOT NULL,
  total_harga_item NUMERIC NOT NULL,
  harga_bulan_lalu NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. INDEXING UNTUK OPTIMASI PERFORMA & QUERY HARGA BULAN LALU
-- ==============================================================================
-- Indeks pencarian nama barang & pengurutan tanggal
CREATE INDEX IF NOT EXISTS idx_grocery_items_nama_barang 
  ON public.grocery_items (nama_barang);

CREATE INDEX IF NOT EXISTS idx_grocery_items_created_at 
  ON public.grocery_items (created_at DESC);

-- Indeks komposit cepat untuk query "Harga Terakhir / Bulan Lalu":
-- SELECT harga_akhir_per_satuan FROM grocery_items WHERE lower(nama_barang) = lower($1) ORDER BY created_at DESC LIMIT 1;
CREATE INDEX IF NOT EXISTS idx_grocery_items_lookup_last_price 
  ON public.grocery_items (lower(nama_barang), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_grocery_items_history_id 
  ON public.grocery_items (history_id);

CREATE INDEX IF NOT EXISTS idx_grocery_history_shopping_date 
  ON public.grocery_history (shopping_date DESC);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: budget_settings
DROP POLICY IF EXISTS "Public select budget_settings" ON public.budget_settings;
CREATE POLICY "Public select budget_settings" 
  ON public.budget_settings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public modify budget_settings" ON public.budget_settings;
CREATE POLICY "Public modify budget_settings" 
  ON public.budget_settings FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Kebijakan Akses: grocery_history
DROP POLICY IF EXISTS "Public select grocery_history" ON public.grocery_history;
CREATE POLICY "Public select grocery_history" 
  ON public.grocery_history FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public insert grocery_history" ON public.grocery_history;
CREATE POLICY "Public insert grocery_history" 
  ON public.grocery_history FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Kebijakan Akses: grocery_items
DROP POLICY IF EXISTS "Public select grocery_items" ON public.grocery_items;
CREATE POLICY "Public select grocery_items" 
  ON public.grocery_items FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public insert grocery_items" ON public.grocery_items;
CREATE POLICY "Public insert grocery_items" 
  ON public.grocery_items FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ==============================================================================
-- 7. TRIGGER AUTO UPDATE TIMESTAMP (budget_settings.updated_at)
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_budget_settings_updated_at ON public.budget_settings;
CREATE TRIGGER trigger_update_budget_settings_updated_at
  BEFORE UPDATE ON public.budget_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. DATA INSIALISASI DEFAULT (OPTIONAL SEED DATA)
-- ==============================================================================
INSERT INTO public.budget_settings (monthly_budget_cap, warning_threshold)
SELECT 500000, 0.8
WHERE NOT EXISTS (SELECT 1 FROM public.budget_settings);
