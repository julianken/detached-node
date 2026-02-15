'use client';

import { useEffect, useState } from 'react';
import { useThemeToggle } from '@/lib/hooks/use-theme-toggle';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, toggle } = useThemeToggle();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 text-text-secondary focus-ring rounded-md"
        aria-label="Toggle theme"
      >
        <span className="sr-only">Loading theme toggle</span>
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="p-2 text-text-secondary hover:text-accent transition-colors focus-ring rounded-md"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
