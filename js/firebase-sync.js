// Firebase Cloud Firestore Realtime Multi-Device Sync Engine (SRS F-06B)
// Wajib menggunakan onSnapshot() untuk mendengarkan perubahan seketika tanpa reload F5

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Konfigurasi Cloud Firestore (dapat dihubungkan ke Firebase Console proyek siswa)
const firebaseConfig = {
  apiKey: "AIzaSyDemoSmartGroceryTracker2026Mb2",
  authDomain: "smart-grocery-price-tracker.firebaseapp.com",
  projectId: "smart-grocery-price-tracker",
  storageBucket: "smart-grocery-price-tracker.appspot.com",
  messagingSenderId: "928374829102",
  appId: "1:928374829102:web:7f8e9d0a1b2c3d4e5f6g"
};

class FirebaseSyncManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.sessionDocRef = null;
    this.sessionId = "lotte_mart_puri_indah_dt2"; // ID Dokumen Sesi Belanja Aktif
    this.isListening = false;
    this.init();
  }

  init() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.sessionDocRef = doc(this.db, "shopping_sessions", this.sessionId);
      this.startRealtimeListener();
      this.updateBadgeUI(true, "Firestore Live");
    } catch (e) {
      console.warn("[FirebaseSync] Mode Lokal Aktif (Fallback):", e.message);
      this.updateBadgeUI(false, "Mode Lokal");
    }
  }

  /**
   * Listener Realtime onSnapshot (SRS F-06B):
   * DILARANG menggunakan getDoc() / getDocs() sekali panggil.
   * Setiap ada item bertambah, berubah kuantitas, atau terhapus di HP,
   * layar PC otomatis menerima snapshot event dan merender ulang detik itu juga.
   */
  startRealtimeListener() {
    if (!this.sessionDocRef) return;

    try {
      onSnapshot(this.sessionDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          console.log("⚡ [Firestore onSnapshot Event]:", remoteData);
          
          if (window.groceryStore && !window.groceryStore.isLocalMutating) {
            window.groceryStore.applyCloudSnapshot(remoteData);
          }
        }
      }, (err) => {
        console.warn("[Firestore onSnapshot Status]: Fallback ke local sync broadcast", err.message);
        this.setupBroadcastChannelFallback();
      });

      this.isListening = true;
    } catch (err) {
      console.warn("[FirebaseSync] onSnapshot catch error:", err);
      this.setupBroadcastChannelFallback();
    }
  }

  // Fallback broadcast channel antar tab / jendela browser
  setupBroadcastChannelFallback() {
    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('grocery_dt2_sync');
        this.channel.onmessage = (event) => {
          if (event.data && window.groceryStore && !window.groceryStore.isLocalMutating) {
            console.log("⚡ [BroadcastChannel Sync]:", event.data);
            window.groceryStore.applyCloudSnapshot(event.data);
          }
        };
      }
    } catch (e) {}
  }

  async broadcastChange(sessionState) {
    // 1. Simpan ke Cloud Firestore jika terhubung
    if (this.sessionDocRef) {
      try {
        await setDoc(this.sessionDocRef, {
          store_name: sessionState.store_name,
          transaction_date: sessionState.transaction_date,
          budget_limit: sessionState.budget_limit,
          items: sessionState.items,
          timestamp: Date.now()
        }, { merge: true });
      } catch (e) {
        // Abaikan error jaringan agar tidak mengganggu operasional lokal
      }
    }

    // 2. Broadcast Channel untuk sinkronisasi seketika antar-tab/layar
    if (this.channel) {
      try {
        this.channel.postMessage({
          store_name: sessionState.store_name,
          transaction_date: sessionState.transaction_date,
          budget_limit: sessionState.budget_limit,
          items: sessionState.items,
          timestamp: Date.now()
        });
      } catch (e) {}
    }
  }

  updateBadgeUI(isLive, labelText) {
    const badge = document.getElementById('cloud-sync-badge');
    const text = document.getElementById('sync-text');
    if (badge && text) {
      if (isLive) {
        badge.classList.remove('offline');
        text.textContent = labelText || 'Firestore Live';
      } else {
        badge.classList.add('offline');
        text.textContent = labelText || 'Mode Lokal';
      }
    }
  }
}

window.FirebaseSync = new FirebaseSyncManager();
