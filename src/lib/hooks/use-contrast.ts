'use client';

import { useCallback, useEffect, useSyncExternalStore, useState } from 'react';

export type ContrastLevel = 'norm' | 'high' | 'ultra' | 'low';

const STORAGE_KEY = 'contrast-preference';
const CYCLE: ContrastLevel[] = ['norm', 'high', 'ultra', 'low'];

// Variable overrides per contrast level and theme.
// 'norm' uses the stylesheet defaults (no overrides).
const OVERRIDES: Record<
  Exclude<ContrastLevel, 'norm'>,
  { light: Record<string, string>; dark: Record<string, string> }
> = {
  high: {
    light: {
      '--background': '#fcfbfe',
      '--foreground': '#0d0815',
      '--surface': '#f4f2f8',
      '--accent': '#6d28d9',
      '--text-primary': '#0d0815',
      '--text-secondary': '#3d3450',
      '--text-tertiary': '#5d5470',
      '--border': '#b8ace8',
      '--border-hover': '#9688d0',
      '--border-subtle': '#d0c8e0',
      '--hover-bg': 'rgba(109, 40, 217, 0.08)',
      '--prose-body': '#3d3450',
      '--prose-headings': '#0d0815',
      '--prose-links': '#6d28d9',
      '--prose-bold': '#0d0815',
      '--prose-counters': '#5d5470',
      '--prose-bullets': '#b8ace8',
      '--prose-hr': '#d0c8e0',
      '--prose-quotes': '#0d0815',
      '--prose-quote-borders': '#b8ace8',
      '--prose-captions': '#5d5470',
      '--prose-code': '#0d0815',
      '--prose-th-borders': '#b8ace8',
      '--prose-td-borders': '#d0c8e0',
    },
    dark: {
      '--background': '#030206',
      '--foreground': '#f0ecf8',
      '--surface': '#0a0810',
      '--accent': '#c4b0ff',
      '--text-primary': '#f8f6fc',
      '--text-secondary': '#b8b0d0',
      '--text-tertiary': '#8880a8',
      '--border': '#382c58',
      '--border-hover': '#584880',
      '--border-subtle': '#1c1630',
      '--hover-bg': 'rgba(196, 176, 255, 0.08)',
      '--prose-body': '#b8b0d0',
      '--prose-headings': '#f8f6fc',
      '--prose-links': '#c4b0ff',
      '--prose-bold': '#f8f6fc',
      '--prose-counters': '#b8b0d0',
      '--prose-bullets': '#382c58',
      '--prose-hr': '#382c58',
      '--prose-quotes': '#f8f6fc',
      '--prose-quote-borders': '#382c58',
      '--prose-captions': '#b8b0d0',
      '--prose-code': '#f8f6fc',
      '--prose-th-borders': '#382c58',
      '--prose-td-borders': '#1c1630',
    },
  },
  ultra: {
    light: {
      '--background': '#ffffff',
      '--foreground': '#000000',
      '--surface': '#f0ecff',
      '--accent': '#7c3aed',
      '--accent-muted': '#6d28d9',
      '--text-primary': '#000000',
      '--text-secondary': '#0d0818',
      '--text-tertiary': '#2a1e48',
      '--border': '#7c68b8',
      '--border-hover': '#5b3fa0',
      '--border-subtle': '#a898d0',
      '--hover-bg': 'rgba(124, 58, 237, 0.12)',
      '--scanline-intensity': '0.04',
      '--prose-body': '#0d0818',
      '--prose-headings': '#000000',
      '--prose-links': '#7c3aed',
      '--prose-bold': '#000000',
      '--prose-counters': '#2a1e48',
      '--prose-bullets': '#7c68b8',
      '--prose-hr': '#a898d0',
      '--prose-quotes': '#000000',
      '--prose-quote-borders': '#7c68b8',
      '--prose-captions': '#2a1e48',
      '--prose-code': '#000000',
      '--prose-th-borders': '#7c68b8',
      '--prose-td-borders': '#a898d0',
    },
    dark: {
      '--background': '#000000',
      '--foreground': '#ffffff',
      '--surface': '#0c0818',
      '--accent': '#c084fc',
      '--accent-muted': '#a855f7',
      '--text-primary': '#ffffff',
      '--text-secondary': '#d8d0f0',
      '--text-tertiary': '#a898c8',
      '--border': '#4c3878',
      '--border-hover': '#7c5cb8',
      '--border-subtle': '#281e40',
      '--hover-bg': 'rgba(192, 132, 252, 0.10)',
      '--scanline-intensity': '0.06',
      '--prose-body': '#d8d0f0',
      '--prose-headings': '#ffffff',
      '--prose-links': '#c084fc',
      '--prose-bold': '#ffffff',
      '--prose-counters': '#d8d0f0',
      '--prose-bullets': '#4c3878',
      '--prose-hr': '#4c3878',
      '--prose-quotes': '#ffffff',
      '--prose-quote-borders': '#4c3878',
      '--prose-captions': '#d8d0f0',
      '--prose-code': '#ffffff',
      '--prose-th-borders': '#4c3878',
      '--prose-td-borders': '#281e40',
    },
  },
  low: {
    light: {
      '--background': '#f4f0fa',
      '--foreground': '#2a2238',
      '--surface': '#ebe6f4',
      '--accent': '#8855f0',
      '--accent-muted': '#7840e0',
      '--text-primary': '#2a2238',
      '--text-secondary': '#635878',
      '--text-tertiary': '#7d7690',
      '--border': '#dcd6e8',
      '--border-hover': '#c8c0d8',
      '--border-subtle': '#e8e4f0',
      '--hover-bg': 'rgba(136, 85, 240, 0.04)',
      '--prose-body': '#635878',
      '--prose-headings': '#2a2238',
      '--prose-links': '#8855f0',
      '--prose-bold': '#2a2238',
      '--prose-counters': '#7d7690',
      '--prose-bullets': '#dcd6e8',
      '--prose-hr': '#e8e4f0',
      '--prose-quotes': '#2a2238',
      '--prose-quote-borders': '#dcd6e8',
      '--prose-captions': '#7d7690',
      '--prose-code': '#2a2238',
      '--prose-th-borders': '#dcd6e8',
      '--prose-td-borders': '#e8e4f0',
    },
    dark: {
      '--background': '#0a0812',
      '--foreground': '#d0ccd8',
      '--surface': '#12101c',
      '--accent': '#9d88e8',
      '--accent-muted': '#8870d8',
      '--text-primary': '#d8d4e0',
      '--text-secondary': '#928ca8',
      '--text-tertiary': '#786e98',
      '--border': '#22182e',
      '--border-hover': '#352850',
      '--border-subtle': '#140f1e',
      '--hover-bg': 'rgba(157, 136, 232, 0.04)',
      '--prose-body': '#928ca8',
      '--prose-headings': '#d8d4e0',
      '--prose-links': '#9d88e8',
      '--prose-bold': '#d8d4e0',
      '--prose-counters': '#928ca8',
      '--prose-bullets': '#22182e',
      '--prose-hr': '#22182e',
      '--prose-quotes': '#d8d4e0',
      '--prose-quote-borders': '#22182e',
      '--prose-captions': '#928ca8',
      '--prose-code': '#d8d4e0',
      '--prose-th-borders': '#22182e',
      '--prose-td-borders': '#140f1e',
    },
  },
};

