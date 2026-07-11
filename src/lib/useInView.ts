"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered visibility hook using the native IntersectionObserver API.
 * No animation library needed — this is the same primitive premium landing
 * pages use under the hood for fade-up-on-scroll effects.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ponytail: if the browser lacks IntersectionObserver, just show content
    // immediately rather than leaving it invisible forever.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // animate in once, don't re-trigger
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
