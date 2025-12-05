// Elite Fitness Hub - Service Worker
const CACHE_NAME = 'elite-fitness-v1';

// Install event - just activate immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network only for development, with optional caching for production
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests
    if (event.request.url.includes('/api/')) return;

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) return;

    // Network first strategy - don't block on cache failures
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache successful responses
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        })
                        .catch(() => {
                            // Ignore cache errors
                        });
                }
                return response;
            })
            .catch(() => {
                // Try to return from cache if network fails
                return caches.match(event.request);
            })
    );
});