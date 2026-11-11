// Service Worker for Smart Grocery Price Tracker & Budget Safety Cap (SakuGrosir)
const CACHE_NAME = 'sakugrosir-pwa-v3';

self.addEventListener('install', (event) => {
  // Langsung aktifkan versi baru tanpa menunggu tab/sesi lama ditutup
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache root fallback agar siap sedia offline
      return cache.addAll(['/']).catch((err) => {
        console.warn('[SW] Pre-caching root fallback non-fatal:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  // Hapus semua cache lama yang tersangkut (termasuk v1 & v2)
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
  // Jangan biarkan Service Worker mencegat file internal Next.js
  if (
    url.pathname.startsWith('/_next/') || 
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    return;
  }

  // Strategi Network-First dengan Fallback Cache yang Aman & Resilient (Zero Undefined Promise)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        try {
          // 1. Coba cari match di cache untuk request ini
          const cached = await caches.match(event.request);
          if (cached) return cached;

          // 2. Untuk request navigasi / HTML, coba kembalikan root cached
          const isHtml = event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html');
          if (isHtml) {
            const rootCached = await caches.match('/');
            if (rootCached) return rootCached;

            // Fallback HTML mandiri jika offline total dan belum ter-cache
            return new Response(
              `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Smart Grocery Sentinel</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #e2e8f0; color: #0f172a; }
    .card { background: white; padding: 2rem; border-radius: 1.5rem; text-align: center; max-width: 380px; margin: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .btn { display: inline-block; margin-top: 1.25rem; background: #065F46; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; cursor: pointer; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 3rem; margin-bottom: 0.75rem;">🛒</div>
    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Smart Grocery Sentinel</h2>
    <p style="font-size: 0.875rem; color: #64748b; line-height: 1.5; margin: 0;">Sedang offline atau koneksi internet terputus. Silakan periksa jaringan Anda lalu muat ulang aplikasi.</p>
    <button class="btn" onclick="window.location.reload()">Muat Ulang Aplikasi</button>
  </div>
</body>
</html>`,
              {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              }
            );
          }

          return new Response('Offline', { status: 503, statusText: 'Offline' });
        } catch (e) {
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })
  );
});
