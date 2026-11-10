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
  user_id UUID, -- Terikat dengan auth.users(id) untuk isolasi data antar-akun
  monthly_budget_cap NUMERIC NOT NULL DEFAULT 500000,
  warning_threshold NUMERIC DEFAULT 0.8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL: grocery_history
-- Menyimpan sesi transaksi belanja bulanan (struk belanja) per pengguna
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.grocery_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Terikat dengan auth.users(id) untuk mencegah kebocoran data (Data Bleeding)
  shopping_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  notes TEXT, -- Menyimpan nama supermarket/toko (misal: "Indogrosir Super Kos")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3B. TABEL: history (Alias / Skema Riwayat Belanja Terisolasi)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Terikat dengan auth.users(id)
  shopping_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3C. TABEL: carts (Penyimpanan State Keranjang Aktif per Akun)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Terikat dengan auth.users(id)
  items JSONB DEFAULT '[]'::jsonb,
  budget_limit NUMERIC DEFAULT 350000,
  store_name TEXT,
  transaction_date TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
-- 6. ROW LEVEL SECURITY (RLS) POLICIES (ISOLASI DATA ANTAR-AKUN: auth.uid() = user_id)
-- ==============================================================================
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- A. Kebijakan Akses: grocery_history & history (SELECT, INSERT, UPDATE, DELETE hanya milik user_id = auth.uid())
DROP POLICY IF EXISTS "Users can only access their own grocery_history" ON public.grocery_history;
CREATE POLICY "Users can only access their own grocery_history" 
  ON public.grocery_history FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own history" ON public.history;
CREATE POLICY "Users can only access their own history" 
  ON public.history FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- B. Kebijakan Akses: carts (Isolasi State Keranjang Belanja per Akun)
DROP POLICY IF EXISTS "Users can only access their own carts" ON public.carts;
CREATE POLICY "Users can only access their own carts" 
  ON public.carts FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- C. Kebijakan Akses: budget_settings
DROP POLICY IF EXISTS "Users can only access their own budget_settings" ON public.budget_settings;
CREATE POLICY "Users can only access their own budget_settings" 
  ON public.budget_settings FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- D. Kebijakan Akses: grocery_items (terikat dengan grocery_history milik pengguna aktif)
DROP POLICY IF EXISTS "Users can only access their own grocery_items" ON public.grocery_items;
CREATE POLICY "Users can only access their own grocery_items" 
  ON public.grocery_items FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_history
      WHERE grocery_history.id = grocery_items.history_id
      AND grocery_history.user_id = auth.uid()
    )
  ) 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grocery_history
      WHERE grocery_history.id = grocery_items.history_id
      AND grocery_history.user_id = auth.uid()
    )
  );

-- E. Kebijakan Fallback Publik / Anonim (Pengecekan testing offline lokal)
DROP POLICY IF EXISTS "Public select budget_settings" ON public.budget_settings;
CREATE POLICY "Public select budget_settings" 
  ON public.budget_settings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public select grocery_history" ON public.grocery_history;
CREATE POLICY "Public select grocery_history" 
  ON public.grocery_history FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Public select grocery_items" ON public.grocery_items;
CREATE POLICY "Public select grocery_items" 
  ON public.grocery_items FOR SELECT 
  USING (true);

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
