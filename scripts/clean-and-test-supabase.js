const { supabase } = require('../src/lib/supabaseClient.js');

async function main() {
  console.log('--- 1. CLEANING CUSTOM DATA IN SUPABASE ---');

  // A. Clean custom_stores
  const { data: storesBefore, error: errStores } = await supabase.from('custom_stores').select('*');
  console.log('Existing custom_stores count:', storesBefore ? storesBefore.length : 0);
  if (storesBefore && storesBefore.length > 0) {
    const { error: delErr } = await supabase.from('custom_stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Deleted all custom_stores:', delErr ? delErr.message : 'SUCCESS');
  }

  // B. Clean products
  const { data: prodsBefore, error: errProds } = await supabase.from('products').select('*');
  console.log('Existing products count:', prodsBefore ? prodsBefore.length : 0);
  if (prodsBefore && prodsBefore.length > 0) {
    const { error: delErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Deleted all custom products:', delErr ? delErr.message : 'SUCCESS');
  }

  // C. Reset Cloud Config in grocery_history
  const { data: configs } = await supabase
    .from('grocery_history')
    .select('id, notes')
    .ilike('notes', '##sakugrosir_custom_config##%');
  if (configs && configs.length > 0) {
    for (const c of configs) {
      await supabase.from('grocery_history').update({
        notes: '##sakugrosir_custom_config##{"stores":[],"products":[]}'
      }).eq('id', c.id);
    }
    console.log('Reset cloud custom configs in grocery_history to empty arrays: SUCCESS');
  }

  console.log('\n--- 2. VERIFYING ZERO CUSTOM STORES & PRODUCTS ---');
  const checkStores = await supabase.from('custom_stores').select('*');
  console.log('custom_stores remaining:', checkStores.data ? checkStores.data.length : 0);
  const checkProds = await supabase.from('products').select('*');
  console.log('products remaining:', checkProds.data ? checkProds.data.length : 0);

  console.log('\n--- 3. TESTING DATABASE SYNC FOR CUSTOM INPUT ---');
  // Test insert via supabase service/anon
  // Note: if RLS policy requires auth.uid(), let's check policies on custom_stores and products
  console.log('Checking RLS policies...');
  const { data: rlsTestStore, error: rlsStoreErr } = await supabase.from('custom_stores').insert([{
    store_name: 'Supermarket Test Sync'
  }]).select();
  if (rlsStoreErr) {
    console.log('custom_stores insert notice (RLS):', rlsStoreErr.message);
  } else {
    console.log('custom_stores insert SUCCESS:', rlsTestStore[0]);
    // Clean up test row
    await supabase.from('custom_stores').delete().eq('id', rlsTestStore[0].id);
    console.log('custom_stores cleanup SUCCESS');
  }

  const { data: rlsTestProd, error: rlsProdErr } = await supabase.from('products').insert([{
    name: 'Barang Uji Coba Sync',
    category: 'Bahan Pokok'
  }]).select();
  if (rlsProdErr) {
    console.log('products insert notice (RLS):', rlsProdErr.message);
  } else {
    console.log('products insert SUCCESS:', rlsTestProd[0]);
    // Clean up test row
    await supabase.from('products').delete().eq('id', rlsTestProd[0].id);
    console.log('products cleanup SUCCESS');
  }

  console.log('\n--- ALL CHECKS COMPLETED ---');
}

main().catch(console.error);
