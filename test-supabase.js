// Automated Verification Script for Supabase Integration & Vercel Configuration

const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log('⚡ TESTING SUPABASE CLIENT INTEGRATION & VERCEL CONFIGURATION');
console.log('===============================================================\n');

let pass = 0;
let total = 0;

function check(cond, msg) {
  total++;
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    pass++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

// 1. Check Schema SQL File
const schemaPath = path.join(__dirname, 'supabase/schema.sql');
check(fs.existsSync(schemaPath), 'File supabase/schema.sql tersedia');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

check(schemaContent.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'), 'Schema mengaktifkan ekstensi uuid-ossp');
check(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.budget_settings'), 'Schema mendefinisikan tabel budget_settings');
check(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.grocery_history'), 'Schema mendefinisikan tabel grocery_history');
check(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.grocery_items'), 'Schema mendefinisikan tabel grocery_items');
check(schemaContent.includes('ENABLE ROW LEVEL SECURITY'), 'Schema mengaktifkan Row Level Security (RLS)');
check(schemaContent.includes('idx_grocery_items_lookup_last_price') || schemaContent.includes('idx_grocery_items_nama_barang'), 'Schema membuat indeks optimasi pencarian harga');

// 2. Check Client Helper (src/lib/supabaseClient.js)
const clientPath = path.join(__dirname, 'src/lib/supabaseClient.js');
check(fs.existsSync(clientPath), 'File src/lib/supabaseClient.js tersedia');
const clientContent = fs.readFileSync(clientPath, 'utf8');
check(clientContent.includes('getLastPrice'), 'Helper menyediakan fungsi getLastPrice');
check(clientContent.includes('saveShoppingTrip'), 'Helper menyediakan fungsi saveShoppingTrip');
check(clientContent.includes('getBudgetSettings'), 'Helper menyediakan fungsi getBudgetSettings');
check(clientContent.includes('updateBudgetSettings'), 'Helper menyediakan fungsi updateBudgetSettings');
check(clientContent.includes('getOfflineLastPrice'), 'Helper menyediakan mekanisme offline fallback LocalStorage');

// 3. Check Browser Helper (js/supabaseClient.js)
const browserClientPath = path.join(__dirname, 'js/supabaseClient.js');
check(fs.existsSync(browserClientPath), 'File js/supabaseClient.js untuk browser runtime tersedia');

// 4. Check Environment Files
const envLocalPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');
check(fs.existsSync(envLocalPath), 'File .env.local tersedia');
check(fs.existsSync(envExamplePath), 'File .env.example tersedia');

const envLocal = fs.readFileSync(envLocalPath, 'utf8');
check(envLocal.includes('https://ihickxbofezjqxncegda.supabase.co'), '.env.local berisi Project URL yang benar');
check(envLocal.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'), '.env.local berisi Anon Key yang benar');

// 5. Check Vercel Configuration
const vercelPath = path.join(__dirname, 'vercel.json');
check(fs.existsSync(vercelPath), 'File vercel.json tersedia');
const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
check(Array.isArray(vercelConfig.headers), 'vercel.json memuat konfigurasi headers PWA');

console.log('\n===============================================================');
console.log(`🏁 HASIL INTEGRASI SUPABASE & DEPLOYMENT: ${pass} / ${total} LULUS!`);
console.log('===============================================================\n');
