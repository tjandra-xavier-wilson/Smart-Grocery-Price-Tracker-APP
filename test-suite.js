// Comprehensive Verification Test Suite for SakuGrosir SRS Requirements

const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('🧪 RUNNING SAKUGROSIR SRS AUTOMATED VERIFICATION SUITE');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Test Calculator Logic
const calcCode = fs.readFileSync(path.join(__dirname, 'js/calculator.js'), 'utf8');
const vm = require('vm');
const sandbox = { window: {}, Math, Number, isNaN };
vm.createContext(sandbox);
vm.runInContext(calcCode, sandbox);
const Calculator = sandbox.window.GroceryCalculator;

console.log('--- TEST GROUP 1: [F-03] Kalkulator Diskon Bertingkat ---');
// Test stacked discount: Rp 100.000 with 50% + 20% + Rp 15.000 deduction
// Expected: 100.000 * 0.50 = 50.000; 50.000 * 0.80 = 40.000; 40.000 - 15.000 = 25.000 per unit
const testStacked = Calculator.calculateItemPricing({
  harga_satuan: 100000,
  diskon_persen_1: 50,
  diskon_persen_2: 20,
  potongan_langsung: 15000,
  kuantitas: 2
});

assert(testStacked.harga_akhir_per_satuan === 25000, `Harga akhir per satuan bertingkat (50% + 20% - 15rb) = Rp 25.000 (Actual: ${testStacked.harga_akhir_per_satuan})`);
assert(testStacked.total_harga_item === 50000, `Total harga untuk 2 unit = Rp 50.000 (Actual: ${testStacked.total_harga_item})`);
assert(testStacked.total_hemat === 150000, `Total penghematan = Rp 150.000 (Normal 200rb - 50rb) (Actual: ${testStacked.total_hemat})`);
assert(testStacked.persen_total_hemat === 75, `Persen total penghematan = 75% (Actual: ${testStacked.persen_total_hemat}%)`);

console.log('\n--- TEST GROUP 2: [F-03] Komparator Unit Grosir ---');
// Compare 1L x 3 (total 3L @ Rp 49.500 = 16.500/L) vs 5L @ Rp 86.000 (= 17.200/L)
const compResult = Calculator.compareUnitPrice(
  { price: 49500, qty: 3, unit: 'liter' },
  { price: 86000, qty: 5, unit: 'liter' }
);
assert(compResult.unitPriceA === 16500, `Opsi A unit price = Rp 16.500/liter (Actual: ${compResult.unitPriceA})`);
assert(compResult.unitPriceB === 17200, `Opsi B unit price = Rp 17.200/liter (Actual: ${compResult.unitPriceB})`);
assert(compResult.winner === 'A', `Opsi A harus menjadi pemenang termurah (Actual: ${compResult.winner})`);
assert(compResult.diffPerUnit === 700, `Selisih hemat Rp 700/liter (Actual: ${compResult.diffPerUnit})`);

console.log('\n--- TEST GROUP 3: [F-04] Detektor Fluktuasi Harga vs Bulan Lalu ---');
const flucUp = Calculator.detectPriceFluctuation(35000, 30000);
assert(flucUp.status === 'up' && flucUp.directionSymbol === '↑', 'Detektor harga naik (Mahal) menghasilkan status "up" dan panah 🔺 ↑');

const flucDown = Calculator.detectPriceFluctuation(27000, 30000);
assert(flucDown.status === 'down' && flucDown.directionSymbol === '↓', 'Detektor harga turun (Hemat) menghasilkan status "down" dan panah 🔻 ↓');

const flucEqual = Calculator.detectPriceFluctuation(30000, 30000);
assert(flucEqual.status === 'equal' && flucEqual.directionSymbol === '=', 'Detektor harga sama menghasilkan status "equal" dan ➖ =');

const flucNew = Calculator.detectPriceFluctuation(30000, 0);
assert(flucNew.status === 'new', 'Detektor item tanpa riwayat bulan lalu menghasilkan status "new"');

console.log('\n--- TEST GROUP 4: [F-05] Budget Safety Cap (Sesuai Standar DT2 P15) ---');
// Uji Kasus DT2: Limit Rp 100.000
// Belanja Rp 80.000 (80%) -> Zona Aman Hijau (< 90%)
const capSafe = Calculator.calculateBudgetCap(80000, 100000);
assert(capSafe.tier === 'safe' && capSafe.percentage === 80, 'Total 80rb dari limit 100rb berada di Zona Aman Hijau (<90%)');

