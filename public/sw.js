// Minimal service worker for Rakshak AI.
// Its only job right now is to satisfy Android's PWA installability
// requirement (a registered service worker with a fetch handler) so that
// "Add to Home Screen" and the share_target feature become available.
// We are NOT caching anything yet — that's a separate offline-mode upgrade.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through: just let the network handle every request as normal.
  // (A real offline-cache strategy can be added here later.)
  event.respondWith(fetch(event.request));
});