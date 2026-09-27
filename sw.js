const CACHE_NAME = 'app-shell-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-48x48.png',
  '/icons/favicon-64x64.png',
  '/icons/favicon-128x128.png',
  '/icons/favicon-256x256.png',
  '/icons/favicon-512x512.png',
];

// === Установка: кэшируем статику ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// === Активация: удаляем старые кэши ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// === Fetch: выбираем стратегию ===
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Пропускаем запросы к другим источникам (например, CDN chota)
  if (url.origin !== location.origin) return;

  // Динамический контент — Network First
  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          const resClone = networkRes.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
          return networkRes;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((cached) => cached || caches.match('/content/home.html'))
        )
    );
    return;
  }

  // Всё остальное — Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});