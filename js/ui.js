// UI View Management, Modals, Toasts, and Rendering Engine for SakuGrosir

const GroceryUI = {
  activeTab: 'belanja',
  activeCategory: 'Semua',
  editingItemId: null,

  init() {
    this.bindEvents();
    this.updateClock();
    setInterval(() => this.updateClock(), 30000);
  },

  updateClock() {
    const el = document.getElementById('status-bar-time');
    if (el) {
      const d = new Date();
      el.textContent = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '🚨';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    window.soundHaptics.playTap();

    // Update bottom nav button active states
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Render corresponding view
    this.render();
  },

  bindEvents() {
    // Bottom Nav clicks
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Sound toggle in header
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    if (soundToggleBtn) {
      this.updateSoundButtonUI();
      soundToggleBtn.addEventListener('click', () => {
        const isMuted = window.soundHaptics.toggleMute();
        this.updateSoundButtonUI();
        this.showToast(isMuted ? 'Suara dinonaktifkan' : 'Suara & Haptik aktif', 'info');
      });
    }

    // Modal close backdrops
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeAllModals();
        }
      });
    });

    // Close buttons inside modals
    document.querySelectorAll('.sheet-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // Add Item Modal Inputs Live Calculation
    const formInputs = ['item-harga-satuan', 'item-d1', 'item-d2', 'item-potongan', 'item-kuantitas'];
    formInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateItemFormPreview());
      }
    });

    // Item Name Input - Auto-suggest past price from database
    const nameInput = document.getElementById('item-nama');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const pastPrice = window.groceryStore.lookupPastPrice(e.target.value);
        const pastPriceInput = document.getElementById('item-harga-lalu');
        const hintEl = document.getElementById('past-price-hint');
        if (pastPrice && (!pastPriceInput.value || pastPriceInput.dataset.autofilled === 'true')) {
          pastPriceInput.value = pastPrice;
          pastPriceInput.dataset.autofilled = 'true';
          if (hintEl) hintEl.textContent = `Auto-referensi riwayat: Rp ${window.GroceryCalculator.formatNumber(pastPrice)}`;
        }
        this.updateItemFormPreview();
      });
    }

    // Add Item Form Submit
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
      itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveItem();
      });
    }

    // Unit Comparator Live Inputs
    const compInputs = ['comp-price-a', 'comp-qty-a', 'comp-price-b', 'comp-qty-b', 'comp-unit'];
    compInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateComparatorLive());
      }
    });

    // Reset Data action if needed
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Kembalikan ke data simulasi awal anak kos?')) {
          window.groceryStore.resetToDefaults();
          this.showToast('Data demo berhasil di-reset!', 'success');
        }
      });
    }
  },

  updateSoundButtonUI() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;
    const isMuted = window.soundHaptics.isMuted;
    btn.innerHTML = isMuted 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    btn.title = isMuted ? 'Suara Hening' : 'Suara Aktif';
  },

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      window.soundHaptics.playTap();
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('open');
    });
  },

  // Open modal for new item
  openAddItemModal() {
    this.editingItemId = null;
    document.getElementById('modal-item-title').textContent = 'Tambah Item Belanja';
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('item-kuantitas').value = '1';
    document.getElementById('past-price-hint').textContent = '';
    
    // Default values
    document.getElementById('item-d1').value = '0';
    document.getElementById('item-d2').value = '0';
    document.getElementById('item-potongan').value = '0';
    
    this.updateItemFormPreview();
    this.openModal('modal-add-item');
    
    setTimeout(() => {
      document.getElementById('item-nama').focus();
    }, 150);
  },

  // Open modal for editing existing item
  openEditItemModal(itemId) {
    const item = window.groceryStore.getItemById(itemId);
    if (!item) return;

    this.editingItemId = itemId;
    document.getElementById('modal-item-title').textContent = 'Edit Item Belanja';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-nama').value = item.nama_barang;
    document.getElementById('item-kategori').value = item.kategori;
    document.getElementById('item-satuan').value = item.satuan;
    document.getElementById('item-kuantitas').value = item.kuantitas;
    document.getElementById('item-harga-satuan').value = item.harga_satuan;
    document.getElementById('item-d1').value = item.diskon_persen_1 || 0;
    document.getElementById('item-d2').value = item.diskon_persen_2 || 0;
    document.getElementById('item-potongan').value = item.potongan_langsung || 0;
    document.getElementById('item-harga-lalu').value = item.harga_bulan_lalu || '';

    const hintEl = document.getElementById('past-price-hint');
    if (hintEl && item.harga_bulan_lalu) {
      hintEl.textContent = `Riwayat sebelumnya: Rp ${window.GroceryCalculator.formatNumber(item.harga_bulan_lalu)}`;
    }

    this.updateItemFormPreview();
    this.openModal('modal-add-item');
  },

  // Live calculation preview inside modal
  updateItemFormPreview() {
    const hargaSatuan = Number(document.getElementById('item-harga-satuan').value) || 0;
    const d1 = Number(document.getElementById('item-d1').value) || 0;
    const d2 = Number(document.getElementById('item-d2').value) || 0;
    const potongan = Number(document.getElementById('item-potongan').value) || 0;
    const kuantitas = Number(document.getElementById('item-kuantitas').value) || 1;
    const hargaLalu = Number(document.getElementById('item-harga-lalu').value) || 0;

    const calc = window.GroceryCalculator.calculateItemPricing({
      harga_satuan: hargaSatuan,
      diskon_persen_1: d1,
      diskon_persen_2: d2,
      potongan_langsung: potongan,
      kuantitas: kuantitas
    });

    const fluc = window.GroceryCalculator.detectPriceFluctuation(calc.harga_akhir_per_satuan, hargaLalu);

    document.getElementById('prev-harga-awal').textContent = window.GroceryCalculator.formatRupiah(hargaSatuan);
    
    // Formula breakdown text
    let discFormulaText = 'Tanpa Diskon';
    if (d1 > 0 || d2 > 0 || potongan > 0) {
      const parts = [];
      if (d1 > 0) parts.push(`Disc ${d1}%`);
      if (d2 > 0) parts.push(`+ ${d2}%`);
      if (potongan > 0) parts.push(`- Rp${window.GroceryCalculator.formatNumber(potongan)}`);
      discFormulaText = parts.join(' ');
    }
    document.getElementById('prev-diskon-formula').textContent = discFormulaText;

    document.getElementById('prev-harga-unit').textContent = window.GroceryCalculator.formatRupiah(calc.harga_akhir_per_satuan);
    document.getElementById('prev-subtotal').textContent = window.GroceryCalculator.formatRupiah(calc.total_harga_item);

    const flucEl = document.getElementById('prev-fluktuasi-badge');
    if (flucEl) {
      flucEl.className = `fluc-badge ${fluc.colorClass}`;
      flucEl.innerHTML = `${fluc.icon} ${fluc.message}`;
    }
  },

  // Save new or edited item
  handleSaveItem() {
    const nama = document.getElementById('item-nama').value.trim();
    if (!nama) {
      this.showToast('Nama barang wajib diisi!', 'danger');
      return;
    }

    const itemData = {
      nama_barang: nama,
      kategori: document.getElementById('item-kategori').value,
      satuan: document.getElementById('item-satuan').value,
      kuantitas: Number(document.getElementById('item-kuantitas').value) || 1,
      harga_satuan: Number(document.getElementById('item-harga-satuan').value) || 0,
      diskon_persen_1: Number(document.getElementById('item-d1').value) || 0,
      diskon_persen_2: Number(document.getElementById('item-d2').value) || 0,
      potongan_langsung: Number(document.getElementById('item-potongan').value) || 0,
      harga_bulan_lalu: Number(document.getElementById('item-harga-lalu').value) || 0
    };

    if (this.editingItemId) {
      window.groceryStore.updateItem(this.editingItemId, itemData);
      window.soundHaptics.playStep();
      this.showToast('Item berhasil diperbarui!', 'success');
    } else {
      window.groceryStore.addItem(itemData);
      window.soundHaptics.playSuccess();
      this.showToast('Item dimasukkan ke troli belanja!', 'success');
    }

    this.closeAllModals();
  },

  // Open Quick Unit Comparator (F-03)
  openComparatorModal(prefillItemName = '') {
    if (prefillItemName) {
      document.getElementById('comp-name-a').value = `${prefillItemName} Kemasan Kecil`;
      document.getElementById('comp-name-b').value = `${prefillItemName} Kemasan Besar/Grosir`;
    }
    this.updateComparatorLive();
    this.openModal('modal-unit-comparator');
  },

  updateComparatorLive() {
    const nameA = document.getElementById('comp-name-a').value || 'Opsi A';
    const priceA = Number(document.getElementById('comp-price-a').value) || 0;
    const qtyA = Number(document.getElementById('comp-qty-a').value) || 1;

    const nameB = document.getElementById('comp-name-b').value || 'Opsi B';
    const priceB = Number(document.getElementById('comp-price-b').value) || 0;
    const qtyB = Number(document.getElementById('comp-qty-b').value) || 1;

    const unit = document.getElementById('comp-unit').value || 'unit';

    const result = window.GroceryCalculator.compareUnitPrice(
      { name: nameA, price: priceA, qty: qtyA, unit },
      { name: nameB, price: priceB, qty: qtyB, unit }
    );

    const boxA = document.getElementById('comp-box-a');
    const boxB = document.getElementById('comp-box-b');
    const verdictBanner = document.getElementById('comp-verdict-banner');

    document.getElementById('comp-unit-price-a').textContent = `Rp ${window.GroceryCalculator.formatNumber(result.unitPriceA)} / ${unit}`;
    document.getElementById('comp-unit-price-b').textContent = `Rp ${window.GroceryCalculator.formatNumber(result.unitPriceB)} / ${unit}`;

    boxA.classList.toggle('is-winner', result.winner === 'A');
    boxB.classList.toggle('is-winner', result.winner === 'B');

    const badgeA = document.getElementById('comp-badge-a');
    const badgeB = document.getElementById('comp-badge-b');
    badgeA.style.display = result.winner === 'A' ? 'block' : 'none';
    badgeB.style.display = result.winner === 'B' ? 'block' : 'none';

    verdictBanner.innerHTML = `
      <h4>${result.winner === 'A' ? '🏆 PILIHAN A LEBIH MURAH!' : (result.winner === 'B' ? '🏆 PILIHAN B LEBIH MURAH!' : '⚖️ HARGA SETARA')}</h4>
      <p>${result.verdictText}</p>
    `;

    // Winner button
    const addWinnerBtn = document.getElementById('btn-add-winner-to-cart');
    if (addWinnerBtn) {
      if (result.winner === 'A') {
        addWinnerBtn.style.display = 'block';
        addWinnerBtn.textContent = `⚡ Masukkan ${nameA} ke Keranjang`;
        addWinnerBtn.onclick = () => {
          window.groceryStore.addItem({
            nama_barang: nameA,
            kategori: 'Kebutuhan Pokok',
            satuan: unit === 'liter' ? 'liter' : (unit === 'kg' ? 'kg' : 'pcs'),
            kuantitas: 1,
            harga_satuan: priceA,
            diskon_persen_1: 0,
            diskon_persen_2: 0,
            potongan_langsung: 0
          });
          this.closeAllModals();
          this.showToast(`${nameA} berhasil dimasukkan!`, 'success');
        };
      } else if (result.winner === 'B') {
        addWinnerBtn.style.display = 'block';
        addWinnerBtn.textContent = `⚡ Masukkan ${nameB} ke Keranjang`;
        addWinnerBtn.onclick = () => {
          window.groceryStore.addItem({
            nama_barang: nameB,
            kategori: 'Kebutuhan Pokok',
            satuan: unit === 'liter' ? 'liter' : (unit === 'kg' ? 'kg' : 'pcs'),
            kuantitas: 1,
            harga_satuan: priceB,
            diskon_persen_1: 0,
            diskon_persen_2: 0,
            potongan_langsung: 0
          });
          this.closeAllModals();
          this.showToast(`${nameB} berhasil dimasukkan!`, 'success');
        };
      } else {
        addWinnerBtn.style.display = 'none';
      }
    }
  },

  // Open Checkout Modal
  openCheckoutModal() {
    const items = window.groceryStore.getItems();
    if (items.length === 0) {
      this.showToast('Keranjang masih kosong!', 'warning');
      return;
    }

    const totals = window.groceryStore.getCartTotals();
    document.getElementById('checkout-items-count').textContent = totals.totalItemsCount;
    document.getElementById('checkout-total-rp').textContent = window.GroceryCalculator.formatRupiah(totals.runningTotal);
    document.getElementById('checkout-savings-rp').textContent = window.GroceryCalculator.formatRupiah(totals.totalSavings);
    
    // Set default today date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkout-date').value = today;

    this.openModal('modal-checkout');
  },

  handlePerformCheckout() {
    const storeName = document.getElementById('checkout-store-name').value || 'Supermarket Grosir';
    const date = document.getElementById('checkout-date').value;

    const receipt = window.groceryStore.checkoutCart(storeName, date);
    if (receipt) {
      window.soundHaptics.playSuccess();
      this.closeAllModals();
      this.showToast('🎉 Belanja tersimpan ke Riwayat & Database!', 'success');
      this.switchTab('riwayat');
    }
  },

  // View Receipt Detail Modal
  viewReceiptDetail(tripId) {
    const trip = window.groceryStore.getHistory().find(h => h.id === tripId);
    if (!trip) return;

    document.getElementById('receipt-store-title').textContent = trip.store_name;
    document.getElementById('receipt-date-subtitle').textContent = trip.date_display || trip.date;
    document.getElementById('receipt-grand-total').textContent = window.GroceryCalculator.formatRupiah(trip.total_spent);
    document.getElementById('receipt-total-savings').textContent = window.GroceryCalculator.formatRupiah(trip.total_savings || 0);

    const itemsContainer = document.getElementById('receipt-items-breakdown');
    itemsContainer.innerHTML = trip.items.map((item, idx) => `
      <div class="catalog-item-row">
        <div>
          <div style="font-weight: 700; color: #f8fafc;">${idx + 1}. ${item.nama_barang}</div>
          <div style="font-size: 11px; color: #94a3b8;">${item.kuantitas} ${item.satuan} @ Rp ${window.GroceryCalculator.formatNumber(item.harga_akhir_per_satuan)}</div>
        </div>
        <div style="font-weight: 800; color: #34d399;">
          Rp ${window.GroceryCalculator.formatNumber(item.total_harga_item)}
        </div>
      </div>
    `).join('');

    // Actions
    const copyBtn = document.getElementById('btn-copy-receipt-text');
    copyBtn.onclick = () => {
      let text = `🛒 STRUK BELANJA BULANAN KOS\n🏪 ${trip.store_name}\n📅 ${trip.date_display || trip.date}\n---------------------------\n`;
      trip.items.forEach((item, idx) => {
        text += `${idx + 1}. ${item.nama_barang} (${item.kuantitas} ${item.satuan}) = Rp ${window.GroceryCalculator.formatNumber(item.total_harga_item)}\n`;
      });
      text += `---------------------------\n💰 TOTAL: Rp ${window.GroceryCalculator.formatNumber(trip.total_spent)}\n🎉 HEMAT DISKON: Rp ${window.GroceryCalculator.formatNumber(trip.total_savings || 0)}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        this.showToast('Teks struk disalin! Siap kirim ke WA group kos.', 'success');
      } else {
        alert(text);
      }
    };

    const reorderBtn = document.getElementById('btn-reorder-receipt');
    reorderBtn.onclick = () => {
      if (confirm('Muat daftar item ini ke keranjang belanja aktif?')) {
        window.groceryStore.reloadTripToCart(trip.id);
        this.closeAllModals();
        this.switchTab('belanja');
        this.showToast('Item berhasil dimuat ulang ke keranjang!', 'success');
      }
    };

    const deleteBtn = document.getElementById('btn-delete-receipt');
    deleteBtn.onclick = () => {
      if (confirm('Hapus struk riwayat ini?')) {
        window.groceryStore.deleteHistoryTrip(trip.id);
        this.closeAllModals();
        this.render();
        this.showToast('Riwayat dihapus.', 'info');
      }
    };

    this.openModal('modal-receipt-detail');
  },

  // Open Edit Budget Limit Modal
  openBudgetLimitModal() {
    const currentLimit = window.groceryStore.getBudgetLimit();
    document.getElementById('input-budget-limit-val').value = currentLimit;
    document.getElementById('budget-slider-val').value = currentLimit;
    this.openModal('modal-budget-limit');
  },

  handleSaveBudgetLimit() {
    const val = Number(document.getElementById('input-budget-limit-val').value) || 500000;
    window.groceryStore.setBudgetLimit(val);
    window.soundHaptics.playStep();
    this.closeAllModals();
    this.showToast(`Batas saku diatur: Rp ${window.GroceryCalculator.formatNumber(val)}`, 'success');
  },

  // MAIN RENDER LOOP
  render() {
    const totals = window.groceryStore.getCartTotals();
    const cap = totals.budgetCap;

    // 1. Update Header Running Total & Budget Meter
    this.renderHeaderBudget(totals, cap);

    // 2. Render Main Body according to Active Tab
    const mainViewport = document.getElementById('main-viewport');
    if (!mainViewport) return;

    if (this.activeTab === 'belanja') {
      this.renderBelanjaTab(mainViewport, totals);
    } else if (this.activeTab === 'riwayat') {
      this.renderRiwayatTab(mainViewport);
    } else if (this.activeTab === 'anggaran') {
      this.renderAnggaranTab(mainViewport, totals, cap);
    }

    // 3. Update badge count on cart nav item
    const badgeEl = document.getElementById('nav-cart-badge');
    if (badgeEl) {
      badgeEl.textContent = totals.uniqueCount;
      badgeEl.style.display = totals.uniqueCount > 0 ? 'flex' : 'none';
    }
  },

  renderHeaderBudget(totals, cap) {
    const runningTotalEl = document.getElementById('header-running-total');
    const badgeEl = document.getElementById('header-budget-badge');
    const barFillEl = document.getElementById('header-budget-fill');
    const sisaEl = document.getElementById('header-sisa-saldo');
    const limitEl = document.getElementById('header-budget-limit');
    const dangerBannerEl = document.getElementById('header-danger-banner');

    if (runningTotalEl) {
      runningTotalEl.textContent = window.GroceryCalculator.formatRupiah(totals.runningTotal);
    }

    if (limitEl) {
      limitEl.textContent = window.GroceryCalculator.formatRupiah(cap.budgetLimit);
    }

    if (sisaEl) {
      if (cap.remaining >= 0) {
        sisaEl.innerHTML = `Sisa Saku: <strong style="color: #34d399;">${window.GroceryCalculator.formatRupiah(cap.remaining)}</strong>`;
      } else {
        sisaEl.innerHTML = `Overbudget: <strong style="color: #fb7185;">-${window.GroceryCalculator.formatRupiah(Math.abs(cap.remaining))}</strong>`;
      }
    }

    if (badgeEl) {
      badgeEl.className = `budget-badge-pill tier-${cap.tier}`;
      badgeEl.textContent = `${cap.badgeText} (${cap.percentage}%)`;
    }

    if (barFillEl) {
      barFillEl.className = `budget-bar-fill tier-${cap.tier}`;
      barFillEl.style.width = `${Math.min(100, cap.progressWidth)}%`;
    }

    // Danger Alert Trigger (Audio + Vibration + Banner)
    if (dangerBannerEl) {
      if (cap.tier === 'danger') {
        dangerBannerEl.style.display = 'flex';
        dangerBannerEl.innerHTML = `
          <div class="danger-icon">🚨</div>
          <div class="danger-text">
            <strong>AWAS OVERBUDGET (${cap.percentage}%)!</strong><br/>
            ${cap.alertMsg}
          </div>
        `;
        window.soundHaptics.playDangerAlert();
      } else {
        dangerBannerEl.style.display = 'none';
      }
    }
  },

  renderBelanjaTab(container, totals) {
    let items = window.groceryStore.getItems();
    
    // Filter by Category
    if (this.activeCategory !== 'Semua') {
      items = items.filter(i => i.kategori === this.activeCategory);
    }

    const categories = ['Semua', 'Kebutuhan Pokok', 'Makanan Instan', 'Sabun & Pembersih', 'Telur & Daging', 'Minuman & Camilan'];

    let html = `
      <!-- Quick Action Buttons -->
      <div class="quick-tools-strip">
        <button class="quick-tool-btn btn-promo-compare" id="btn-quick-comparator">
          <span>⚡</span>
          <span>Komparator Promo</span>
        </button>
        <button class="quick-tool-btn btn-add-primary" id="btn-quick-add">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Tambah Item</span>
        </button>
      </div>

      <!-- Horizontal Category Chips -->
      <div class="category-chips-bar">
        ${categories.map(cat => `
          <div class="cat-chip ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </div>
        `).join('')}
      </div>
    `;

    if (items.length === 0) {
      html += `
        <div class="empty-state-box">
          <span class="empty-state-icon">🛒</span>
          <h3 class="empty-state-title">Keranjang Belanja Kosong</h3>
          <p class="empty-state-desc">Belum ada item belanja di troli. Tambah barang belanjaanmu sekarang atau gunakan paket hemat!</p>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-checkout-primary" id="btn-empty-add">+ Tambah Barang</button>
            <button class="btn-secondary" id="btn-empty-load-sample">📦 Muat Paket Anak Kos</button>
          </div>
        </div>
      `;
    } else {
      html += `<div class="cart-items-list">`;
      items.forEach(item => {
        const fluc = window.GroceryCalculator.detectPriceFluctuation(item.harga_akhir_per_satuan, item.harga_bulan_lalu);
        const hasDiscount = (item.diskon_persen_1 > 0 || item.diskon_persen_2 > 0 || item.potongan_langsung > 0);

        // Stacked discount formula display
        let discLabel = '';
        if (hasDiscount) {
          const parts = [];
          if (item.diskon_persen_1 > 0) parts.push(`${item.diskon_persen_1}%`);
          if (item.diskon_persen_2 > 0) parts.push(`+ ${item.diskon_persen_2}%`);
          if (item.potongan_langsung > 0) parts.push(`- Rp${window.GroceryCalculator.formatNumber(item.potongan_langsung)}`);
          discLabel = `🏷️ Promo: ${parts.join(' ')}`;
        }

        html += `
          <div class="cart-item-card" data-id="${item.id}">
            <!-- Top info row -->
            <div class="item-card-top">
              <span class="item-cat-badge">${item.kategori}</span>
              <div class="item-top-right">
                <span class="fluc-badge ${fluc.colorClass}" title="${fluc.fullDetail || fluc.title}">
                  ${fluc.icon} ${fluc.message}
                </span>
                <button class="item-del-btn" data-delete-id="${item.id}" title="Hapus Item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <!-- Title & edit trigger -->
            <div class="item-card-title-row">
              <h3 class="item-name" data-edit-id="${item.id}">${item.nama_barang}</h3>
            </div>

            <!-- Stacked discount pill if applicable -->
            ${hasDiscount ? `<div class="stacked-discount-pill">${discLabel}</div>` : ''}

            <!-- Price Breakdown -->
            <div class="item-price-breakdown">
              <span class="price-final-unit tabular-nums">
                ${window.GroceryCalculator.formatRupiah(item.harga_akhir_per_satuan)}
              </span>
              ${hasDiscount ? `
                <span class="price-original-struck tabular-nums">
                  ${window.GroceryCalculator.formatRupiah(item.harga_satuan)}
                </span>
              ` : ''}
              <span class="unit-tag">/ ${item.satuan}</span>
            </div>

            <!-- Footer: Large Touch Stepper (+ / -) & Subtotal (F-02) -->
            <div class="item-card-footer">
              <div class="stepper-control">
                <button class="stepper-btn stepper-btn-minus" data-step-id="${item.id}" data-delta="-1" aria-label="Kurangi Kuantitas">
                  −
                </button>
                <span class="stepper-qty-val tabular-nums">${item.kuantitas}</span>
                <button class="stepper-btn stepper-btn-plus" data-step-id="${item.id}" data-delta="1" aria-label="Tambah Kuantitas">
                  +
                </button>
              </div>

              <div class="item-subtotal-block">
                <div class="subtotal-label">Subtotal</div>
                <div class="subtotal-val tabular-nums">${window.GroceryCalculator.formatRupiah(item.total_harga_item)}</div>
              </div>
            </div>
          </div>
        `;
      });
      html += `</div>`;

      // Bottom Checkout Bar
      html += `
        <div class="cart-checkout-bar">
          <div class="checkout-summary-left">
            <h4>Total Belanja (${totals.totalItemsCount} item)</h4>
            ${totals.totalSavings > 0 ? `
              <div class="checkout-savings-pill">Hemat Rp ${window.GroceryCalculator.formatNumber(totals.totalSavings)}</div>
            ` : '<div style="font-size: 11px; color: #94a3b8;">Siap masuk kasir</div>'}
          </div>
          <button class="btn-checkout-primary" id="btn-trigger-checkout">
            <span>🛒 Selesai Belanja</span>
          </button>
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach Event Listeners for dynamic elements
    container.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.activeCategory = chip.dataset.cat;
        window.soundHaptics.playTap();
        this.render();
      });
    });

    const quickCompBtn = container.querySelector('#btn-quick-comparator');
    if (quickCompBtn) {
      quickCompBtn.addEventListener('click', () => this.openComparatorModal());
    }

    const quickAddBtn = container.querySelector('#btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => this.openAddItemModal());
    }

    const emptyAddBtn = container.querySelector('#btn-empty-add');
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => this.openAddItemModal());
    }

    const emptyLoadSampleBtn = container.querySelector('#btn-empty-load-sample');
    if (emptyLoadSampleBtn) {
      emptyLoadSampleBtn.addEventListener('click', () => {
        window.groceryStore.resetToDefaults();
        this.showToast('Paket hemat anak kos dimuat!', 'success');
      });
    }

    // Steppers + / -
    container.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.stepId;
        const delta = parseInt(btn.dataset.delta, 10);
        window.soundHaptics.playStep();
        window.groceryStore.updateQuantity(id, delta);
      });
    });

    // Delete item
    container.querySelectorAll('.item-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deleteId;
        const item = window.groceryStore.getItemById(id);
        if (confirm(`Hapus "${item?.nama_barang}" dari keranjang?`)) {
          window.groceryStore.deleteItem(id);
          this.showToast('Item dihapus dari keranjang', 'info');
        }
      });
    });

    // Edit item on title tap
    container.querySelectorAll('.item-name').forEach(title => {
      title.addEventListener('click', () => {
        const id = title.dataset.editId;
        this.openEditItemModal(id);
      });
    });

    // Checkout button
    const checkoutBtn = container.querySelector('#btn-trigger-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.openCheckoutModal());
    }
  },

  renderRiwayatTab(container) {
    const history = window.groceryStore.getHistory();
    const catalog = window.groceryStore.getPriceCatalog();
    const catalogEntries = Object.entries(catalog);

    let html = `
      <div style="margin-bottom: 14px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">Riwayat Struk & Database Harga</h2>
        <p style="font-size: 12px; color: #94a3b8;">Catatan struk belanjaan bulan lalu dan pantauan harga referensi.</p>
      </div>

      <!-- Price Catalog / Reference Search -->
      <div class="catalog-search-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase;">
            📊 Database Pantauan Harga (${catalogEntries.length} Item)
          </span>
          <span style="font-size: 11px; color: #94a3b8;">Auto-detect</span>
        </div>
        <div style="max-height: 140px; overflow-y: auto; padding-right: 4px;">
          ${catalogEntries.slice(0, 8).map(([name, price]) => `
            <div class="catalog-item-row">
              <span style="color: #cbd5e1; font-weight: 600;">${name}</span>
              <span style="color: #34d399; font-weight: 700;">Rp ${window.GroceryCalculator.formatNumber(price)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin: 16px 0 10px;">
        Struk Belanja Sebelumnya (${history.length})
      </div>
    `;

    if (history.length === 0) {
      html += `
        <div class="empty-state-box">
          <span class="empty-state-icon">🧾</span>
          <h3 class="empty-state-title">Belum Ada Riwayat Belanja</h3>
          <p class="empty-state-desc">Setelah selesai berbelanja di kasir, tekan tombol "Selesai Belanja" untuk menyimpan struk ke sini!</p>
        </div>
      `;
    } else {
      html += `<div class="history-list">`;
      history.forEach(trip => {
        html += `
          <div class="history-card" data-trip-id="${trip.id}">
            <div class="history-card-top">
              <span class="history-store-name">🏪 ${trip.store_name}</span>
              <span class="history-date">${trip.date_display || trip.date}</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
              ${trip.items_count || trip.items?.length || 0} barang belanjaan
            </div>
            <div class="history-total-row">
              <div>
                <span style="font-size: 10.5px; color: #64748b; text-transform: uppercase;">Total Struk</span>
                <div class="history-total-spent tabular-nums">${window.GroceryCalculator.formatRupiah(trip.total_spent)}</div>
              </div>
              ${trip.total_savings > 0 ? `
                <div class="history-savings-tag">Hemat Rp ${window.GroceryCalculator.formatNumber(trip.total_savings)}</div>
              ` : ''}
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    container.innerHTML = html;

    // Click on history cards to view full receipt
    container.querySelectorAll('.history-card').forEach(card => {
      card.addEventListener('click', () => {
        const tripId = card.dataset.tripId;
        this.viewReceiptDetail(tripId);
      });
    });
  },

  renderAnggaranTab(container, totals, cap) {
    const items = window.groceryStore.getItems();
    
    // Group by category to display breakdown
    const catTotals = {};
    items.forEach(item => {
      const cat = item.kategori || 'Lainnya';
      catTotals[cat] = (catTotals[cat] || 0) + item.total_harga_item;
    });

    const currentLimit = cap.budgetLimit;

    let html = `
      <div style="margin-bottom: 14px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">Pengendali Anggaran Saku</h2>
        <p style="font-size: 12px; color: #94a3b8;">Atur batas pengeluaran anak kos agar tidak overbudget di depan kasir.</p>
      </div>

      <!-- Budget Safety Cap Configuration Card -->
      <div class="budget-config-card">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Batas Limit Saku Bulanan</span>
          <span style="font-size: 20px; font-weight: 800; color: #10b981;" id="display-slider-val">
            ${window.GroceryCalculator.formatRupiah(currentLimit)}
          </span>
        </div>

        <input type="range" class="budget-slider" id="budget-live-slider" 
               min="100000" max="1500000" step="25000" value="${currentLimit}">

        <div style="font-size: 11.5px; color: #94a3b8; margin-top: 4px;">Pilihan Cepat Jatah Uang Saku:</div>
        <div class="budget-quick-presets">
          <button class="preset-pill" data-val="350000">Rp 350.000</button>
          <button class="preset-pill" data-val="500000">Rp 500.000</button>
          <button class="preset-pill" data-val="750000">Rp 750.000</button>
          <button class="preset-pill" data-val="1000000">Rp 1.000.000</button>
        </div>
      </div>

      <!-- Safety Cap Status Explainer -->
      <div class="budget-config-card">
        <h3 style="font-size: 13.5px; font-weight: 800; color: #f8fafc; margin-bottom: 10px;">Indikator Zona Keamanan (Safety Cap)</h3>
        
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.25);">
            <span style="font-size: 16px;">🟢</span>
            <div><strong>Zona Aman (&lt; 80%):</strong> Masih banyak sisa jatah saku.</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.25);">
            <span style="font-size: 16px;">🟡</span>
            <div><strong>Zona Waspada (80% - 94%):</strong> Perhatikan sisa uang sebelum tambah camilan!</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: rgba(244, 63, 94, 0.1); border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.25);">
            <span style="font-size: 16px;">🔴</span>
            <div><strong>Zona Bahaya (≥ 95%):</strong> Alarm berbunyi & getar untuk cegah malu di kasir.</div>
          </div>
        </div>
      </div>

      <!-- Category Spending Breakdown -->
      <div class="cat-breakdown-card">
        <h3 style="font-size: 13.5px; font-weight: 800; color: #f8fafc; margin-bottom: 12px;">Komposisi Belanja Saat Ini</h3>
        ${Object.keys(catTotals).length === 0 ? `
          <div style="font-size: 12px; color: #94a3b8; text-align: center; padding: 12px 0;">Belum ada item di keranjang</div>
        ` : Object.entries(catTotals).map(([cat, amount]) => {
          const pct = totals.runningTotal > 0 ? ((amount / totals.runningTotal) * 100).toFixed(0) : 0;
          return `
            <div class="cat-bar-row">
              <div class="cat-bar-header">
                <span style="color: #cbd5e1;">${cat}</span>
                <span style="color: #f8fafc; font-weight: 700;">Rp ${window.GroceryCalculator.formatNumber(amount)} (${pct}%)</span>
              </div>
              <div class="cat-progress-track">
                <div class="cat-progress-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Kos Survival Grocery Tip -->
      <div class="kos-tip-card">
        <div class="kos-tip-icon">💡</div>
        <div class="kos-tip-body">
          <h4>Tips Belanja Grosir Anak Kos</h4>
          <p>Beli kebutuhan pokok seperti beras 5kg atau minyak 2L di awal bulan jauh lebih hemat hingga 25% dibanding membeli eceran di warung kelontong setiap 3 hari!</p>
        </div>
      </div>

      <!-- Reset Demo Data -->
      <div style="text-align: center; margin-top: 10px;">
        <button class="btn-secondary" id="btn-reset-demo" style="font-size: 11.5px; height: 36px;">
          🔄 Reset Data Demo Awal
        </button>
      </div>
    `;

    container.innerHTML = html;

    // Slider listener
    const slider = container.querySelector('#budget-live-slider');
    const displayVal = container.querySelector('#display-slider-val');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (displayVal) displayVal.textContent = window.GroceryCalculator.formatRupiah(val);
      });
      slider.addEventListener('change', (e) => {
        const val = Number(e.target.value);
        window.groceryStore.setBudgetLimit(val);
        window.soundHaptics.playStep();
      });
    }

    // Quick presets
    container.querySelectorAll('.preset-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.val);
        window.groceryStore.setBudgetLimit(val);
        if (slider) slider.value = val;
        if (displayVal) displayVal.textContent = window.GroceryCalculator.formatRupiah(val);
        window.soundHaptics.playStep();
        this.showToast(`Batas saku disetel: Rp ${window.GroceryCalculator.formatNumber(val)}`, 'info');
      });
    });

    const resetBtn = container.querySelector('#btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Kembalikan semua data ke simulasi belanja kos awal?')) {
          window.groceryStore.resetToDefaults();
          this.showToast('Data demo berhasil di-reset!', 'success');
        }
      });
    }
  }
};

window.GroceryUI = GroceryUI;
