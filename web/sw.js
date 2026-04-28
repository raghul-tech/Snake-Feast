const CACHE_NAME = 'snake-feast-web-cache-v1';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './js/canvas.js',
  './js/jquery.min.js',
  './js/script.js',
  './js/qwebchannel.js',
  './manifest.json',
  './icon/180.png',
  './icon/192.png',
  './icon/512.png',
  './icon/background.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => response)
        .catch(() => caches.match('./index.html'));
    })
  );
});
