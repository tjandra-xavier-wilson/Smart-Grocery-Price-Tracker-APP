// Sample Mock Data for First-Time Launch (Anak Kos Grocery Persona)

const SAMPLE_INITIAL_ITEMS = [
  {
    id: "item_001",
    nama_barang: "Minyak Goreng Bimoli 2L",
    kategori: "Kebutuhan Pokok",
    satuan: "liter",
    kuantitas: 1,
    harga_satuan: 39500,
    diskon_persen_1: 15,
    diskon_persen_2: 5,
    potongan_langsung: 2000,
    harga_akhir_per_satuan: 29896,
    total_harga_item: 29896,
    harga_bulan_lalu: 36000
  },
  {
    id: "item_002",
    nama_barang: "Beras Setra Ramos 5kg",
    kategori: "Kebutuhan Pokok",
    satuan: "kg",
    kuantitas: 1,
    harga_satuan: 74500,
    diskon_persen_1: 0,
    diskon_persen_2: 0,
    potongan_langsung: 0,
    harga_akhir_per_satuan: 74500,
    total_harga_item: 74500,
    harga_bulan_lalu: 69000
  },
  {
    id: "item_003",
    nama_barang: "Indomie Mi Goreng (Dus 40 pcs)",
    kategori: "Makanan Instan",
    satuan: "pack",
    kuantitas: 1,
    harga_satuan: 122000,
    diskon_persen_1: 8,
    diskon_persen_2: 0,
    potongan_langsung: 3500,
    harga_akhir_per_satuan: 108740,
    total_harga_item: 108740,
    harga_bulan_lalu: 108740
  },
  {
    id: "item_004",
    nama_barang: "Telur Ayam Ras Fresh 1kg",
    kategori: "Telur & Daging",
    satuan: "kg",
    kuantitas: 1,
    harga_satuan: 31500,
    diskon_persen_1: 0,
    diskon_persen_2: 0,
    potongan_langsung: 0,
    harga_akhir_per_satuan: 31500,
    total_harga_item: 31500,
    harga_bulan_lalu: 28000
  },
  {
    id: "item_005",
    nama_barang: "Deterjen Rinso Molto Cair 1.5L",
    kategori: "Sabun & Pembersih",
    satuan: "liter",
    kuantitas: 1,
    harga_satuan: 46000,
    diskon_persen_1: 30,
    diskon_persen_2: 10,
    potongan_langsung: 2000,
    harga_akhir_per_satuan: 26980,
    total_harga_item: 26980,
    harga_bulan_lalu: 34000
  },
  {
    id: "item_006",
    nama_barang: "Sabun Cuci Piring Sunlight 650ml",
    kategori: "Sabun & Pembersih",
    satuan: "pcs",
    kuantitas: 2,
    harga_satuan: 16000,
    diskon_persen_1: 20,
    diskon_persen_2: 5,
    potongan_langsung: 500,
    harga_akhir_per_satuan: 11660,
    total_harga_item: 23320,
    harga_bulan_lalu: 14500
  }
];

const SAMPLE_SHOPPING_HISTORY = [
  {
    id: "trip_hist_01",
    store_name: "Indogrosir Pusat Belanja Kos",
    date: "2026-09-08",
    date_display: "8 September 2026",
    budget_limit: 500000,
    total_spent: 442500,
    total_savings: 58200,
    items_count: 8,
    items: [
      {
        nama_barang: "Minyak Goreng Bimoli 2L",
        kategori: "Kebutuhan Pokok",
        satuan: "liter",
        kuantitas: 1,
        harga_akhir_per_satuan: 36000,
        total_harga_item: 36000
      },
      {
        nama_barang: "Beras Setra Ramos 5kg",
        kategori: "Kebutuhan Pokok",
        satuan: "kg",
        kuantitas: 1,
        harga_akhir_per_satuan: 69000,
        total_harga_item: 69000
      },
      {
        nama_barang: "Indomie Mi Goreng (Dus 40 pcs)",
        kategori: "Makanan Instan",
        satuan: "pack",
        kuantitas: 1,
        harga_akhir_per_satuan: 108740,
        total_harga_item: 108740
      },
      {
        nama_barang: "Telur Ayam Ras Fresh 1kg",
        kategori: "Telur & Daging",
        satuan: "kg",
        kuantitas: 1,
        harga_akhir_per_satuan: 28000,
        total_harga_item: 28000
      },
      {
        nama_barang: "Deterjen Rinso Molto Cair 1.5L",
        kategori: "Sabun & Pembersih",
        satuan: "liter",
        kuantitas: 1,
        harga_akhir_per_satuan: 34000,
        total_harga_item: 34000
      },
      {
        nama_barang: "Sabun Cuci Piring Sunlight 650ml",
        kategori: "Sabun & Pembersih",
        satuan: "pcs",
        kuantitas: 2,
        harga_akhir_per_satuan: 14500,
        total_harga_item: 29000
      },
      {
        nama_barang: "Kopi Kapal Api Spesial Mix (Renceng)",
        kategori: "Makanan Instan",
        satuan: "pack",
        kuantitas: 2,
        harga_akhir_per_satuan: 14500,
        total_harga_item: 29000
      },
      {
        nama_barang: "Susu UHT Ultra Milk Full Cream 1L",
        kategori: "Kebutuhan Pokok",
        satuan: "pcs",
        kuantitas: 3,
        harga_akhir_per_satuan: 17920,
        total_harga_item: 53760
      }
    ]
  }
];

const INITIAL_PRICE_DATABASE = {
  "Minyak Goreng Bimoli 2L": 36000,
  "Beras Setra Ramos 5kg": 69000,
  "Indomie Mi Goreng (Dus 40 pcs)": 108740,
  "Telur Ayam Ras Fresh 1kg": 28000,
  "Deterjen Rinso Molto Cair 1.5L": 34000,
  "Sabun Cuci Piring Sunlight 650ml": 14500,
  "Kopi Kapal Api Spesial Mix (Renceng)": 14500,
  "Susu UHT Ultra Milk Full Cream 1L": 18500,
  "Gula Pasir Gulaku 1kg": 17500,
  "Kecap Manis Bango 520ml": 22000,
  "Shampoo Pantene 290ml": 38000,
  "Pasta Gigi Pepsodent 225g": 16500,
  "Fiesta Chicken Nugget 500g": 48000
};

window.SAMPLE_INITIAL_ITEMS = SAMPLE_INITIAL_ITEMS;
window.SAMPLE_SHOPPING_HISTORY = SAMPLE_SHOPPING_HISTORY;
window.INITIAL_PRICE_DATABASE = INITIAL_PRICE_DATABASE;
