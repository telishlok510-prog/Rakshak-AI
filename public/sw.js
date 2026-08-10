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

// ============================================================================
// Push Notification Handlers (NEW - for location-based scam alerts)
// ============================================================================

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || "Rakshak AI Alert", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" },
      tag: "rakshak-alert", // Replaces previous notification
      requireInteraction: false, // Auto-dismiss after a while
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If Rakshak AI is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      // Otherwise, open new window
      return clients.openWindow(url);
    })
  );
});