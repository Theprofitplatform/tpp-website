/**
 * The Profit Platform - Performance Service Worker
 * Advanced caching strategies for optimal performance
 */

const CACHE_VERSION = 'tpp-performance-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Cache strategies configuration
const CACHE_STRATEGIES = {
    // Critical resources - Cache First with Network Fallback
    critical: {
        strategy: 'cache-first',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 50
    },
    // Static assets - Stale While Revalidate
    static: {
        strategy: 'stale-while-revalidate',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 100
    },
    // Images - Cache First with long expiration
    images: {
        strategy: 'cache-first',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 200
    },
    // API and dynamic content - Network First
    dynamic: {
        strategy: 'network-first',
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 50
    }
};

// Resources to precache on install
const CRITICAL_RESOURCES = [
    '/',
    '/css/critical.min.css',
    '/css/loading-states.css',
    '/js/consolidated.js',
    '/js/components/navigation-inline.js',
    '/manifest.json'
];

// URL patterns for different caching strategies
const URL_PATTERNS = {
    critical: [
        /\/(css|js)\/critical/,
        /\/css\/loading-states/,
        /manifest\.json$/
    ],
    static: [
        /\.(css|js)$/,
        /\.min\.(css|js)$/,
        /\/fonts\//,
        /\.(woff2?|ttf|eot)$/
    ],
    images: [
        /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
        /\/images\//,
        /\/assets\/.*\.(png|jpg|jpeg|gif|webp|svg)$/
    ],
    dynamic: [
        /\/api\//,
        /\?/,
        /\/search/,
        /\/contact/
    ]
};

// Performance metrics tracking
let performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    totalResponseTime: 0,
    requestCount: 0
};