// All variable names that might be overridden (union of all keys).
const ALL_VARS = [
  ...new Set(
    Object.values(OVERRIDES).flatMap((o) => [
      ...Object.keys(o.light),
      ...Object.keys(o.dark),
    ]),
  ),
];

function applyOverrides(level: ContrastLevel) {
  const el = document.documentElement;
  const isDark = el.classList.contains('dark');

  // Clear all previous overrides
  for (const v of ALL_VARS) el.style.removeProperty(v);

  if (level === 'norm') return;

  const vars = OVERRIDES[level][isDark ? 'dark' : 'light'];
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}

function readStored(): ContrastLevel {
  const stored = localStorage.getItem(STORAGE_KEY) as ContrastLevel | null;
  return stored && CYCLE.includes(stored) ? stored : 'norm';
}

export function useContrast() {
  const initial = useSyncExternalStore(
    () => () => {},
    readStored,
    () => 'norm' as ContrastLevel,
  );
  const [level, setLevel] = useState(initial);

  useEffect(() => {
    applyOverrides(level);

    // Re-apply when theme changes (dark class toggled by next-themes)
    const observer = new MutationObserver(() => {
      applyOverrides(level);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [level]);

  const cycle = useCallback(() => {
    setLevel((prev) => {
      const next = CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length];
      localStorage.setItem(STORAGE_KEY, next);
      applyOverrides(next);
      return next;
    });
  }, []);

  return { level, cycle };
}
