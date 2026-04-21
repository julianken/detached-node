'use client';

import { useRef, useState, useEffect, type ReactNode, type CSSProperties } from 'react';

/** Random float in range [min, max], rounded to 1 decimal */
function rand(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

/**
 * Holds content invisible until all images within have loaded,
 * then reveals everything with the glitch-in animation.
 *
 * Randomizes jitter, opacity midpoint, and duration so each
 * reveal feels slightly different — like unstable signal lock.
 */
export function FadeReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [vars, setVars] = useState<CSSProperties>({});

  useEffect(() => {
    // Generate random values client-side only to avoid hydration mismatch
    setVars({
      '--gr-jitter-1': `${rand(0.5, 1.2)}px`,
      '--gr-jitter-2': `${rand(-0.8, -0.3)}px`,
      '--gr-jitter-3': `${rand(0.1, 0.5)}px`,
      '--gr-mid-opacity': `${rand(0.5, 0.75)}`,
      animationDuration: `${rand(350, 500)}ms`,
    } as CSSProperties);

    const el = ref.current;
    if (!el) {
      setReady(true);
      return;
    }

    const images = el.querySelectorAll('img');

    // No images — reveal immediately
    if (images.length === 0) {
      setReady(true);
      return;
    }

    let loaded = 0;
    const total = images.length;

    const check = () => {
      loaded++;
      if (loaded >= total) setReady(true);
    };

    images.forEach((img) => {
      // Hidden images (display:none, visibility:hidden) with loading="lazy"
      // never fire load events — the browser correctly skips fetching them.
      // Treat them as ready so we don't stall the reveal waiting on a load
      // that will never happen (e.g. the inactive-theme variant in a stacked
      // light/dark hero pair).
      const cs = window.getComputedStyle(img);
      if (cs.display === 'none' || cs.visibility === 'hidden') {
        check();
        return;
      }
      if (img.complete) {
        check();
      } else {
        img.addEventListener('load', check, { once: true });
        img.addEventListener('error', check, { once: true });
      }
    });

    // Don't wait forever — reveal after 3s regardless
    const timeout = setTimeout(() => setReady(true), 3000);

    return () => {
      clearTimeout(timeout);
      images.forEach((img) => {
        img.removeEventListener('load', check);
        img.removeEventListener('error', check);
      });
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`opacity-0 ${ready ? 'glitch-reveal' : ''}`}
      style={vars}
    >
      {children}
    </div>
  );
}
