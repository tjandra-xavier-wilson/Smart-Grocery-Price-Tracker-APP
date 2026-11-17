/**
 * Dynamic Store Pricing Utilities & Multi-Supermarket Price Engine
 * Supports 4 Supermarkets:
 * 1. "Indogrosir Daan Mogot": Cheapest wholesale pricing (majority current > history - inflation simulation)
 * 2. "Super Indo - Pesanggrahan": Prices ending in X.900 (majority current < history - promo/hemat simulation)
 * 3. "Lotte Mart - Puri Indah": Premium retail pricing (mixed up, down, stable - SRS F-04 3 test items)
 * 4. "Hypermart - Puri Mall": Mid-range pricing (majority current === history - stable pricing simulation)
 */

export const DEFAULT_SUPERMARKET = 'Lotte Mart - Puri Indah';

export const SUPERMARKETS = [
  'Lotte Mart - Puri Indah',
  'Super Indo - Pesanggrahan',
  'Hypermart - Puri Mall',
  'Indogrosir Daan Mogot'
];

/**
 * Normalisasi nama toko untuk menangani variasi seperti
 * "Lotte Mart Grocery - Puri Indah" vs "Lotte Mart - Puri Indah"
 */
export function normalizeSupermarketName(storeName = '') {
  if (!storeName) return DEFAULT_SUPERMARKET;
  const s = String(storeName).toLowerCase();
  if (s.includes('super indo')) return 'Super Indo - Pesanggrahan';
  if (s.includes('hypermart')) return 'Hypermart - Puri Mall';
  if (s.includes('indogrosir')) return 'Indogrosir Daan Mogot';
  if (s.includes('lotte')) return 'Lotte Mart - Puri Indah';
  return storeName;
}

/**
 * Generate atau ambil harga item berdasarkan toko yang sedang dipilih
 * @param {Object} item Objek produk
 * @param {string} supermarket Nama supermarket yang sedang dipilih
 * @returns {{ current: number, history: number }}
 */
export function getItemStorePrice(item, supermarket = DEFAULT_SUPERMARKET) {
  if (!item) return { current: 0, history: 0 };
  const targetStore = normalizeSupermarketName(supermarket);

  // 1. Cek kecocokan langsung di objek item.prices
  if (item.prices && typeof item.prices === 'object') {
    if (item.prices[targetStore]) {
      return {
        current: Number(item.prices[targetStore].current || 0),
        history: Number(item.prices[targetStore].history ?? item.prices[targetStore].current ?? 0)
      };
    }
    for (const [key, val] of Object.entries(item.prices)) {
      if (normalizeSupermarketName(key) === targetStore && val) {
        return {
          current: Number(val.current || 0),
          history: Number(val.history ?? val.current ?? 0)
        };
      }
    }
  }

  // 2. Fallback cerdas berdasarkan aturan spesifik 4 toko jika item belum memiliki properti prices lengkap
  const basePrice = Number(item.price || item.currentPrice || 10000);
  const baseHistory = Number(
    item.lastMonthPrice !== undefined && item.lastMonthPrice !== null
      ? item.lastMonthPrice
      : (item.historyPrice !== undefined ? item.historyPrice : basePrice)
  );

  if (targetStore === 'Indogrosir Daan Mogot') {
    // Harga termurah (grosir): mayoritas current > history (inflasi)
    const current = Math.max(1000, Math.round((basePrice * 0.88) / 500) * 500);
    const history = Math.max(1000, Math.round((current * 0.92) / 500) * 500);
    return { current, history };
  } else if (targetStore === 'Super Indo - Pesanggrahan') {
    // Harga berakhiran X.900: mayoritas current < history (promo / diskon hemat)
    const thousands = Math.floor(basePrice / 1000);
    const current = thousands > 1 ? (thousands * 1000) - 100 : 900;
    const history = current + 3000;
    return { current: Math.max(900, current), history };
  } else if (targetStore === 'Hypermart - Puri Mall') {
    // Harga mid-range: mayoritas current === history (harga stabil)
    const current = Math.round((basePrice * 0.98) / 500) * 500;
    return { current, history: current };
  } else {
    // Lotte Mart - Puri Indah: Harga premium retail (skenario default)
    return { current: basePrice, history: baseHistory };
  }
}

/**
 * Helper untuk membuat struktur prices 4 toko secara otomatis
 */
export function buildStorePrices(lotteCurrent, lotteHistory, superIndoCurrent, superIndoHistory, hypermartPrice, indogrosirCurrent, indogrosirHistory) {
  return {
    'Lotte Mart - Puri Indah': { current: lotteCurrent, history: lotteHistory },
    'Super Indo - Pesanggrahan': { current: superIndoCurrent, history: superIndoHistory },
    'Hypermart - Puri Mall': { current: hypermartPrice, history: hypermartPrice },
    'Indogrosir Daan Mogot': { current: indogrosirCurrent, history: indogrosirHistory }
  };
}
