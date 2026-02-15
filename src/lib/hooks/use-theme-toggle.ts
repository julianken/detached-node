'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';

/**
 * Wraps theme toggling in a View Transition for smooth crossfade.
 * Falls back to an instant switch in browsers without support.
 */
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }

    document.documentElement.classList.add('theme-transitioning');
    const transition = document.startViewTransition(() => {
      setTheme(next);
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove('theme-transitioning');
    });
  }, [resolvedTheme, setTheme]);

  return { resolvedTheme, toggle };
}