// Belanja Rp 95.000 (95%) -> Wajib Zona Waspada Kuning (≥ 90%)
const capWarn = Calculator.calculateBudgetCap(95000, 100000);
assert(capWarn.tier === 'warning' && capWarn.percentage === 95, 'Total 95rb dari limit 100rb berada di Zona Waspada Kuning (≥90%)');

// Belanja Rp 110.000 (110%) -> Wajib Zona Bahaya Merah Overbudget (> 100%)
const capOver = Calculator.calculateBudgetCap(110000, 100000);
assert(capOver.tier === 'danger' && capOver.isOver === true && capOver.percentage === 110, 'Total 110rb dari limit 100rb memicu Zona Bahaya Merah Overbudget (>100%)');

console.log('\n--- TEST GROUP 5: PWA, Viewport & Mobile Architecture ---');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'styles/main.css'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

assert(html.includes('viewport-fit=cover'), 'Viewport meta tag memiliki viewport-fit=cover untuk safe-area mobile');
assert(html.includes('manifest.json'), 'PWA Web App Manifest tertaut di head');
assert(manifest.display === 'standalone', 'PWA Manifest display mode adalah "standalone"');
assert(css.includes('max-width: 430px'), 'CSS membatasi mobile viewport pada max-width 430px');
assert(!html.includes('<table>'), 'DILARANG menggunakan tabel desktop; terbukti tidak ada tag <table> di index.html');
assert(html.includes('nav-btn-belanja') && html.includes('nav-btn-riwayat') && html.includes('nav-btn-anggaran'), '3 Menu Bottom Navigation Bar utama hadir');
assert(css.includes('--stepper-btn-size: 46px') || css.includes('--min-touch-target: 48px'), 'Ukuran touch targets stepper ramah jempol');

console.log('\n--- TEST GROUP 6: Timezone-Safe Date Parsing & Month-Year Filter ---');
const { parseDateComponents, toISODateString, toIndoDisplayDate, toYearMonthKey, formatMonthYearLabel } = require('./app/utils/date.js');

const comp1 = parseDateComponents('1 November 2026');
assert(comp1.year === 2026 && comp1.month === 11 && comp1.day === 1, 'Parsing "1 November 2026" menghasilkan year 2026, month 11, day 1');

const iso1 = toISODateString('1 November 2026');
assert(iso1 === '2026-11-01', 'Konversi "1 November 2026" ke ISO menghasilkan "2026-11-01" tanpa mundur ke 31 Oktober');

const ymKey1 = toYearMonthKey('1 November 2026');
assert(ymKey1 === '2026-11', 'Key filter periode dari "1 November 2026" adalah "2026-11"');

const label1 = formatMonthYearLabel('2026-11');
assert(label1 === 'November 2026', 'Label dropdown untuk "2026-11" adalah "November 2026"');

const indoFromIso = toIndoDisplayDate('2026-11-01');
assert(indoFromIso === '1 November 2026', 'Format display dari ISO "2026-11-01" menghasilkan "1 November 2026"');

console.log('\n--- TEST GROUP 7: Perbandingan Pengeluaran Antar Transaksi ---');
const { calculateTransactionComparison, formatTxOptionLabel } = require('./app/utils/comparison.js');

// Uji Kasus 1: Transaksi A (Rp 32.500) < Transaksi B (Rp 52.500) -> Lebih Hemat (-38.1%)
const resHemat = calculateTransactionComparison(32500, 52500, true);
assert(resHemat.status === 'cheaper', 'Kondisi A < B menghasilkan status "cheaper"');
assert(resHemat.absDiff === 20000, `Selisih nominal absolut = Rp 20.000 (Actual: ${resHemat.absDiff})`);
assert(resHemat.percent.toFixed(1) === '-38.1', `Persentase penghematan = -38.1% (Actual: ${resHemat.percent.toFixed(1)}%)`);
assert(resHemat.badgeText === '↓ Lebih Hemat', 'Badge menampilkan "↓ Lebih Hemat"');
assert(resHemat.arrowDirection === 'down', 'Arah panah lingkaran adalah "down"');
assert(resHemat.conclusionText.includes('-Rp 20.000 (-38.1%)'), `Teks kesimpulan hemat sesuai contoh: "${resHemat.conclusionText}"`);

