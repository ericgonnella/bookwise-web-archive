// Service Worker for BookWise - enables offline functionality

const CACHE_NAME = 'bookwise-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

// Install the service worker and cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowList = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheAllowList.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Use cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-success responses or non-GET requests
            if (!response || response.status !== 200 || event.request.method !== 'GET') {
              return response;
            }

            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            // Add the new response to cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            // If both cache and network fail, return a simple offline page
            // You could create a custom offline.html page instead
            if (event.request.mode === 'navigate') {
              return new Response(
                '<html><body><h1>BookWise - Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            }
            
            console.error('Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
