'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeToggle } from '@/lib/hooks/use-theme-toggle';
import { useContrast } from '@/lib/hooks/use-contrast';
import { useBrightness } from '@/lib/hooks/use-brightness';

function getSection(pathname: string): string {
  if (pathname === '/') return 'HOME';
  const segment = pathname.split('/')[1];
  return (segment || 'HOME').toUpperCase();
}

// External epoch store — avoids setState-in-effect and ref-during-render
let epochCurrent = '----------';
let epochPrev = '----------';
let epochSnapshot = { current: epochCurrent, prev: epochPrev };

function subscribeEpoch(callback: () => void) {
  epochCurrent = String(Math.floor(Date.now() / 1000));
  epochSnapshot = { current: epochCurrent, prev: epochPrev };
  const id = setInterval(() => {
    epochPrev = epochCurrent;
    epochCurrent = String(Math.floor(Date.now() / 1000));
    epochSnapshot = { current: epochCurrent, prev: epochPrev };
    callback();
  }, 1000);
  return () => clearInterval(id);
}

function getEpochSnapshot() {
  return epochSnapshot;
}

const serverSnapshot = { current: '----------', prev: '----------' };

export function StatusBar() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { current: epoch, prev } = useSyncExternalStore(subscribeEpoch, getEpochSnapshot, () => serverSnapshot);
  const { resolvedTheme, toggle } = useThemeToggle();
  const { level: contrast, cycle: cycleContrast } = useContrast();
  const { level: brightness, cycle: cycleBrightness } = useBrightness();
  const pathname = usePathname();

  const themeLabel = mounted ? (resolvedTheme === 'dark' ? 'DARK' : 'LIGHT') : '----';

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
          <span className="shrink-0">{getSection(pathname)}</span>
          <span>{'//'}</span>
          <button
            onClick={toggle}
            className="hover:text-accent transition-colors cursor-pointer"
            aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
          >
            {themeLabel}
          </button>
          <span>{'//'}</span>
          <button
            onClick={cycleContrast}
            className="hover:text-accent transition-colors cursor-pointer"
            aria-label={`Contrast: ${contrast}. Click to cycle.`}
          >
            CTR:{mounted ? contrast.toUpperCase() : '----'}
          </button>
          <span>{'//'}</span>
          <button
            onClick={cycleBrightness}
            className="hover:text-accent transition-colors cursor-pointer"
            aria-label={`Brightness: ${brightness}. Click to cycle.`}
          >
            BRT:{mounted ? brightness.toUpperCase() : '----'}
          </button>
          <span>{'//'}</span>
          <span className="inline-flex">{digits}</span>
        </div>
        <span className="shrink-0 text-text-tertiary">&copy; DETACHED-NODE</span>
      </div>
    </footer>
  );
}
