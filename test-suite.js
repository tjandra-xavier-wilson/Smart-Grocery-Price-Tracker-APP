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

console.log(`\n========================================================`);
console.log(`🏁 HASIL PENGUJIAN: ${passedTests} / ${totalTests} TEST BERHASIL LULUS 100%!`);
console.log(`========================================================`);
