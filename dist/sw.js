const CACHE_NAME = 'hunt-cache-v5';
const STATIC_ASSETS = [
  './json/maintenance.json',
  './json/mob_data.json',
  './json/mob_locations.json',
  './maps/Amh_Araeng.webp',
  './maps/Central_Thanalan.webp',
  './maps/Coerthas_Western_Highlands.webp',
  './maps/Garlemald.webp',
  './maps/Il_Mheg.webp',
  './maps/Kozama\'uka.webp',
  './maps/Labyrinthos.webp',
  './maps/Living_Memory.webp',
  './maps/The_Azim_Steppe.webp',
  './maps/Ultima_Thule.webp',
  './maps/Upper_La_Noscea.webp',
  './maps/Urqopacha.webp',
  './maps/Yanxia.webp',
  './icon/The_Hunt.png',
  './sound/01 FFXIV_Linkshell_Transmission.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 存在しないファイルで install がコケないよう個別にキャッチ
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn('SW cache failed for:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const hostname = url.hostname;

  // SWキャッシュ対象外にするホスト
  const excludedHosts = new Set([
    'firestore.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'firebasestorage.googleapis.com',
    'firebaseinstallations.googleapis.com'
  ]);

  // サブドメインも含めて除外するドメイン
  const excludedDomains = [
    'firebaseio.com',
    'firebaseapp.com',
    'workers.dev'
  ];

  const isExcludedHost =
    excludedHosts.has(hostname) ||
    excludedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

  if (isExcludedHost || event.request.method !== 'GET') {
    return;
  }

  // Network-First with Cache fallback strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => { });
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
        return new Response('Network error and no cache available', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
