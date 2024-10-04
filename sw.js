const CACHE_NAME = 'snake-feast-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/README.md',
  '/LICENSE',
  '/manifest.json',
  '/sw.js',
  '/img/background1.png',
  '/img/start.png',
  '/img/snakeGame.png',
  '/img/snakeGameOver.png',
  '/icons/snakelogo.png',
  '/icons/snakelogo2.png',
  '/icons/snakelogo3.png',
  '/android/android-launchericon-48-48.png',
  '/android/android-launchericon-72-72.png',
  '/android/android-launchericon-96-96.png',
  '/android/android-launchericon-144-144.png',
  '/android/android-launchericon-192-192.png',
  '/android/android-launchericon-512-512.png',
  '/windows11/LargeTile.scale-100',
  '/windows11/LargeTile.scale-125',
  '/windows11/LargeTile.scale-150',
  '/windows11/LargeTile.scale-200',
  '/windows11/LargeTile.scale-400',
  '/windows11/SmallTile.scale-100',
  '/windows11/SmallTile.scale-125',
  '/windows11/SmallTile.scale-150',
  '/windows11/SmallTile.scale-200',
  '/windows11/SmallTile.scale-400',
  '/windows11/SplashScreen.scale-100',
  '/windows11/SplashScreen.scale-125',
  '/windows11/SplashScreen.scale-150',
  '/windows11/SplashScreen.scale-200',
  '/windows11/SplashScreen.scale-400',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-16',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-20',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-24',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-30',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-32',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-36',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-40',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-44',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-48',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-60',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-64',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-72',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-80',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-96',
  '/windows11/Square44x44Logo.altform-lightunplated_targetsize-256',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-16',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-20',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-24',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-30',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-32',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-36',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-40',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-44',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-48',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-60',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-64',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-72',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-80',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-96',
  '/windows11/Square44x44Logo.altform-unplated_targetsize-256',
  '/windows11/Square44x44Logo.scale-100',
  '/windows11/Square44x44Logo.scale-125',
  '/windows11/Square44x44Logo.scale-150',
  '/windows11/Square44x44Logo.scale-200',
  '/windows11/Square44x44Logo.scale-400',
  '/windows11/Square44x44Logo.targetsize-16',
  '/windows11/Square44x44Logo.targetsize-20',
  '/windows11/Square44x44Logo.targetsize-24',
  '/windows11/Square44x44Logo.targetsize-30',
  '/windows11/Square44x44Logo.targetsize-32',
  '/windows11/Square44x44Logo.targetsize-36',
  '/windows11/Square44x44Logo.targetsize-40',
  '/windows11/Square44x44Logo.targetsize-44',
  '/windows11/Square44x44Logo.targetsize-48',
  '/windows11/Square44x44Logo.targetsize-60',
  '/windows11/Square44x44Logo.targetsize-64',
  '/windows11/Square44x44Logo.targetsize-72',
  '/windows11/Square44x44Logo.targetsize-80',
  '/windows11/Square44x44Logo.targetsize-96',
  '/windows11/Square44x44Logo.targetsize-256',
  '/windows11/Square150x150Logo.scale-100',
  '/windows11/Square150x150Logo.scale-125',
  '/windows11/Square150x150Logo.scale-150',
  '/windows11/Square150x150Logo.scale-200',
  '/windows11/Square150x150Logo.scale-400',
  '/windows11/StoreLogo.scale-100',
  '/windows11/StoreLogo.scale-125',
  '/windows11/StoreLogo.scale-150',
  '/windows11/StoreLogo.scale-200',
  '/windows11/StoreLogo.scale-400',
  '/windows11/Wide310x150Logo.scale-100',
  '/windows11/Wide310x150Logo.scale-125',
  '/windows11/Wide310x150Logo.scale-150',
  '/windows11/Wide310x150Logo.scale-200',
  '/windows11/Wide310x150Logo.scale-400',
  '/ios/16.png',
  '/ios/20.png',
  '/ios/29.png',
  '/ios/32.png',
  '/ios/40.png',
  '/ios/50.png',
  '/ios/57.png',
  '/ios/58.png',
  '/ios/60.png',
  '/ios/64.png',
  '/ios/72.png',
  '/ios/76.png',
  '/ios/80.png',
  '/ios/87.png',
  '/ios/100.png',
  '/ios/114.png',
  '/ios/120.png',
  '/ios/128.png',
  '/ios/144.png',
  '/ios/152.png',
  '/ios/167.png',
  '/ios/180.png',
  '/ios/192.png',
  '/ios/256.png',
  '/ios/512.png',
  '/ios/1024.png',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache:', error);
        });
      })
  );
});


// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
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
