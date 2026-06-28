// Open Design — PWA service worker.
//
// Combines two responsibilities:
//   1. App-shell offline cache: cache the static shell (HTML, CSS, JS, icons,
//      manifest) on install and serve it from the cache when the network is
//      unreachable. Falls back to the cached root page for navigations that
//      haven't been seen before so the app boots even fully offline.
//   2. Notifications: the daemon talks to this SW to surface task-completion
//      toasts via the standard Notification API; clicking one focuses the
//      existing Open Design tab. This block was carried over from the
//      pre-PWA `od-notifications-sw.js` so existing notification behavior
//      keeps working without re-subscribing clients.
//
// Bumping the cache name is the migration strategy — when the app ships a
// new shell we set a new name and the activate handler drops the old caches.

const SW_VERSION = 'od-pwa-v1';
const SHELL_CACHE = `${SW_VERSION}-shell`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const NOTIFICATION_TAG = 'open-design-task';

const SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/app-icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Use addAll with { cache: 'reload' } so we always get fresh from
      // network on install — add() defaults to cache which would race.
      await cache.addAll(
        SHELL_ASSETS.map((url) => new Request(url, { cache: 'reload' })),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Don't intercept API requests, SSE streams, or any cross-origin asset.
  // Let those fall through to the network so live data stays live.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/')) {
    // Network-first for hashed Next assets so updates land immediately.
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigations: try network, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Static assets (CSS, JS, fonts, images): stale-while-revalidate so the
  // app loads instantly from cache while we refresh in the background.
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function navigationStrategy(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cache = await caches.open(SHELL_CACHE);
    const cached =
      (await cache.match(request)) ||
      (await cache.match('/')) ||
      (await cache.match('/index.html'));
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((fresh) => {
      if (fresh && fresh.status === 200) {
        cache.put(request, fresh.clone());
      }
      return fresh;
    })
    .catch(() => null);
  return cached || (await networkPromise) || new Response('', { status: 504 });
}

// --- Notifications (carried over from od-notifications-sw.js) ------------

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const taskId = event.notification && event.notification.data
    ? event.notification.data.taskId
    : null;
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const sameOrigin = allClients.filter(
        (c) => new URL(c.url).origin === self.location.origin,
      );
      if (sameOrigin.length > 0) {
        const target = sameOrigin[0];
        await target.focus();
        target.postMessage({
          type: 'od-notification-click',
          taskId,
        });
      } else {
        await self.clients.openWindow('/');
      }
    })(),
  );
});

self.addEventListener('notificationclose', (event) => {
  // Reserved for future analytics / "you dismissed this" hooks.
});

// Daemon posts a message to the active SW to surface a notification.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'od-notify') {
    self.registration.showNotification(data.title || 'Open Design', {
      body: data.body || '',
      tag: NOTIFICATION_TAG,
      renotify: true,
      data: { taskId: data.taskId || null },
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  }
});
