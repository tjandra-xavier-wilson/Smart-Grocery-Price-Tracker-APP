/**
 * Date Formatting & Standardization Utilities for Smart Grocery Sentinel
 * - Menstandardisasi tanggal input Date Picker (<input type="date">) menjadi format Indonesia (DD MMMM YYYY)
 * - Menyimpan format standar ISO (YYYY-MM-DD) untuk database Supabase dan LocalStorage
 */

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTHS_MAP = {
  'januari': 1, 'jan': 1, 'january': 1,
  'februari': 2, 'feb': 2, 'february': 2,
  'maret': 3, 'mar': 3, 'march': 3,
  'april': 4, 'apr': 4,
  'mei': 5, 'may': 5,
  'juni': 6, 'jun': 6, 'june': 6,
  'juli': 7, 'jul': 7, 'july': 7,
  'agustus': 8, 'agu': 8, 'ags': 8, 'august': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'oktober': 10, 'okt': 10, 'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'desember': 12, 'des': 12, 'december': 12, 'dec': 12
};

/**
 * Mengambil tanggal hari ini dalam format ISO lokal (YYYY-MM-DD)
 * Menghindari pergeseran zona waktu UTC (misal jam 00:13 WIB tidak bergeser mundur ke hari kemarin)
 */
export function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mengurai string tanggal atau objek Date ke komponen lokal { year, month (1-12), day (1-31) }
 * Mencegah pergeseran timezone UTC yang terjadi saat memanggil new Date("YYYY-MM-DD")
 */
export function parseDateComponents(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }

  if (dateStr instanceof Date) {
    return {
      year: dateStr.getFullYear(),
      month: dateStr.getMonth() + 1,
      day: dateStr.getDate()
    };
  }

  const str = String(dateStr).trim();

  // Pola 1: ISO "YYYY-MM-DD" atau "YYYY-MM-DDTHH:mm:ss"
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10)
    };
  }

  // Pola 2: Format Indonesia "24 Mei 2025" atau "1 November 2026" (opsional diawali nama hari)
  const indoMatch = str.toLowerCase().match(/(?:[a-z]+,\s*)?(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (indoMatch) {
    const day = parseInt(indoMatch[1], 10);
    const mNum = MONTHS_MAP[indoMatch[2]] || 1;
    const year = parseInt(indoMatch[3], 10);
    return { year, month: mNum, day };
  }

  // Pola 3: DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return {
      day: parseInt(dmyMatch[1], 10),
      month: parseInt(dmyMatch[2], 10),
      year: parseInt(dmyMatch[3], 10)
    };
  }

  // Pola 4: Fallback aman dengan waktu lokal sekarang
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/**
 * Mengonversi string tanggal ke objek Date lokal murni (new Date(year, month - 1, day))
 * Mencegah pergeseran timezone UTC
 */
export function toLocalDate(dateStr) {
  const { year, month, day } = parseDateComponents(dateStr);
  return new Date(year, month - 1, day, 12, 0, 0); // Jam 12:00 siang lokal aman dari pergeseran hari
}

/**
 * Mengubah tanggal ke format ISO YYYY-MM-DD untuk <input type="date">
 */
export function toISODateString(dateStr) {
  const { year, month, day } = parseDateComponents(dateStr);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Mengubah tanggal ke format terstandarisasi UI Indonesia: "DD MMMM YYYY" (misal: "31 Oktober 2026")
 */
export function toIndoDisplayDate(dateStr) {
  const { year, month, day } = parseDateComponents(dateStr);
  const mName = MONTH_NAMES_ID[month - 1] || 'Januari';
  return `${day} ${mName} ${year}`;
}

/**
 * Mendapatkan kunci periode YYYY-MM untuk pengelompokan filter bulan
 */
export function toYearMonthKey(dateStr) {
  const { year, month } = parseDateComponents(dateStr);
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Mengubah format kunci YYYY-MM menjadi label bulan: "Oktober 2026"
 */
export function formatMonthYearLabel(yearMonthKey) {
  if (!yearMonthKey || yearMonthKey === 'all') return 'Semua Riwayat Belanja';
  const parts = String(yearMonthKey).split('-');
  if (parts.length < 2) return yearMonthKey;
  const y = parts[0];
  const mIdx = parseInt(parts[1], 10) - 1;
  const mName = MONTH_NAMES_ID[mIdx] || parts[1];
  return `${mName} ${y}`;
}

