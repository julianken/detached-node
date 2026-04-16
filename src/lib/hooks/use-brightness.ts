'use client';

import { useCallback, useEffect, useSyncExternalStore, useState } from 'react';

export type BrightnessLevel = 'norm' | 'high' | 'low';

const STORAGE_KEY = 'brightness-preference';
const CYCLE: BrightnessLevel[] = ['norm', 'high', 'low'];

const VALUES: Record<BrightnessLevel, number> = {
  low: 0.75,
  norm: 1.0,
  high: 1.25,
};

function apply(level: BrightnessLevel) {
  const el = document.documentElement;
  if (level === 'norm') {
    el.style.removeProperty('--brightness');
  } else {
    el.style.setProperty('--brightness', String(VALUES[level]));
  }
}

function readStored(): BrightnessLevel {
  const stored = localStorage.getItem(STORAGE_KEY) as BrightnessLevel | null;
  return stored && CYCLE.includes(stored) ? stored : 'norm';
}

export function useBrightness() {
  const initial = useSyncExternalStore(
    () => () => {},
    readStored,
    () => 'norm' as BrightnessLevel,
  );
  const [level, setLevel] = useState(initial);

  useEffect(() => {
    apply(level);
  }, [level]);

  const cycle = useCallback(() => {
    setLevel((prev) => {
      const next = CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length];
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
      return next;
    });
  }, []);

  return { level, cycle };
}
