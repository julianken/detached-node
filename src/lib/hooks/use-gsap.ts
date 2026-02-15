'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from './use-reduced-motion';

type GSAPInstance = typeof import('gsap').default;

export function useGsap(callback: (gsap: GSAPInstance) => void | (() => void), deps: unknown[] = []) {
  const prefersReducedMotion = useReducedMotion();
  const cleanupRef = useRef<(() => void) | void>(undefined);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;

    import('gsap').then((mod) => {
      if (cancelled) return;
      cleanupRef.current = callback(mod.default);
    });

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, ...deps]);
}
