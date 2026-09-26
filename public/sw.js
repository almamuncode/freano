const CACHE_NAME = "freano-cache-v2";
const PRIVATE_CACHE_NAME = "freano-private-v1";
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
        Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== PRIVATE_CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "GET" && url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    }));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const privateCache = await caches.open(PRIVATE_CACHE_NAME);
        if (url.pathname === "/transactions/add") {
          return (await privateCache.match(event.request)) ||
            (await privateCache.match("/transactions/add")) ||
            (await caches.match(OFFLINE_URL));
        }
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_TRANSACTION_FORM") {
    event.waitUntil((async () => {
      const cache = await caches.open(PRIVATE_CACHE_NAME);
      const urls = ["/transactions/add", "/transactions/add?type=INCOME", "/transactions/add?type=EXPENSE"];
      await Promise.all(urls.map(async (url) => {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) return;
        const html = await response.clone().text();
        await cache.put(url, response);
        const assetUrls = [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)].map((match) => match[1]);
        const assetCache = await caches.open(CACHE_NAME);
        await Promise.all([...new Set(assetUrls)].map(async (assetUrl) => {
          const assetResponse = await fetch(assetUrl);
          if (assetResponse.ok) await assetCache.put(assetUrl, assetResponse);
        }));
      }));
    })());
  }
  if (event.data?.type === "CLEAR_PRIVATE_CACHE") {
    event.waitUntil(caches.delete(PRIVATE_CACHE_NAME));
  }
});

function openQueueDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("freano-offline", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function syncTransactionQueue() {
  const database = await openQueueDatabase();
  const transaction = database.transaction("transactionQueue", "readonly");
  const queued = await new Promise((resolve, reject) => {
    const request = transaction.objectStore("transactionQueue").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  for (const item of queued) {
    const response = await fetch(item.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(item.body),
    });
    if (response.ok) {
      await new Promise((resolve, reject) => {
        const request = database.transaction("transactionQueue", "readwrite").objectStore("transactionQueue").delete(item.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else if (response.status === 401) {
      break;
    }
  }
  database.close();
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => client.postMessage({ type: "OFFLINE_TRANSACTIONS_SYNCED" }));
}

self.addEventListener("sync", (event) => {
  if (event.tag === "freano-transactions") event.waitUntil(syncTransactionQueue());
});
