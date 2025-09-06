// Bump this version any time you change files to refresh caches
const CACHE_STATIC = "asm-static-v1";

// Precache the PWA shell (keep small)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/coat of arms.PNG",
  "/icons/coat of arms.PNG"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategy:
// - Static shell: cache-first
// - Streamlit app (/app/...) and API (/api/...): network-first with cache fallback
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache-first for the shell files
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetch(event.request))
    );
    return;
  }

  // Network-first for app/API so you get fresh data, with offline fallback
  if (url.pathname.startsWith("/app/") || url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(event.request, clone));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