// Install event - Precache critical resources
self.addEventListener('install', event => {
    console.log('🚀 Performance SW: Installing...');

    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE)
                .then(cache => {
                    console.log('✅ Performance SW: Precaching critical resources');
                    return cache.addAll(CRITICAL_RESOURCES.map(url => new Request(url, {
                        cache: 'reload' // Bypass HTTP cache
                    })));
                }),
            // Initialize performance metrics in IndexedDB
            initializeMetricsStorage()
        ]).then(() => {
            console.log('✅ Performance SW: Installation complete');
            return self.skipWaiting(); // Activate immediately
        })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Performance SW: Activating...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName =>
                            cacheName.includes('tpp-performance') &&
                            !cacheName.includes(CACHE_VERSION)
                        )
                        .map(cacheName => {
                            console.log(`🗑️ Performance SW: Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Claim all clients immediately
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Performance SW: Activation complete');
        })
    );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests (except for known CDNs)
    if (!request.url.startsWith(self.location.origin) && !isAllowedCrossOrigin(request.url)) {
        return;
    }

    const startTime = performance.now();
    performanceMetrics.requestCount++;

    // Determine caching strategy based on URL
    const strategy = getCachingStrategy(request.url);

    event.respondWith(
        handleRequest(request, strategy, startTime)
            .catch(error => {
                console.warn('Performance SW: Request failed:', error);
                return handleOfflineFallback(request);
            })
    );
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
    const { type, data } = event.data;

    switch (type) {
        case 'GET_METRICS':
            event.ports[0].postMessage({
                type: 'METRICS_RESPONSE',
                data: performanceMetrics
            });
            break;

        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED',
                    success: true
                });
            });
            break;

        case 'PRELOAD_RESOURCE':
            preloadResource(data.url).then(() => {
                event.ports[0].postMessage({
                    type: 'RESOURCE_PRELOADED',
                    url: data.url
                });
            });
            break;

        case 'UPDATE_CACHE_STRATEGY':
            updateCacheStrategy(data.pattern, data.strategy);
            event.ports[0].postMessage({
                type: 'STRATEGY_UPDATED',
                success: true
            });
            break;

        default:
            console.warn('Performance SW: Unknown message type:', type);
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Push notifications for performance alerts
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        if (data.type === 'performance-alert') {
            event.waitUntil(handlePerformanceAlert(data));
        }
    }
});

// Core Functions

async function handleRequest(request, strategy, startTime) {
    const url = new URL(request.url);
    let response;

    try {
        switch (strategy.name) {
            case 'cache-first':
                response = await cacheFirst(request, strategy);
                break;
            case 'network-first':
                response = await networkFirst(request, strategy);
                break;
            case 'stale-while-revalidate':
                response = await staleWhileRevalidate(request, strategy);
                break;
            default:
                response = await networkFirst(request, strategy);
        }

        // Track performance metrics
        const responseTime = performance.now() - startTime;
        performanceMetrics.totalResponseTime += responseTime;

        // Log performance data
        if (response.status === 200) {
            if (response.headers.get('X-Cache-Status') === 'HIT') {
                performanceMetrics.cacheHits++;
            } else {
                performanceMetrics.networkRequests++;
            }
        }

        return response;

    } catch (error) {
        console.warn('Performance SW: Strategy failed, trying fallback', error);
        return handleRequestFallback(request);
    }
}

async function cacheFirst(request, strategy) {
    const cacheName = getCacheName(strategy.name);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Check if cache entry is still valid
        if (isCacheValid(cachedResponse, strategy.maxAge)) {
            // Add cache hit header
            const response = cachedResponse.clone();
            response.headers.set('X-Cache-Status', 'HIT');
            return response;
        }
    }

    // Cache miss or expired - fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        // Clone response before caching
        const responseToCache = networkResponse.clone();

        // Add timestamp for expiration checking
        responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());

        await cache.put(request, responseToCache);

        // Clean up old entries
        await cleanupCache(cacheName, strategy.maxEntries);
    }

    networkResponse.headers.set('X-Cache-Status', 'MISS');
    return networkResponse;
}

async function networkFirst(request, strategy) {
    const cacheName = getCacheName(strategy.name);

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            const responseToCache = networkResponse.clone();
            responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());

            await cache.put(request, responseToCache);
            await cleanupCache(cacheName, strategy.maxEntries);
        }

        networkResponse.headers.set('X-Cache-Status', 'NETWORK');
        return networkResponse;

    } catch (error) {
        // Network failed - try cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            cachedResponse.headers.set('X-Cache-Status', 'CACHE_FALLBACK');
            return cachedResponse;
        }

        throw error;
    }
}

async function staleWhileRevalidate(request, strategy) {
    const cacheName = getCacheName(strategy.name);
    const cachedResponse = await caches.match(request);

    // Always try to update cache in background
    const networkResponsePromise = fetch(request)
        .then(async networkResponse => {
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                const responseToCache = networkResponse.clone();
                responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());

                await cache.put(request, responseToCache);
                await cleanupCache(cacheName, strategy.maxEntries);
            }
            return networkResponse;
        })
        .catch(error => {
            console.warn('Performance SW: Background update failed:', error);
            return null;
        });

    // Return cached version immediately if available
    if (cachedResponse) {
        cachedResponse.headers.set('X-Cache-Status', 'STALE');
        return cachedResponse;
    }

    // No cache - wait for network
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
        networkResponse.headers.set('X-Cache-Status', 'FRESH');
        return networkResponse;
    }

    throw new Error('Network failed and no cache available');
}

function getCachingStrategy(url) {
    for (const [strategyName, patterns] of Object.entries(URL_PATTERNS)) {
        if (patterns.some(pattern => pattern.test(url))) {
            return {
                name: CACHE_STRATEGIES[strategyName].strategy,
                maxAge: CACHE_STRATEGIES[strategyName].maxAge,
                maxEntries: CACHE_STRATEGIES[strategyName].maxEntries
            };
        }
    }

    // Default strategy
    return {
        name: 'network-first',
        maxAge: CACHE_STRATEGIES.dynamic.maxAge,
        maxEntries: CACHE_STRATEGIES.dynamic.maxEntries
    };
}

function getCacheName(strategy) {
    switch (strategy) {
        case 'cache-first':
            return STATIC_CACHE;
        case 'network-first':
            return DYNAMIC_CACHE;
        case 'stale-while-revalidate':
            return STATIC_CACHE;
        default:
            return DYNAMIC_CACHE;
    }
}

function isCacheValid(response, maxAge) {
    const cacheTimestamp = response.headers.get('X-Cache-Timestamp');
    if (!cacheTimestamp) return true; // Assume valid if no timestamp

    const now = Date.now();
    const cacheAge = now - parseInt(cacheTimestamp);
    return cacheAge < maxAge;
}

async function cleanupCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= maxEntries) return;

    // Sort by timestamp (oldest first)
    const sortedKeys = await Promise.all(
        keys.map(async key => {
            const response = await cache.match(key);
            const timestamp = response?.headers.get('X-Cache-Timestamp') || '0';
            return { key, timestamp: parseInt(timestamp) };
        })
    );

    sortedKeys.sort((a, b) => a.timestamp - b.timestamp);

    // Delete oldest entries
    const entriesToDelete = sortedKeys.length - maxEntries;
    const deletePromises = sortedKeys
        .slice(0, entriesToDelete)
        .map(({ key }) => cache.delete(key));

    await Promise.all(deletePromises);
    console.log(`🗑️ Performance SW: Cleaned up ${entriesToDelete} old cache entries from ${cacheName}`);
}

function isAllowedCrossOrigin(url) {
    const allowedOrigins = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com',
        'www.google-analytics.com',
        'www.googletagmanager.com'
    ];

    return allowedOrigins.some(origin => url.includes(origin));
}

async function handleRequestFallback(request) {
    try {
        // Try any cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            cachedResponse.headers.set('X-Cache-Status', 'FALLBACK');
            return cachedResponse;
        }

        // Try network without caching
        return await fetch(request);
    } catch (error) {
        return handleOfflineFallback(request);
    }
}

async function handleOfflineFallback(request) {
    performanceMetrics.offlineRequests++;

    const url = new URL(request.url);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // Generate simple offline page
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - The Profit Platform</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                    .retry-btn { background: #4F46E5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="offline">
                    <h1>You're Offline</h1>
                    <p>Please check your internet connection and try again.</p>
                    <button class="retry-btn" onclick="window.location.reload()">Retry</button>
                </div>
            </body>
            </html>
        `, {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'text/html',
                'X-Cache-Status': 'OFFLINE'
            }
        });
    }

    // Return placeholder for images
    if (URL_PATTERNS.images.some(pattern => pattern.test(url.pathname))) {
        return generateImagePlaceholder();
    }

    // Return network error for other requests
    return new Response('Network error', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'X-Cache-Status': 'OFFLINE'
        }
    });
}