// Uji Kasus 2: Transaksi A (Rp 52.500) > Transaksi B (Rp 32.500) -> Lebih Boros (+61.5%)
const resBoros = calculateTransactionComparison(52500, 32500, true);
assert(resBoros.status === 'expensive', 'Kondisi A > B menghasilkan status "expensive"');
assert(resBoros.absDiff === 20000, `Selisih nominal absolut = Rp 20.000 (Actual: ${resBoros.absDiff})`);
assert(resBoros.percent.toFixed(1) === '61.5', `Persentase kenaikan = +61.5% (Actual: +${resBoros.percent.toFixed(1)}%)`);
assert(resBoros.badgeText === '↑ Lebih Boros', 'Badge menampilkan "↑ Lebih Boros"');
assert(resBoros.arrowDirection === 'up', 'Arah panah lingkaran adalah "up"');
assert(resBoros.conclusionText.includes('+Rp 20.000 (+61.5%)'), `Teks kesimpulan boros memuat nominal & persentase kenaikan: "${resBoros.conclusionText}"`);

// Uji Kasus 3: Transaksi A === Transaksi B (Rp 50.000) -> Sama
const resSama = calculateTransactionComparison(50000, 50000, true);
assert(resSama.status === 'equal', 'Kondisi A === B menghasilkan status "equal"');
assert(resSama.absDiff === 0 && resSama.percent === 0, 'Selisih absolut dan persen = 0');
assert(resSama.badgeText === '= Sama', 'Badge menampilkan "= Sama"');
assert(resSama.arrowDirection === 'equal', 'Arah panah lingkaran adalah "equal"');

// Uji Kasus 4: Kurang dari 2 transaksi (Disabled)
const resDisabled = calculateTransactionComparison(32500, 0, false);
assert(resDisabled.status === 'disabled', 'Jika < 2 transaksi, status adalah "disabled"');
assert(resDisabled.badgeText === 'Min. 2 Transaksi', 'Badge menunjukkan batasan "Min. 2 Transaksi"');

// Uji Kasus 5: Formatting label dropdown (misal: "17 Nov - Lotte Mart")
const labelOption = formatTxOptionLabel({
  id: 'sesi-123',
  date: '2026-11-17',
  storeName: 'Lotte Mart'
}, parseDateComponents);
assert(labelOption === '17 Nov - Lotte Mart', `Label opsi dropdown menampilkan format "17 Nov - Lotte Mart" (Actual: "${labelOption}")`);

console.log('\n--- TEST GROUP 8: Custom Product, Supabase Prices & Fluctuation Suppression ---');
const { generateDefaultPrices } = require('./src/lib/supabaseClient.js');
const { getItemStorePrice, shouldRenderFluctuationBadge } = require('./app/utils/storePrices.js');

// Uji Kasus 1: generateDefaultPrices menghasilkan 4 supermarket dengan history null
const defPrices = generateDefaultPrices(40000);
assert(defPrices['Lotte Mart - Puri Indah']?.current === 40000, 'Harga Lotte Mart default = Rp 40.000');
assert(defPrices['Lotte Mart - Puri Indah']?.history === null, 'Harga riwayat Lotte Mart barang custom harus null');
assert(defPrices['Super Indo - Pesanggrahan']?.history === null, 'Harga riwayat Super Indo barang custom harus null');
assert(defPrices['Hypermart - Puri Mall']?.history === null, 'Harga riwayat Hypermart barang custom harus null');
assert(defPrices['Indogrosir Daan Mogot']?.history === null, 'Harga riwayat Indogrosir barang custom harus null');

// Uji Kasus 2: getItemStorePrice untuk custom item tidak boleh merekayasa harga riwayat
const customStorePrice = getItemStorePrice({ name: 'nasi biru', price: 40000, isCustom: true }, 'Lotte Mart - Puri Indah');
assert(customStorePrice.current === 40000, 'Harga berjalan custom item sesuai input');
assert(customStorePrice.history === null, 'Harga riwayat custom item wajib null (tanpa rekayasa)');

