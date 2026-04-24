'use client';

import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';

function rand(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

/**
 * Wraps children with a glitch-in animation on mount. Does not wait
 * for images — image loading is handled by next/image independently.
 */
export function FadeReveal({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ ready: boolean; vars: CSSProperties }>({
    ready: false,
    vars: {},
  });

  useEffect(() => {
    // Mount-time animation: we want the initial render to paint
    // opacity-0, then the effect flips ready so the next render
    // applies glitch-reveal. The cascading render is the point.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      ready: true,
      vars: {
        '--gr-jitter-1': `${rand(0.5, 1.2)}px`,
        '--gr-jitter-2': `${rand(-0.8, -0.3)}px`,
        '--gr-jitter-3': `${rand(0.1, 0.5)}px`,
        '--gr-mid-opacity': `${rand(0.5, 0.75)}`,
        animationDuration: `${rand(350, 500)}ms`,
      } as CSSProperties,
    });
  }, []);

  return (
    <div
      className={`opacity-0 ${state.ready ? 'glitch-reveal' : ''}`}
      style={state.vars}
    >
      {children}
    </div>
  );
}
