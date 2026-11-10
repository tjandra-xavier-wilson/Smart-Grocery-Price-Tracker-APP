// Service Worker for Smart Grocery Price Tracker & Budget Safety Cap (SakuGrosir)
const CACHE_NAME = 'sakugrosir-pwa-v2';

self.addEventListener('install', (event) => {
  // Langsung aktifkan versi baru tanpa menunggu tab/sesi lama ditutup
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Hapus semua cache lama yang tersangkut (termasuk v1 yang menyebabkan loop error di laptop)
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Menghapus cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // PENTING: Lewatkan seluruh bundle Next.js, API, dan Supabase langsung ke jaringan (Network-Direct)
  // Jangan biarkan Service Worker mencegat file internal Next.js agar tidak menyebabkan layar error 'This page couldn't load'
  if (
    url.pathname.startsWith('/_next/') || 
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    return;
  }

  // Strategi Network-First dengan Fallback Cache yang Aman
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika offline, coba ambil dari cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
