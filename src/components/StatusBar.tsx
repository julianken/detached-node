'use client';

import { useEffect, useRef, useState } from 'react';
import { useThemeToggle } from '@/lib/hooks/use-theme-toggle';

export function StatusBar() {
  const [mounted, setMounted] = useState(false);
  const [epoch, setEpoch] = useState('----------');
  const prevEpoch = useRef(epoch);
  const { resolvedTheme, toggle } = useThemeToggle();

  useEffect(() => {
    setMounted(true);
    setEpoch(String(Math.floor(Date.now() / 1000)));
    const id = setInterval(() => {
      setEpoch(String(Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Update prev AFTER render commits — not during render
  useEffect(() => {
    prevEpoch.current = epoch;
  }, [epoch]);

  const themeLabel = mounted ? (resolvedTheme === 'dark' ? 'DARK' : 'LIGHT') : '----';

  const prev = prevEpoch.current;
  const digits = epoch.split('').map((digit, i) => {
    const changed = digit !== prev[i];
    return (
      <span key={`${i}-${digit}`} className={changed ? 'epoch-pulse' : undefined}>
        {digit}
      </span>
    );
  });

  return (
    <footer className="border-t border-border px-4 py-2 font-mono text-xs tracking-wider text-text-tertiary">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 min-w-0">
          <span className="hidden sm:inline">SYS:NOMINAL</span>
          <span className="hidden sm:inline">//</span>
          <button
            onClick={toggle}
            className="hover:text-accent transition-colors cursor-pointer"
            aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
          >
            {themeLabel}
          </button>
          <span>//</span>
          <span>SIGNAL:ACTIVE</span>
          <span>//</span>
          <span className="inline-flex">{digits}</span>
        </div>
        <span className="shrink-0 text-text-tertiary">&copy; MIND-CONTROLLED</span>
      </div>
    </footer>
  );
}
