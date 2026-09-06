const CACHE_NAME = "freano-cache-v1";
const OFFLINE_URL = "/offline.html";

// Only precache the offline fallback page and a couple of static assets.
// We deliberately do NOT cache API responses or dashboard pages, since this
// is a finance app — showing stale balances/transactions would be worse
// than showing nothing.
const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle page navigations (not API calls, not static assets) —
  // if the network fails while offline, show the offline page instead of
  // a browser error screen.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
