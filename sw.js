/**
 * Service Worker for The Profit Platform v2.0
 * Enhanced error handling, offline functionality and performance optimizations
 */

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `tpp-cache-v${CACHE_VERSION}`;
const STATIC_CACHE = `tpp-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `tpp-dynamic-v${CACHE_VERSION}`;

// Core assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/contact.html',
    '/pricing.html',
    '/css/style.min.css',
    '/css/critical.min.css',
    '/css/navigation.css',
    '/css/layout.css',
    '/css/performance-optimizations.css',
    '/js/combined.min.js',
    '/js/consolidated.min.js',
    '/images/optimized/logo.webp',
    '/images/optimized/logo.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Fallback pages for offline mode
const FALLBACK_PAGES = {
    offline: '/offline.html',
    error: '/error.html'
};

// Assets that should always be fetched from network first
const NETWORK_FIRST = [
    '/contact.html',
    '/api/',
    '/forms/',
    '/admin/',
    '.php'
];

// Assets that can be cached with stale-while-revalidate strategy
const STALE_WHILE_REVALIDATE = [
    '/css/',
    '/js/',
    '/images/',
    'https://fonts.googleapis.com/',
    'https://fonts.gstatic.com/',
    'https://cdnjs.cloudflare.com/'
];

// ================================
// SERVICE WORKER INSTALLATION
// ================================

self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
});

// ================================
// SERVICE WORKER ACTIVATION
// ================================

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Delete old caches
                            return cacheName !== STATIC_CACHE &&
                                   cacheName !== DYNAMIC_CACHE;
                        })
                        .map(cacheName => {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// ================================
// FETCH STRATEGY ROUTER
// ================================

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // Apply appropriate caching strategy
    if (shouldUseNetworkFirst(url)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (shouldUseStaleWhileRevalidate(url)) {
        event.respondWith(staleWhileRevalidateStrategy(request));
    } else {
        event.respondWith(cacheFirstStrategy(request));
    }
});

// ================================
// CACHING STRATEGIES
// ================================

/**
 * Cache First Strategy - Good for static assets
 * Looks in cache first, falls back to network if not found
 */
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        // Return offline fallback for HTML pages
        if (request.destination === 'document') {
            return new Response('Offline - Please check your internet connection', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }

        throw error;
    }
}

/**
 * Network First Strategy - Good for dynamic content
 * Tries network first, falls back to cache if network fails
 */
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline fallback for HTML pages
        if (request.destination === 'document') {
            return new Response('Offline - Please check your internet connection', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }

        throw error;
    }
}

/**
 * Stale While Revalidate Strategy - Good for frequently updated assets
 * Serves from cache immediately, updates cache in background
 */
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await caches.match(request);

    // Fetch from network and update cache in background
    const networkResponsePromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(error => {
            console.log('Service Worker: Background fetch failed', error);
        });

    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }

    // If no cached version, wait for network
    return networkResponsePromise;
}

// ================================
// STRATEGY SELECTION HELPERS
// ================================

function shouldUseNetworkFirst(url) {
    return NETWORK_FIRST.some(path => url.pathname.startsWith(path));
}

function shouldUseStaleWhileRevalidate(url) {
    return STALE_WHILE_REVALIDATE.some(path =>
        url.pathname.startsWith(path) || url.hostname.includes(path.replace('https://', ''))
    );
}

console.log('Service Worker: Script loaded successfully');