const CACHE_NAME = 'snake-feast-cache-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'README.md',
  'LICENSE',
  'manifest.json',
  'sw.js',
  'img/background1.png',
  'img/start.png',
  'img/snakeGame.png',
  'img/snakeGameOver.png',
  'icons/16.png',
  'icons/32.png',
  'icons/48.png',
  'icons/64.png',
  'icons/snakelogo3.png',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(error => {
        //  console.error('Failed to cache:', error);
        });
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
