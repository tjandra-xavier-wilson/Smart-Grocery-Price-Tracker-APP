-- ==============================================================================
-- SKRIP SETUP DATABASE SUPABASE: public.custom_stores & public.products
-- Jalankan skrip ini di SQL Editor dasbor Supabase Anda (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Buat tabel untuk lokasi toko kustom
CREATE TABLE IF NOT EXISTS public.custom_stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat tabel untuk barang kustom
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.custom_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Buat Policy agar pengguna hanya bisa akses datanya sendiri
DROP POLICY IF EXISTS "User can manage their own stores" ON public.custom_stores;
CREATE POLICY "User can manage their own stores" ON public.custom_stores FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can manage their own products" ON public.products;
CREATE POLICY "User can manage their own products" ON public.products FOR ALL USING (auth.uid() = user_id);

-- 5. Aktifkan Realtime Replication untuk sinkronisasi multi-device otomatis
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_stores;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
