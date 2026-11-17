/**
 * Smart Emoji Mapping and Price Fluctuation Utilities
 * Supports Lotte Mart Grocery UI & SRS F-04 Skenario Uji 4
 */

import React from 'react';

/**
 * Smart Emoji Mapping for Grocery Products
 * Maps product name and/or category to an appropriate emoji representation.
 */
export function getProductEmoji(itemName = '', category = '') {
  const text = `${itemName || ''} ${category || ''}`.toLowerCase();

  // 1. Staples / Bahan Pokok
  if (text.includes('beras') || text.includes('nasi') || text.includes('rice')) return '🌾';
  if (text.includes('telur') || text.includes('egg')) return '🥚';
  if (text.includes('susu') || text.includes('milk') || text.includes('cream')) return '🥛';
  if (text.includes('minyak') || text.includes('oil')) return '🧴';
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
  if (text.includes('camilan') || text.includes('snack') || text.includes('keripik') || text.includes('chitato') || text.includes('snack')) return '🍿';

  // Fallback Emoji
  return '🛍️';
}

/**
 * Standard Uniform Product Emoji Container Component
 * Strictly styled to Tailwind: `w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-3xl shadow-sm`
 */
export function ProductEmojiBox({ name, category, className = '' }) {
  const emoji = getProductEmoji(name, category);
  return (
    <div 
      className={`w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-3xl shadow-sm shrink-0 select-none ${className}`}
      aria-label={name || 'Produk'}
    >
      <span>{emoji}</span>
    </div>
  );
}

/**
 * Price Fluctuation Badge Component
 * Implements Skenario Uji 4 (SRS F-04):
 * - Harga Turun: Green badge [↓ Hemat Rp X] + Strikethrough old price next to it
 * - Harga Naik: Red badge [↑ Naik Rp X]
 * - Harga Stabil: Gray badge [= Harga Stabil]
 */
export function PriceFluctuationBadge({ price = 0, lastMonthPrice, showOldPrice = true }) {
  if (lastMonthPrice === undefined || lastMonthPrice === null) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
        <span>=</span>
        <span>Harga Stabil</span>
      </span>
    );
  }

  const diff = Number(price) - Number(lastMonthPrice);

  if (diff > 0) {
    // Harga Naik (Lebih Mahal)
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
        <span>↑</span>
        <span>Naik Rp {diff.toLocaleString('id-ID')}</span>
      </span>
    );
  } else if (diff < 0) {
    // Harga Turun (Hemat / Lebih Murah)
    const hemat = Math.abs(diff);
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>↓</span>
          <span>Hemat Rp {hemat.toLocaleString('id-ID')}</span>
        </span>
        {showOldPrice && (
          <span className="line-through text-gray-400 font-normal text-[10px]">
            Rp {Number(lastMonthPrice).toLocaleString('id-ID')}
          </span>
        )}
      </div>
    );
  } else {
    // Harga Stabil (Sama)
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
        <span>=</span>
        <span>Harga Stabil</span>
      </span>
    );
  }
}
