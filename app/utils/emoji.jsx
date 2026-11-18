/**
 * Smart Emoji & Image Thumbnail Utilities
 * Supports High-Quality Real Photos with Top-Left Emoji Badges and Price Fluctuation Indicators
 */

import React from 'react';
import { shouldRenderFluctuationBadge } from './storePrices';

/**
 * Smart Emoji Mapping for Grocery Products
 */
export function getProductEmoji(itemName = '', category = '') {
  const text = `${itemName || ''} ${category || ''}`.toLowerCase();

  // 1. Staples / Bahan Pokok
  if (text.includes('beras') || text.includes('nasi') || text.includes('rice') || text.includes('rojolele')) return '🌾';
  if (text.includes('telur') || text.includes('egg')) return '🥚';
  if (text.includes('susu') || text.includes('milk') || text.includes('cream')) return '🥛';
  if (text.includes('minyak') || text.includes('oil') || text.includes('sawit') || text.includes('sania')) return '🛢️';
  if (text.includes('garam') || text.includes('salt')) return '🧂';
  if (text.includes('gula') || text.includes('sugar')) return '🍬';
  if (text.includes('tepung') || text.includes('terigu') || text.includes('flour')) return '🌾';
  if (text.includes('mie') || text.includes('mi ') || text.includes('noodle') || text.includes('sedaap') || text.includes('indomie')) return '🍜';
  if (text.includes('roti') || text.includes('bread') || text.includes('biskuit') || text.includes('cookie') || text.includes('oreo')) return '🍞';
  if (text.includes('kopi') || text.includes('teh') || text.includes('tea') || text.includes('coffee')) return '☕';

  // 2. Hygiene / Peralatan Kebersihan & Mandi
  if (
    text.includes('sabun') || 
    text.includes('sampo') || 
    text.includes('shampoo') || 
    text.includes('kebersihan') || 
    text.includes('rinso') || 
    text.includes('dettol') || 
    text.includes('detoff') || 
    text.includes('sunlight') || 
    text.includes('lifebuoy') ||
    text.includes('deterjen') || 
    text.includes('mandi') || 
    text.includes('pepsodent') || 
    text.includes('pasta gigi') ||
    text.includes('sikat') ||
    text.includes('cuci')
  ) {
    return '🧼';
  }

  // 3. Meat, Poultry & Fish / Daging & Lauk
  if (text.includes('daging') || text.includes('sapi') || text.includes('beef') || text.includes('rendang') || text.includes('rawon')) return '🥩';
  if (text.includes('ayam') || text.includes('chicken') || text.includes('fillet') || text.includes('paha')) return '🍗';
  if (text.includes('ikan') || text.includes('kembung') || text.includes('salmon') || text.includes('gurame') || text.includes('fish')) return '🐟';
  if (text.includes('udang') || text.includes('shrimp') || text.includes('prawn')) return '🦐';

  // 4. Vegetables / Sayuran Segar
  if (text.includes('wortel') || text.includes('carrot')) return '🥕';
  if (text.includes('jagung') || text.includes('corn')) return '🌽';
  if (text.includes('kentang') || text.includes('potato')) return '🥔';
  if (text.includes('tomat') || text.includes('tomato')) return '🍅';
  if (text.includes('bawang') || text.includes('onion') || text.includes('garlic')) return '🧄';
  if (text.includes('cabai') || text.includes('cabe') || text.includes('chili') || text.includes('rawit')) return '🌶️';
  if (
    text.includes('sayur') || 
    text.includes('bayam') || 
    text.includes('kangkung') || 
    text.includes('brokoli') || 
    text.includes('buncis') || 
    text.includes('selada') || 
    text.includes('sawi')
  ) {
    return '🥬';
  }

  // 5. Fruits / Buah-buahan
  if (text.includes('apel') || text.includes('apple')) return '🍎';
  if (text.includes('pisang') || text.includes('banana')) return '🍌';
  if (text.includes('jeruk') || text.includes('orange') || text.includes('lemon')) return '🍊';
  if (text.includes('semangka') || text.includes('watermelon')) return '🍉';
  if (text.includes('alpukat') || text.includes('avocado')) return '🥑';
  if (text.includes('pepaya') || text.includes('papaya')) return '🥭';
  if (text.includes('buah') || text.includes('fruit')) return '🍎';

  // 6. Beverages / Minuman
  if (text.includes('minum') || text.includes('jus') || text.includes('juice') || text.includes('soda') || text.includes('air')) return '🧃';

  // 7. Snacks / Camilan
  if (text.includes('camilan') || text.includes('snack') || text.includes('keripik') || text.includes('chitato')) return '🍿';

  // 8. Yang Lainnya / Fallback
  if (text.includes('lain')) return '📦';

  // Fallback Emoji
  return '📦';
}

/**
 * Smart Realistic Product Photo Mapping
 * Fixes bug where Susu would fallback to Beras.
 */
