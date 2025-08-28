// Future Resume Service Worker
const CACHE_NAME = 'future-resume-v1';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/placeholder.svg',
  // Add other static assets as needed
];

// Routes that should work offline (cached on first visit)
const CACHE_ON_REQUEST = [
  '/dashboard',
  '/builder', 
  '/auth/sign-in',
  '/auth/sign-up',
];

// API routes that should be cached for offline use
const API_CACHE_PATTERNS = [
  /^\/api\/.*$/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page as fallback
              return caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      // Try network first for API requests
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Return cached response with offline indicator
                const offlineResponse = new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText,
                  headers: {
                    ...Object.fromEntries(cachedResponse.headers.entries()),
                    'X-Served-By': 'service-worker-cache',
                    'X-Cache-Date': new Date().toISOString()
                  }
                });
                return offlineResponse;
              }
              // Return offline error
              return new Response(
                JSON.stringify({ 
                  error: 'Offline - no cached data available',
                  offline: true 
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not ok
            if (!response.ok) {
              return response;
            }
            
            // Clone response for caching
            const responseClone = response.clone();
            
            // Cache static assets
            if (request.destination === 'script' || 
                request.destination === 'style' || 
                request.destination === 'image' ||
                request.url.includes('/assets/')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Network failed and not in cache
            if (request.destination === 'image') {
              // Return placeholder for images
              return caches.match('/placeholder.svg');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle background sync for data persistence
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'resume-data-sync') {
    event.waitUntil(
      // Sync resume data when connection is restored
      syncResumeData()
    );
  }
});

async function syncResumeData() {
  try {
    // Get pending resume data from IndexedDB
    const pendingData = await getPendingResumeData();
    
    if (pendingData.length > 0) {
      console.log('[SW] Syncing', pendingData.length, 'resume items');
      
      for (const item of pendingData) {
        try {
          // Attempt to sync each item
          await syncResumeItem(item);
          // Remove from pending queue on success
          await removePendingResumeData(item.id);
        } catch (error) {
          console.error('[SW] Failed to sync resume item:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// IndexedDB operations (simplified - would need full implementation)
async function getPendingResumeData() {
  // TODO: Implement IndexedDB operations
  return [];
}

async function syncResumeItem(item) {
  // TODO: Implement API sync
  return true;
}

async function removePendingResumeData(id) {
  // TODO: Implement IndexedDB cleanup
  return true;
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    actions: data.actions || [],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Future Resume', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notification = event.notification;

  if (action === 'open-app') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});