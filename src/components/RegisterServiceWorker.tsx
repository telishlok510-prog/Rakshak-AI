"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on the client. Mount this once near the root of your
 * app (e.g. in app/layout.tsx) so it runs on every page load.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("[RakshakAI] SW registration failed:", err));
    }
  }, []);

  return null;
}