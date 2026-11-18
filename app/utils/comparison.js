/**
 * Transaction Comparison Analytics Logic
 * Modul analitik untuk menghitung komparasi pengeluaran antar 2 sesi transaksi riwayat belanja.
 */

/**
 * Format label opsi transaksi untuk dropdown select (misal: "17 Nov - Lotte Mart")
 * @param {Object} session - Objek sesi transaksi belanja
 * @param {Function} parseDateFn - Parser tanggal opsional
 * @returns {string}
 */
export function formatTxOptionLabel(session, parseDateFn) {
  if (!session) return '';
  const store = session.storeName || session.store_name || session.notes || 'Toko Grosir';
  const dateVal = session.date || session.shopping_date;

  if (dateVal && typeof parseDateFn === 'function') {
    const { day, month } = parseDateFn(dateVal);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mStr = shortMonths[month - 1] || 'Bln';
    return `${day} ${mStr} - ${store}`;
  }

  // Fallback sederhana jika parseDateFn tidak disediakan
  if (dateVal) {
    const str = String(dateVal).trim();
    // Jika format DD Month YYYY (misal "17 November 2026")
    const words = str.split(' ');
    if (words.length >= 2 && !isNaN(parseInt(words[0], 10))) {
      const shortM = words[1].slice(0, 3);
      return `${words[0]} ${shortM} - ${store}`;
    }
  }

  const shortId = session.id ? String(session.id).slice(0, 8) : 'Trx';
  return `#${shortId} - ${store}`;
}

/**
 * Menghitung perbandingan nominal dan persentase antara Transaksi A dan Transaksi B
 * @param {number} totalA - Total nominal belanja Transaksi A
 * @param {number} totalB - Total nominal belanja Transaksi B
 * @param {boolean} isAvailable - Apakah minimal 2 transaksi valid tersedia
 * @returns {Object} Hasil kalkulasi analitik perbandingan
 */
export function calculateTransactionComparison(totalA, totalB, isAvailable = true) {
  if (!isAvailable) {
    return {
      status: 'disabled',
      diff: 0,
      absDiff: 0,
      percent: 0,
      badgeText: 'Min. 2 Transaksi',
      arrowDirection: '=',
      formattedAbsDiff: '0',
      formattedPercent: '0.0',
      conclusionText: 'Minimal butuh 2 transaksi untuk membandingkan pengeluaran.'
    };
  }

  const numA = Number(totalA) || 0;
  const numB = Number(totalB) || 0;
  const diff = numA - numB;
  const absDiff = Math.abs(diff);
  // Persentase kenaikan/penghematan: ((totalA - totalB) / totalB) * 100
  const percent = numB > 0 ? ((numA - numB) / numB) * 100 : 0;
  const formattedAbsDiff = absDiff.toLocaleString('id-ID');
  const formattedPercent = `${Math.abs(percent).toFixed(1)}%`;

  if (numA < numB) {
    return {
      status: 'cheaper',
      diff,
      absDiff,
      percent,
      badgeText: '↓ Lebih Hemat',
      arrowDirection: 'down',
      formattedAbsDiff,
      formattedPercent,
      conclusionText: `Hebat! Transaksi A lebih hemat -Rp ${formattedAbsDiff} (${percent.toFixed(1)}%) dibanding Transaksi B.`
    };
  } else if (numA > numB) {
    return {
      status: 'expensive',
      diff,
      absDiff,
      percent,
      badgeText: '↑ Lebih Boros',
      arrowDirection: 'up',
      formattedAbsDiff,
      formattedPercent,
      conclusionText: `Perhatian! Transaksi A lebih boros +Rp ${formattedAbsDiff} (+${percent.toFixed(1)}%) dibanding Transaksi B.`
    };
  } else {
    return {
      status: 'equal',
      diff: 0,
      absDiff: 0,
      percent: 0,
      badgeText: '= Sama',
      arrowDirection: 'equal',
      formattedAbsDiff: '0',
      formattedPercent: '0.0',
      conclusionText: `Pengeluaran Transaksi A sama dengan Transaksi B (Rp ${numA.toLocaleString('id-ID')}).`
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatTxOptionLabel,
    calculateTransactionComparison
  };
}

