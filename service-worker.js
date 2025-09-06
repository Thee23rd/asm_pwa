// Cache only the wrapper's own static files (same-origin).
const BASE = "/asm-pwa";
const CACHE_STATIC = "asm-static-v1";
const STATIC_ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/icons/coat of arms.PNG`,
  `${BASE}/icons/coat of arms.PNG`
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_STATIC).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for wrapper assets. Cross-origin app content cannot be controlled here.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith(BASE + "/")) {
    event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
  }
});
