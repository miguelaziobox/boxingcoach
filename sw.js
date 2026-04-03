const CACHE_NAME = 'boxing-coach-v2';
const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './translations.js',
  './manifest.json',
  './images/android/boxing_app_icon.png',
  './images/android/splash_screen.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
