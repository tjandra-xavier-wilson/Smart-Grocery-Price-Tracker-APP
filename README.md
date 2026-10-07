# Smart Grocery Price Tracker & Budget Safety Cap (SakuGrosir) 🛒⚡

> **Aplikasi Web Mobile PWA Bergaya Native App untuk Belanja Grosir Satu-Tangan Anak Kos / Siswa Rantau.**
> Terintegrasi penuh dengan **Supabase Database (PostgreSQL)** & siap deploy instan ke **Vercel**.

---

## 📱 Ringkasan Arsitektur & Fitur Utama

Aplikasi dirancang secara ergonomis untuk digunakan **dengan satu tangan** sambil mendorong troli supermarket:
1. **Mobile-First Viewport**: Terkunci pada lebar maksimal `430px` (iPhone 16 Pro Max viewport), terpusat di layar PC/Laptop dengan latar ambient mewah dan simulated status bar.
2. **Fixed Floating Bottom Navigation Bar**: Menu navigasi melayang ramah jangkauan jempol dengan 3 menu:
   - **Belanja**: Input keranjang belanja aktif, stepper kuantitas besar, rincian diskon, dan subtotal real-time.
   - **Riwayat**: Catatan struk digital, arsip tanggal belanja, dan database pantauan harga historis.
   - **Anggaran**: Pengendali jatah uang saku bulanan, slider batas anggaran, dan komposisi pengeluaran per kategori.
3. **Ergonomi Ramah Jempol**:
   - Stepper kuantitas (`+` / `−`) berukuran besar (`46px`), empuk disentuh dengan haptic vibration & sound.
   - Layout kartu vertikal (*card-based list*) tanpa tabel desktop yang melebar.
   - Komponen input form angka dengan `inputmode="numeric"`.
4. **PWA Standalone & Offline Support**:
   - `manifest.json` lengkap dengan mode `standalone`, ikon vektor SVG, dan pintasan aplikasi (*shortcuts*).
   - `sw.js` Service Worker untuk *cache-first offline mode* ketika berada di lantai basement grosir yang miskin sinyal seluler.
   - Web Audio API synthesizer untuk efek klik, chime sukses, dan buzzer alarm tanpa file audio eksternal.

---

## 📐 Implementasi Checklist Spesifikasi (SRS Compliance)

| Kode | Fitur | Status | Deskripsi Implementasi |
| :--- | :--- | :---: | :--- |
| **[F-01]** | **Pencatatan Item Belanja Lengkap** | ✅ Selesai | Form input cepat dengan atribut nama, kategori, satuan (`kg`/`liter`/`pcs`/`pack`), kuantitas, harga satuan asli, diskon bertingkat, dan auto-lookup harga riwayat bulan lalu. |
| **[F-02]** | **Perhitungan Kuantitas Otomatis** | ✅ Selesai | Stepper `+` / `−` dan perubahan form langsung memperbarui subtotal baris dan running total secara instan & reaktif tanpa tombol hitung terpisah. |
| **[F-03]** | **Kalkulator Diskon Bertingkat & Komparator Promo** | ✅ Selesai | • Formula diskon bertumpuk matematis: $H_{akhir} = H \times (1 - D_1) \times (1 - D_2) - \text{Potongan}$ (bukan dijumlahkan langsung).<br>• Komparator Unit Promo untuk membandingkan kemasan (misal Minyak 1L x 3 bks vs Jerigen 5L) dengan penanda otomatis pemenang termurah dan tombol langsung masuk keranjang. |
| **[F-04]** | **Detektor Fluktuasi Harga vs Bulan Lalu** | ✅ Selesai | Badge komparasi otomatis real-time:<br>• 🔺 **Panah Merah Naik (↑)**: Peringatan harga mahal.<br>• 🔻 **Panah Hijau Turun (↓)**: Rekomendasi borong/hemat.<br>• ➖ **Tanda Setara (=)**: Harga stabil. |
| **[F-05]** | **Pengendali Anggaran (Budget Safety Cap)** | ✅ Selesai | Header sticky dengan *Running Total* & *Sisa Saldo*:<br>• 🟢 **Hijau (<80%)**: Zona Aman.<br>• 🟡 **Kuning (80% - 94.9%)**: Zona Waspada.<br>• 🔴 **Merah (≥95%)**: Zona Bahaya! Memunculkan banner alarm bergetar dan bunyi buzzer otomatis untuk mencegah situasi memalukan di depan kasir! |
| **[F-06]** | **Riwayat & Database Penyimpanan Belanja** | ✅ Selesai | Fitur *Selesai Belanja / Checkout Struk* mengarsipkan keranjang ke `localStorage` & `Supabase` per tanggal. Harga akhir item otomatis tersimpan menjadi referensi 'harga bulan lalu' untuk sesi berikutnya. Dilengkapi fitur salin teks struk untuk dikirim ke grup WhatsApp kos. |

---

## 🗄️ Panduan Setup Supabase Database

Skema SQL DDL lengkap telah disediakan di file [`supabase/schema.sql`](./supabase/schema.sql).

### Langkah Eksekusi di Supabase Dashboard:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard/project/ihickxbofezjqxncegda).
2. Masuk ke menu **SQL Editor** pada navigasi sebelah kiri.
3. Klik **New query**, lalu salin dan tempelkan seluruh kode dari [`supabase/schema.sql`](./supabase/schema.sql).
4. Klik tombol **Run** (Ctrl + Enter).
5. Seluruh tabel (`budget_settings`, `grocery_history`, `grocery_items`), ekstensi UUID, Row Level Security (RLS) policies, dan indeks performa akan aktif secara instan!

---

## 🚀 Panduan Deployment ke Vercel

Proyek ini telah dikonfigurasi dengan [`vercel.json`](./vercel.json) untuk deployment seamless:

### Cara 1: Menggunakan Vercel CLI
```bash
# Login & Deploy
npx vercel
```

### Cara 2: Import Repository di Vercel Dashboard (Rekomendasi)
1. Buka [Vercel Dashboard](https://vercel.com/new).
2. Import repository GitHub ini: `Smart-Grocery-Price-Tracker-APP`.
3. Pada bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL`: `https://ihickxbofezjqxncegda.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaWNreGJvZmV6anF4bmNlZ2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzAzOTAsImV4cCI6MjEwNjkwNjM5MH0.6ralu-BuIifgYvA3ep-ItX4mAlky7i7dlz1x0vtNzzE`
4. Klik **Deploy**! Aplikasi akan langsung live dengan status SSL aktif dan PWA terpasang.

---

## 🛠️ Menjalankan & Menguji Aplikasi Secara Lokal

```bash
# 1. Jalankan server lokal
node server.js
```
Akses aplikasi melalui browser:
👉 **[http://localhost:3000](http://localhost:3000)**

### Menjalankan Test Suite Otomatis:
```bash
# Verifikasi fitur SRS fungsional
node test-suite.js

# Verifikasi integrasi Supabase & Vercel
node test-supabase.js
```
Hasil pengujian: **Semua test (23 SRS + 20 Supabase/Vercel) LULUS 100%!**
