/* Service Worker for Performance Optimization */
const CACHE_NAME = 'tpp-v1.0.0';
const CRITICAL_CACHE = 'tpp-critical-v1.0.0';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/css/critical.min.css',
  '/js/combined.min.js',
  '/favicon.ico'
];

// Resources to cache on first visit
const STATIC_RESOURCES = [
  '/css/style.min.css',
  '/about.html',
  '/services.html',
  '/contact.html',
  '/portfolio.html'
];

// Google Fonts and external resources
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CRITICAL_CACHE).then(cache => cache.addAll(CRITICAL_RESOURCES)),
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_RESOURCES))
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== CRITICAL_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external domains except fonts
  if (url.origin !== location.origin && !isFontRequest(request)) {
    return;
  }

  // Handle different types of requests
  if (isCriticalResource(request)) {
    event.respondWith(cacheFirst(request, CRITICAL_CACHE));
  } else if (isStaticResource(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (isFontRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAME, { maxAge: 31536000 })); // 1 year
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAME, { maxAge: 2592000 })); // 30 days
  } else if (isHTMLRequest(request)) {
    event.respondWith(networkFirst(request, CACHE_NAME));
  } else {
    event.respondWith(networkFirst(request, CACHE_NAME));
  }
});

// Cache-first strategy (for static resources)
async function cacheFirst(request, cacheName, options = {}) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cache is still fresh
      if (options.maxAge) {
        const cacheDate = new Date(cachedResponse.headers.get('date'));
        const now = new Date();
        const ageInSeconds = (now - cacheDate) / 1000;

        if (ageInSeconds > options.maxAge) {
          // Cache expired, try to update in background
          updateCache(request, cacheName);
        }
      }
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return cached version if available, even if expired
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy (for HTML and dynamic content)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Update cache in background
async function updateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.warn('Failed to update cache for:', request.url);
  }
}

// Helper functions
function isCriticalResource(request) {
  const url = request.url;
  return CRITICAL_RESOURCES.some(resource => url.includes(resource)) ||
         url.includes('critical.min.css') ||
         url.includes('combined.min.js');
}

function isStaticResource(request) {
  const url = request.url;
  return url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.woff') ||
         url.includes('.woff2') ||
         url.includes('.ttf') ||
         url.includes('.eot');
}

function isFontRequest(request) {
  const url = request.url;
  return url.includes('fonts.googleapis.com') ||
         url.includes('fonts.gstatic.com') ||
         url.includes('.woff') ||
         url.includes('.woff2') ||
         url.includes('.ttf') ||
         url.includes('.eot');
}

function isImageRequest(request) {
  const url = request.url;
  return url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.png') ||
         url.includes('.webp') ||
         url.includes('.svg') ||
         url.includes('.gif') ||
         url.includes('images/') ||
         url.includes('storage.googleapis.com');
}

function isHTMLRequest(request) {
  const url = request.url;
  return request.headers.get('accept').includes('text/html') ||
         url.endsWith('.html') ||
         (!url.includes('.') && !url.includes('api/'));
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'form-submission') {
    event.waitUntil(handleFormSync());
  }
});

async function handleFormSync() {
  // Handle offline form submissions when connection is restored
  const submissions = await getStoredSubmissions();
  for (const submission of submissions) {
    try {
      await fetch(submission.url, {
        method: 'POST',
        headers: submission.headers,
        body: submission.body
      });
      await removeStoredSubmission(submission.id);
    } catch (error) {
      console.warn('Failed to sync form submission:', error);
    }
  }
}

async function getStoredSubmissions() {
  // Implementation would depend on IndexedDB setup
  return [];
}

async function removeStoredSubmission(id) {
  // Implementation would depend on IndexedDB setup
  return true;
}

// Push notifications (if needed)
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon-192x192.png',
    badge: '/favicon-32x32.png',
    tag: 'tpp-notification',
    requireInteraction: false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'The Profit Platform', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Log performance metrics
    console.log('Performance metrics:', event.data.metrics);
  }
});

// Periodic cache cleanup
setInterval(() => {
  cleanupOldCaches();
}, 24 * 60 * 60 * 1000); // Daily cleanup

async function cleanupOldCaches() {
  const cacheWhitelist = [CACHE_NAME, CRITICAL_CACHE];
  const cacheNames = await caches.keys();

  return Promise.all(
    cacheNames.map(cacheName => {
      if (!cacheWhitelist.includes(cacheName)) {
        return caches.delete(cacheName);
      }
    })
  );
}