const CACHE_NAME = 'snake-feast-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './css/googlefonts.css',
  './css/style.css',
  './js/sound.js',
  './js/phaser.min.js',
  './js/score.js',
  './js/script.js',
  './js/scene.js',
  './README.md',
  './LICENSE',
  './manifest.json',
  './sw.js',
  './icon/16.png',
  './icon/32.png',
  './icon/48.png',
  './icon/64.png',
  './icon/256.png',
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