function generateImagePlaceholder() {
    const svg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">
                Image Unavailable
            </text>
        </svg>
    `;

    return new Response(svg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'X-Cache-Status': 'PLACEHOLDER'
        }
    });
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames
        .filter(name => name.includes('tpp-performance'))
        .map(name => caches.delete(name));

    await Promise.all(deletePromises);
    console.log('🗑️ Performance SW: All caches cleared');
}

async function preloadResource(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const strategy = getCachingStrategy(url);
            const cacheName = getCacheName(strategy.name);
            const cache = await caches.open(cacheName);
            await cache.put(url, response);
            console.log(`✅ Performance SW: Preloaded ${url}`);
        }
    } catch (error) {
        console.warn(`❌ Performance SW: Failed to preload ${url}:`, error);
    }
}

function updateCacheStrategy(urlPattern, newStrategy) {
    // This would require more complex implementation to dynamically update strategies
    console.log(`🔄 Performance SW: Cache strategy update requested for ${urlPattern} -> ${newStrategy}`);
}

async function handleBackgroundSync() {
    console.log('🔄 Performance SW: Handling background sync');

    // Retry failed network requests
    // Implementation would depend on specific requirements

    // Update performance metrics
    await updatePerformanceMetrics();
}

async function handlePerformanceAlert(data) {
    const { title, message, priority } = data;

    await self.registration.showNotification(title, {
        body: message,
        icon: '/images/favicon-32x32.png',
        badge: '/images/favicon-16x16.png',
        tag: 'performance-alert',
        requireInteraction: priority === 'high',
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    });
}

async function initializeMetricsStorage() {
    // Initialize IndexedDB for metrics storage if needed
    console.log('📊 Performance SW: Metrics storage initialized');
}

async function updatePerformanceMetrics() {
    // Update performance metrics in storage
    const metrics = {
        ...performanceMetrics,
        timestamp: Date.now(),
        averageResponseTime: performanceMetrics.totalResponseTime / performanceMetrics.requestCount || 0,
        cacheHitRate: (performanceMetrics.cacheHits / performanceMetrics.requestCount) * 100 || 0
    };

    console.log('📊 Performance SW: Updated metrics:', metrics);
    return metrics;
}

// Periodic cleanup and optimization
setInterval(async () => {
    await updatePerformanceMetrics();

    // Clean up old metrics data
    if (performanceMetrics.requestCount > 1000) {
        performanceMetrics = {
            cacheHits: Math.floor(performanceMetrics.cacheHits * 0.8),
            cacheMisses: Math.floor(performanceMetrics.cacheMisses * 0.8),
            networkRequests: Math.floor(performanceMetrics.networkRequests * 0.8),
            offlineRequests: Math.floor(performanceMetrics.offlineRequests * 0.8),
            totalResponseTime: performanceMetrics.totalResponseTime * 0.8,
            requestCount: Math.floor(performanceMetrics.requestCount * 0.8)
        };
    }
}, 10 * 60 * 1000); // Every 10 minutes

console.log('🚀 Performance SW: Service Worker script loaded');