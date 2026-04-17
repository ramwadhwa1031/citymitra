// ============================================================
//  Kurukshetra InfoBot — Service Worker (PWA)
//  v2.0 — Network-first for local assets to prevent stale cache
//  BUMP THIS VERSION every time you deploy changes!
// ============================================================

const CACHE_NAME = 'infobot-v2.0';

// Assets to pre-cache on install (offline fallback)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './city.html',
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
  './icons/city-mitra-bot.png',
  './icons/city-mitra-new-logo.png',
  './manifest.json'
];

// Patterns that should ALWAYS go network-first (API calls)
const API_PATTERNS = [
  'n8n-workflow-test',
  '.gov.in/',
  'webhook'
];

// Patterns for heavy static assets that are safe to cache-first
// (images, fonts, CDN libraries — these rarely change)
const CACHE_FIRST_PATTERNS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'unpkg.com',
  '/icons/'
];

// ── Install: pre-cache all local assets ─────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing new version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching assets...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log('[SW] Pre-cache complete, activating immediately');
      // Skip waiting — activate this SW immediately instead of
      // waiting for all tabs to close
      return self.skipWaiting();
    })
  );
});

// ── Activate: delete ALL old caches & claim clients ──────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating:', CACHE_NAME);
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
    }).then(() => {
      console.log('[SW] Now controlling all clients');
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// ── Message: allow page to force skip waiting ────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    console.log('[SW] Force skip waiting requested');
    self.skipWaiting();
  }
});

// ── Fetch: smart routing ─────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET requests (POST to n8n webhooks, etc.)
  if (event.request.method !== 'GET') return;

  // 1. API/webhook calls → network only (no cache)
  const isAPI = API_PATTERNS.some(p => url.includes(p));
  if (isAPI) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  // 2. Heavy static assets (CDN, fonts, icons) → cache-first
  const isCacheFirst = CACHE_FIRST_PATTERNS.some(p => url.includes(p));
  if (isCacheFirst) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 3. Everything else (HTML, JS, CSS, JSON) → NETWORK-FIRST
  //    This ensures design changes show immediately!
  event.respondWith(networkFirst(event.request));
});

// ── Network-first strategy (for local assets) ────────────────
// Try network first; if offline, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Update cache with fresh version
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Offline — serve from cache
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cached;
    }
    // Last resort: if it's a page navigation, serve city.html (the chatbot)
    if (request.destination === 'document') {
      return caches.match('./city.html');
    }
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

// ── Cache-first strategy (for static assets) ─────────────────
// Serve from cache if available; fetch + cache if not
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
  } catch (error) {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

// ── Network-only strategy (for API calls) ────────────────────
// Never cache, always go to network
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
