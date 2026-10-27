// Sample Mock Data for First-Time Launch (Lotte Mart Grocery - Puri Indah Persona)
// Sesuai Standar Pengujian Daily Test 2 (DT2) Pertemuan 15

const SAMPLE_INITIAL_ITEMS = [
  {
    id: "item_001",
    nama_barang: "Beras Rojolele",
    kategori: "Bahan Pokok",
    satuan: "karung/5kg",
    kuantitas: 1,
    harga_satuan: 74000,
    diskon_persen_1: 0,
    diskon_persen_2: 0,
    potongan_langsung: 0,
    harga_akhir_per_satuan: 74000,
    total_harga_item: 74000,
    harga_bulan_lalu: 68000 // Uji F-04: Naik -> Panah merah (+Rp 6.000)
  },
  {
    id: "item_002",
    nama_barang: "Minyak Goreng 2L",
    kategori: "Bahan Pokok",
    satuan: "liter",
    kuantitas: 1,
    harga_satuan: 43000,
    diskon_persen_1: 0,
    diskon_persen_2: 0,
    potongan_langsung: 0,
    harga_akhir_per_satuan: 43000,
    total_harga_item: 43000,
    harga_bulan_lalu: 43000 // Uji F-02: Qty 1 -> 3 jadi Rp 129.000
  },
  {
    id: "item_003",
    nama_barang: "Telur 1kg",
    kategori: "Telur & Daging",
    satuan: "kg",
    kuantitas: 1,
    harga_satuan: 28000,
    diskon_persen_1: 0,
    diskon_persen_2: 0,
    potongan_langsung: 0,
    harga_akhir_per_satuan: 28000,
    total_harga_item: 28000,
    harga_bulan_lalu: 32000 // Uji F-04: Turun -> Panah hijau (-Rp 4.000)
  },
  {
    id: "item_004",
    nama_barang: "Garam 500g",
    kategori: "Bahan Pokok",
    satuan: "pack",
    kuantitas: 1,
    harga_satuan: 5000,
    diskon_persen_1: 0,
    diskon_persen_2: 0,
    potongan_langsung: 0,
    harga_akhir_per_satuan: 5000,
    total_harga_item: 5000,
    harga_bulan_lalu: 5000 // Uji F-04: Stabil -> Simbol setara (=)
  }
];

const SAMPLE_SHOPPING_HISTORY = [
  {
    id: "trip_hist_lotte_01",
    store_name: "Lotte Mart Grocery - Puri Indah",
    date: "2026-09-26",
    date_display: "26 September 2026",
    budget_limit: 100000,
    total_spent: 98000,
    total_savings: 12000,
    items_count: 4,
    items: [
      {
        nama_barang: "Beras Rojolele",
        kategori: "Bahan Pokok",
        satuan: "karung/5kg",
        kuantitas: 1,
        harga_satuan: 68000,
        harga_akhir_per_satuan: 68000,
        total_harga_item: 68000
      },
      {
        nama_barang: "Telur 1kg",
        kategori: "Telur & Daging",
        satuan: "kg",
        kuantitas: 1,
        harga_satuan: 32000,
        harga_akhir_per_satuan: 32000,
        total_harga_item: 32000
      },
      {
        nama_barang: "Garam 500g",
        kategori: "Bahan Pokok",
        satuan: "pack",
        kuantitas: 1,
        harga_satuan: 5000,
        harga_akhir_per_satuan: 5000,
        total_harga_item: 5000
      }
    ]
  }
];

const INITIAL_PRICE_DATABASE = {
  "Beras Rojolele": 68000,
  "Beras 5kg": 68000,
  "Beras Setra Ramos 5kg": 68000,
  "Telur 1kg": 32000,
  "Telur Ayam Ras Fresh 1kg": 32000,
  "Garam 500g": 5000,
  "Garam Dapur 500g": 5000,
  "Minyak Goreng 2L": 43000,
  "Minyak Goreng Bimoli 2L": 43000,
  "Wajan Teflon 28cm": 100000,
  "Sabun Mandi": 15000,
  "Sabun Cuci Piring": 14500,
  "Deterjen Cair 1.5L": 34000,
  "Indomie Mi Goreng (Dus 40 pcs)": 108740,
  "Gula Pasir 1kg": 17500
};

window.SAMPLE_INITIAL_ITEMS = SAMPLE_INITIAL_ITEMS;
window.SAMPLE_SHOPPING_HISTORY = SAMPLE_SHOPPING_HISTORY;
window.INITIAL_PRICE_DATABASE = INITIAL_PRICE_DATABASE;
