const CACHE_NAME = 'crazy-cattle-run-cache-v1'; // Change version if you update assets
const urlsToCache = [
    '/', // Often resolves to index.html
    'index.html',
    'style.css',
    'script.js',
    // Add paths to your icons - IMPORTANT! Must match manifest.json and actual files
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png'
    // Add any other assets like sound files or background images here
];

// Install event: Cache core assets
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching core assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Force activation
            .catch(error => {
                console.error('[ServiceWorker] Cache addAll failed:', error);
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch event: Serve from cache first, fallback to network
self.addEventListener('fetch', event => {
    // Don't cache requests that aren't GET
    if (event.request.method !== 'GET') {
        return;
    }

    console.log('[ServiceWorker] Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Serve from cache
                    console.log('[ServiceWorker] Found in cache:', event.request.url);
                    return response;
                }
                // Not in cache, fetch from network
                console.log('[ServiceWorker] Not in cache, fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Optional: Cache the new response for next time
                        // Be careful with caching everything, might cache errors or dynamic content unintentionally
                        // if (networkResponse && networkResponse.status === 200) {
                        //     const responseToCache = networkResponse.clone();
                        //     caches.open(CACHE_NAME)
                        //         .then(cache => {
                        //             cache.put(event.request, responseToCache);
                        //         });
                        // }
                        return networkResponse;
                    })
                    .catch(error => {
                         console.error('[ServiceWorker] Fetch failed:', error);
                         // Optionally return a basic offline fallback page here
                    });
            })
    );
});
