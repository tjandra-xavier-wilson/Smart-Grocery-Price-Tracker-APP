// Main Application Bootstrap for Smart Grocery Price Tracker & Budget Safety Cap (SakuGrosir)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize UI components
  window.GroceryUI.init();

  // 2. Subscribe UI to Store updates
  window.groceryStore.subscribe(() => {
    window.GroceryUI.render();
  });

  // 3. Initial Render
  window.GroceryUI.render();

  // 4. Handle URL Query Params (PWA App Shortcuts Support)
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const toolParam = urlParams.get('tool');

  if (tabParam && ['belanja', 'riwayat', 'anggaran'].includes(tabParam)) {
    window.GroceryUI.switchTab(tabParam);
  }

  if (toolParam === 'comparator') {
    window.GroceryUI.openComparatorModal();
  }

  // 5. Register PWA Service Worker for Offline Grocery Usage
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[SakuGrosir PWA] Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SakuGrosir PWA] Service Worker registration failed:', err);
      });
  }

  // 6. User gesture audio initialization (Web Audio API policy compliance)
  const initAudioOnFirstTouch = () => {
    window.soundHaptics.initAudio();
    document.removeEventListener('click', initAudioOnFirstTouch);
    document.removeEventListener('touchstart', initAudioOnFirstTouch);
  };
  document.addEventListener('click', initAudioOnFirstTouch, { once: true });
  document.addEventListener('touchstart', initAudioOnFirstTouch, { once: true });

  // 7. Desktop preview toggles
  const btnToggleFrame = document.getElementById('btn-toggle-frame');
  const appShell = document.querySelector('.mobile-app-shell');
  if (btnToggleFrame && appShell) {
    let isFullWidth = false;
    btnToggleFrame.addEventListener('click', () => {
      isFullWidth = !isFullWidth;
      if (isFullWidth) {
        appShell.style.maxWidth = '100%';
        appShell.style.height = '100vh';
        appShell.style.borderRadius = '0';
        appShell.style.border = 'none';
        btnToggleFrame.textContent = '📱 Mode Frame HP (430px)';
      } else {
        appShell.style.maxWidth = '430px';
        appShell.style.height = '900px';
        appShell.style.borderRadius = '46px';
        appShell.style.border = '9px solid #23304a';
        btnToggleFrame.textContent = '↔️ Mode Full Screen';
      }
    });
  }
});
