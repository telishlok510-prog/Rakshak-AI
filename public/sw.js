// public/sw.js
const CACHE_NAME = "rakshak-ai-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler — required for the SW to "count" as active,
// but doesn't change any request behavior.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});