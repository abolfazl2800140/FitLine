// FitLine - Service Worker with Push Notifications
const CACHE_NAME = 'fitline-v2';

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event
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

// Fetch event - network first strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        })
                        .catch(() => { });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body || '',
            icon: data.icon || '/favicon.png',
            badge: data.badge || '/favicon.png',
            tag: data.tag || 'fitline-notification',
            data: data.data || {},
            actions: data.actions || [],
            vibrate: [200, 100, 200],
            requireInteraction: true,
            dir: 'rtl',
            lang: 'fa',
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'فیت‌لاین', options)
        );
    } catch (error) {
        console.error('Error showing notification:', error);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let url = '/';

    // Handle different notification types
    if (data.url) {
        url = data.url;
    } else if (data.type === 'meal_reminder') {
        url = '/nutrition';
    } else if (data.type === 'new_nutrition_plan') {
        url = '/nutrition';
    }

    // Handle action buttons
    if (event.action === 'view') {
        url = data.url || '/nutrition';
    } else if (event.action === 'done') {
        // Mark meal as done - will be handled by the app
        url = `/nutrition?markDone=${data.mealId || ''}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Background sync for offline meal logs
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-meal-logs') {
        event.waitUntil(syncMealLogs());
    }
});

async function syncMealLogs() {
    // Get pending logs from IndexedDB and sync them
    // This will be implemented when offline support is needed
    console.log('Syncing meal logs...');
}
