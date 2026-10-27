// Calculator module for Multi-tier Discounts, Unit Price Comparator, and Price Fluctuations

const GroceryCalculator = {
  /**
   * Hitung harga item dengan rumus diskon bertingkat (F-03):
   * Harga Awal -> Diskon 1 (%) -> Diskon 2 (%) -> Potongan Langsung (Rp)
   * TIDAK menjumlahkan diskon secara langsung (misal 50% + 20% = sisa 40%, bukan sisa 30%)
   */
  calculateItemPricing(item) {
    const hargaSatuan = Math.max(0, Number(item.harga_satuan) || 0);
    const d1 = Math.max(0, Math.min(100, Number(item.diskon_persen_1) || 0));
    const d2 = Math.max(0, Math.min(100, Number(item.diskon_persen_2) || 0));
    const potonganLangsung = Math.max(0, Number(item.potongan_langsung) || 0);
    const kuantitas = Math.max(1, Number(item.kuantitas) || 1);

    // Langkah 1: Diskon Primer
    const hargaSetelahD1 = hargaSatuan * (1 - d1 / 100);

    // Langkah 2: Diskon Bertingkat Sekunder
    const hargaSetelahD2 = hargaSetelahD1 * (1 - d2 / 100);

    // Langkah 3: Potongan Nominal Langsung (Voucher/Cashback)
    const hargaAkhirPerSatuan = Math.max(0, Math.round(hargaSetelahD2 - potonganLangsung));

    // Total harga baris item
    const totalHargaItem = Math.round(hargaAkhirPerSatuan * kuantitas);

    // Hitung penghematan
    const hargaKotorNormal = hargaSatuan * kuantitas;
    const totalHemat = Math.max(0, hargaKotorNormal - totalHargaItem);
    const persenTotalHemat = hargaKotorNormal > 0 
      ? ((totalHemat / hargaKotorNormal) * 100).toFixed(1) 
      : 0;

    return {
      harga_akhir_per_satuan: hargaAkhirPerSatuan,
      total_harga_item: totalHargaItem,
      total_hemat: totalHemat,
      persen_total_hemat: Number(persenTotalHemat),
      detail_diskon: {
        harga_setelah_d1: Math.round(hargaSetelahD1),
        harga_setelah_d2: Math.round(hargaSetelahD2),
        nominal_potongan: potonganLangsung,
        has_discount: d1 > 0 || d2 > 0 || potonganLangsung > 0
      }
    };
  },

  /**
   * Detektor Fluktuasi Harga vs Bulan Lalu (F-04)
   * Menghasilkan status: 🔺 Naik (Mahal), 🔻 Turun (Borong!), ➖ Stabil
   */
  detectPriceFluctuation(hargaSekarang, hargaBulanLalu) {
    const sekarang = Math.max(0, Number(hargaSekarang) || 0);
    const lalu = Number(hargaBulanLalu);

    if (!lalu || isNaN(lalu) || lalu <= 0) {
      return {
        status: 'new',
        icon: '✨',
        title: 'Item Baru',
        message: 'Belum ada data harga bulan lalu',
        colorClass: 'fluc-new',
        diff: 0,
        diffPercent: 0
      };
    }

    const diff = sekarang - lalu;
    const diffPercent = ((diff / lalu) * 100);

    if (diff > 0) {
      return {
        status: 'up',
        icon: '🔺',
        directionSymbol: '↑',
        title: 'Harga Naik',
        message: `Mahal (+Rp ${this.formatNumber(diff)} / +${diffPercent.toFixed(1)}%)`,
        fullDetail: `Naik Rp ${this.formatNumber(diff)} (${diffPercent.toFixed(1)}%) vs bln lalu (Rp ${this.formatNumber(lalu)})`,
        colorClass: 'fluc-up',
        diff: diff,
        diffPercent: Number(diffPercent.toFixed(1))
      };
    } else if (diff < 0) {
      return {
        status: 'down',
        icon: '🔻',
        directionSymbol: '↓',
        title: 'Harga Turun (Borong!)',
        message: `Hemat (-Rp ${this.formatNumber(Math.abs(diff))} / ${diffPercent.toFixed(1)}%)`,
        fullDetail: `Turun Rp ${this.formatNumber(Math.abs(diff))} (${Math.abs(diffPercent).toFixed(1)}%) vs bln lalu (Rp ${this.formatNumber(lalu)})`,
        colorClass: 'fluc-down',
        diff: diff,
        diffPercent: Number(diffPercent.toFixed(1))
      };
    } else {
      return {
        status: 'equal',
        icon: '➖',
        directionSymbol: '=',
        title: 'Harga Stabil',
        message: 'Sama dengan bulan lalu',
        fullDetail: `Stabil di Rp ${this.formatNumber(lalu)} seperti bulan lalu`,
        colorClass: 'fluc-equal',
        diff: 0,
        diffPercent: 0
      };
    }
  },

  /**
   * Hitung rasio Budget Safety Cap (F-05)
   * Menentukan zona: Hijau (<80%), Kuning (80-94.9%), Merah (>=95%)
   */
  calculateBudgetCap(runningTotal, budgetLimit) {
    const total = Math.max(0, Number(runningTotal) || 0);
    const limit = Math.max(1, Number(budgetLimit) || 100000);
    const remaining = limit - total;
    const percentage = (total / limit) * 100;

    let tier = 'safe';
    let statusLabel = 'Aman';
    let badgeText = '🟢 Aman';
    let alertMsg = 'Pengeluaran aman terkendali di bawah limit saku.';

    // DT2 SRS F-05: Merah tegas jika over-budget (>100%), Kuning waspada jika >= 90%
    if (total > limit) {
      tier = 'danger';
      statusLabel = 'BAHAYA OVERBUDGET!';
      badgeText = `🔴 Bahaya (${percentage.toFixed(0)}%)`;
      alertMsg = 'Total belanja melebihi batas saldo dompet! Kurangi kuantitas atau batalkan barang sekunder.';
    } else if (percentage >= 90) {
      tier = 'warning';
      statusLabel = 'Peringatan Waspada';
      badgeText = `🟡 Waspada (${percentage.toFixed(0)}%)`;
      alertMsg = `Mendekati batas dompet (≥90%)! Sisa saldo saku tinggal Rp ${this.formatNumber(remaining)}.`;
    }

    return {
      runningTotal: total,
      budgetLimit: limit,
      remaining: remaining,
      percentage: Number(percentage.toFixed(1)),
      progressWidth: Math.min(100, Math.max(0, percentage)),
      tier: tier,
      statusLabel: statusLabel,
      badgeText: badgeText,
      alertMsg: alertMsg,
      isOver: total > limit
    };
  },

  /**
   * Komparator Harga Satuan / Unit Price Calculator (F-03)
   * Membandingkan 2 pilihan kemasan (misal 1L x 3 kantong vs jerigen 5L)
   */
  compareUnitPrice(optionA, optionB) {
    const qtyA = Math.max(0.001, Number(optionA.qty) || 1);
    const priceA = Math.max(0, Number(optionA.price) || 0);
    const unitPriceA = priceA / qtyA;

    const qtyB = Math.max(0.001, Number(optionB.qty) || 1);
    const priceB = Math.max(0, Number(optionB.price) || 0);
    const unitPriceB = priceB / qtyB;

    let winner = 'draw';
    let diffPerUnit = 0;
    let percentSavings = 0;
    let verdictText = 'Harga per unit sama persis.';

    if (unitPriceA < unitPriceB) {
      winner = 'A';
      diffPerUnit = unitPriceB - unitPriceA;
      percentSavings = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
      verdictText = `Opsi A LEBIH HEMAT Rp ${this.formatNumber(Math.round(diffPerUnit))}/${optionA.unit || 'unit'} (${percentSavings.toFixed(1)}% lebih murah!)`;
    } else if (unitPriceB < unitPriceA) {
      winner = 'B';
      diffPerUnit = unitPriceA - unitPriceB;
      percentSavings = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
      verdictText = `Opsi B LEBIH HEMAT Rp ${this.formatNumber(Math.round(diffPerUnit))}/${optionB.unit || 'unit'} (${percentSavings.toFixed(1)}% lebih murah!)`;
    }

    return {
      unitPriceA: Math.round(unitPriceA),
      unitPriceB: Math.round(unitPriceB),
      winner,
      diffPerUnit: Math.round(diffPerUnit),
      percentSavings: Number(percentSavings.toFixed(1)),
      verdictText
    };
  },

  formatNumber(val) {
    if (isNaN(val) || val === null || val === undefined) return '0';
    return Number(val).toLocaleString('id-ID');
  },

  formatRupiah(val) {
    return `Rp ${this.formatNumber(val)}`;
  },

  formatCompactRupiah(val) {
    const num = Number(val) || 0;
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1).replace('.0', '')}jt`;
    }
    if (num >= 1000) {
      return `Rp ${(num / 1000).toFixed(0)}rb`;
    }
    return `Rp ${num}`;
  }
};

window.GroceryCalculator = GroceryCalculator;