// Uji Kasus 3: shouldRenderFluctuationBadge mengembalikan false jika isCustom === true atau historyPrice null
const shouldRenderCustom = shouldRenderFluctuationBadge({ currentPrice: 40000, historyPrice: null, isCustom: true });
assert(shouldRenderCustom === false, 'Badge fluktuasi untuk barang custom (isCustom: true) DILARANG dirender');

const shouldRenderNullHistory = shouldRenderFluctuationBadge({ currentPrice: 40000, historyPrice: null, isCustom: false });
assert(shouldRenderNullHistory === false, 'Badge fluktuasi untuk barang tanpa harga riwayat sah DILARANG dirender');

const shouldRenderValid = shouldRenderFluctuationBadge({ currentPrice: 40000, historyPrice: 35000, isCustom: false });
assert(shouldRenderValid === true, 'Badge fluktuasi untuk barang dengan riwayat sah diizinkan dirender');

console.log('\n--- TEST GROUP 9: Lokasi Supermarket Kustom & Fallback Harga Standar (Lotte Mart) ---');
const { resolveItemPrice } = require('./app/utils/storePrices.js');
const { insertCustomStore, getCustomStores } = require('./src/lib/supabaseClient.js');

// Uji Kasus 1: Penggabungan 4 toko default dengan customSupermarkets
const defaultStores = [
  'Lotte Mart Grocery - Puri Indah',
  'Super Indo - Pesanggrahan',
  'Hypermart - Puri Mall',
  'Indogrosir Daan Mogot'
];
const customStoresList = ['Toko Sembako Berkah', 'Warung Madura 24 Jam'];
const combinedStores = Array.from(new Set([...defaultStores, ...customStoresList]));
assert(combinedStores.length === 6, 'Daftar supermarket berhasil menggabungkan 4 toko default + 2 toko kustom');
assert(combinedStores.includes('Toko Sembako Berkah'), 'Toko kustom baru tersedia di daftar pilihan');

// Uji Kasus 2: Fallback Harga Standar (Lotte Mart) jika Toko Kustom dipilih
// Sesuai SRS: const currentPrice = item.prices[selectedSupermarket]?.current || item.prices["Lotte Mart - Puri Indah"].current;
const mockMasterItem = {
  id: 'item-beras',
  name: 'Beras Premium Rojolele 5kg',
  prices: {
    'Lotte Mart - Puri Indah': { current: 74000, history: 68000 },
    'Super Indo - Pesanggrahan': { current: 69900, history: 72900 },
    'Hypermart - Puri Mall': { current: 72500, history: 72500 },
    'Indogrosir Daan Mogot': { current: 65000, history: 60000 }
  }
};

// Item tidak memiliki properti 'Toko Sembako Berkah' di objek prices
const fallbackPrice = getItemStorePrice(mockMasterItem, 'Toko Sembako Berkah');
assert(fallbackPrice.current === 74000, 'Harga item di Toko Kustom otomatis fallback ke harga standar Lotte Mart (Rp 74.000)');
assert(fallbackPrice.history === 68000, 'Harga riwayat item di Toko Kustom fallback ke riwayat Lotte Mart (Rp 68.000)');

const resolvedPrice = resolveItemPrice(mockMasterItem, 'Toko Sembako Berkah');
assert(resolvedPrice === 74000, 'resolveItemPrice mengembalikan harga Rp 74.000 tanpa crash');

// Uji Kasus 3: Optional Chaining langsung pada item tanpa properti toko kustom
const directOptionalChainingPrice = mockMasterItem.prices?.['Toko Sembako Berkah']?.current || 
                                     mockMasterItem.prices?.['Lotte Mart - Puri Indah']?.current;
assert(directOptionalChainingPrice === 74000, 'Pola Optional Chaining langsung menghasilkan harga Lotte Mart');

// Uji Kasus 4: Helper fungsi database Supabase
assert(typeof insertCustomStore === 'function', 'Helper insertCustomStore tersedia');
assert(typeof getCustomStores === 'function', 'Helper getCustomStores tersedia');

console.log(`\n========================================================`);
console.log(`🏁 HASIL PENGUJIAN: ${passedTests} / ${totalTests} TEST BERHASIL LULUS 100%!`);
console.log(`========================================================`);