export function getProductImage(itemName = '', category = '') {
  const text = `${itemName || ''} ${category || ''}`.toLowerCase();

  // Susu UHT / Susu Kental Manis -> Real Milk Photo
  if (text.includes('susu') || text.includes('milk') || text.includes('cream')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80';
  }
  // Beras
  if (text.includes('beras') || text.includes('nasi') || text.includes('rice') || text.includes('rojolele')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80';
  }
  // Minyak Goreng
  if (text.includes('minyak') || text.includes('oil') || text.includes('sawit') || text.includes('sania')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80';
  }
  // Telur
  if (text.includes('telur') || text.includes('egg')) {
    return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80';
  }
  // Gula Pasir
  if (text.includes('gula') || text.includes('sugar')) {
    return 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=300&auto=format&fit=crop&q=80';
  }
  // Garam
  if (text.includes('garam') || text.includes('salt')) {
    return 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=300&auto=format&fit=crop&q=80';
  }
  // Sabun / Kebersihan
  if (text.includes('sabun') || text.includes('mandi') || text.includes('dettol') || text.includes('lifebuoy') || text.includes('rinso') || text.includes('cuci')) {
    return 'https://images.unsplash.com/photo-1608248597359-54359483c6f8?w=300&auto=format&fit=crop&q=80';
  }
  // Mie / Indomie
  if (text.includes('mie') || text.includes('indomie') || text.includes('noodle')) {
    return 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop&q=80';
  }
  // Daging Sapi
  if (text.includes('daging') || text.includes('sapi') || text.includes('beef')) {
    return 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300&auto=format&fit=crop&q=80';
  }
  // Ayam
  if (text.includes('ayam') || text.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&auto=format&fit=crop&q=80';
  }
  // Ikan
  if (text.includes('ikan') || text.includes('salmon') || text.includes('fish')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80';
  }
  // Sayur & Buah
  if (text.includes('wortel')) return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&auto=format&fit=crop&q=80';
  if (text.includes('brokoli')) return 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop&q=80';
  if (text.includes('bayam') || text.includes('sayur')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80';
  if (text.includes('apel')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80';
  if (text.includes('pisang')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80';
  if (text.includes('jeruk')) return 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&auto=format&fit=crop&q=80';
  if (text.includes('kopi')) return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80';
  if (text.includes('teh')) return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80';
  if (text.includes('roti') || text.includes('biskuit') || text.includes('oreo')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80';
  if (text.includes('chitato') || text.includes('keripik') || text.includes('snack')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80';

  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80';
}

/**
 * Product Emoji Container: 100% Large Emoji Box (No <img> tag, No floating absolute badge)
 * User required styling:
 * w-20 h-20 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-xl text-5xl
 */
export function ProductEmojiBox({ name = '', category = '', className = '' }) {
  const emoji = getProductEmoji(name, category);
  return (
    <div 
      className={`w-20 h-20 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-xl text-5xl select-none shadow-2xs border border-slate-200/60 ${className}`}
      title={`${name} (${category})`}
    >
      <span className="leading-none">{emoji}</span>
    </div>
  );
}

/**
 * Backward compatibility alias for ProductImageThumbnail: renders full emoji box
 */
export function ProductImageThumbnail({ name = '', category = '', className = '' }) {
  return <ProductEmojiBox name={name} category={category} className={className} />;
}

/**
 * Price Fluctuation Badge Component
 * Implements Skenario Uji 4 (SRS F-04):
 * - Harga Naik: Badge merah muda [↑ +Rp [Selisih] Naik]
 * - Harga Turun: Badge hijau muda [↓ -Rp [Selisih] Hemat] + Strikethrough old price next to it
 * - Harga Stabil: Badge abu-abu [= Harga Stabil]
 */
export function PriceFluctuationBadge({ 
  currentPrice, 
  historyPrice, 
  price, 
  lastMonthPrice, 
  showOldPrice = true, 
  isCustom = false 
}) {
  // Evaluasi kondisional: jika barang kustom atau riwayat tidak sah, jangan render
  if (!shouldRenderFluctuationBadge({ isCustom, historyPrice, lastMonthPrice })) {
    return null;
  }

  const current = currentPrice !== undefined ? Number(currentPrice) : Number(price || 0);
  const rawHistory = historyPrice !== undefined 
    ? historyPrice 
    : (lastMonthPrice !== undefined ? lastMonthPrice : null);

  const history = Number(rawHistory);
  const diff = current - history;

  if (diff > 0) {
    // Harga Naik (Lebih Mahal): badge merah muda, panah merah ke atas (↑), dan teks "+Rp [Selisih] Naik"
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
        <span>↑</span>
        <span>+Rp {diff.toLocaleString('id-ID')} Naik</span>
      </span>
    );
  } else if (diff < 0) {
    // Harga Turun (Hemat / Lebih Murah): badge hijau muda, panah hijau ke bawah (↓), dan teks "-Rp [Selisih] Hemat"
    const hemat = Math.abs(diff);
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>↓</span>
          <span>-Rp {hemat.toLocaleString('id-ID')} Hemat</span>
        </span>
        {showOldPrice && (
          <span className="line-through text-slate-400 font-normal text-[10px]">
            Rp {Number(history).toLocaleString('id-ID')}
          </span>
        )}
      </div>
    );
  } else {
    // Harga Stabil (Sama): badge abu-abu, tanda (=), dan teks "Harga Stabil"
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span>=</span>
        <span>Harga Stabil</span>
      </span>
    );
  }
}
