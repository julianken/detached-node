'use client';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const SCANLINES_BG = `repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgb(180 156 255 / var(--scanline-intensity, 0.015)) 2px,
  rgb(180 156 255 / var(--scanline-intensity, 0.015)) 4px
)`;

export function TextureOverlay() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="texture-overlay fixed inset-0 z-50 pointer-events-none"
      style={{ backgroundImage: SCANLINES_BG }}
      aria-hidden="true"
    />
  );
}
