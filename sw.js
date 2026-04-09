// ============================================================
//  Kurukshetra InfoBot — Service Worker (PWA)
//  Cache-first for local assets, network-first for API calls
// ============================================================

const CACHE_NAME = 'infobot-v1.2';

// All local assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './settings.html',
  './feedback.html',
  './script.js',
  './script_mic.js',
  './script_listen.js',
  './settings-integration.js',
  './autocomplete-data.json',
  './js/whatsapp-adapter.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.json'
];

// Patterns that should always go network-first (API calls)
const NETWORK_FIRST_PATTERNS = [
  'n8n-workflow-test',
  'kurukshetra.gov.in/api',
  'webhook'
];

// ── Install: pre-cache all local assets ─────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching assets...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log('[SW] Pre-cache complete');
      return self.skipWaiting();
    })
  );
});

// ── Activate: delete old caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing ─────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network-first for API/webhook calls
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some(p => url.includes(p));
  if (isNetworkFirst) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache-first for everything else (local assets, CDNs)
  event.respondWith(cacheFirst(event.request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return a simple offline fallback for navigation requests
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
