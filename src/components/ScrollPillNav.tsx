'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Link } from 'next-view-transitions';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { NavLink } from './NavLink';
import { GitHubLink } from './GitHubLink';

const GLITCH_MS = 280;

export function ScrollPillNav() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const prevTheme = useRef<string | undefined>(undefined);
  const [pillVisible, setPillVisible] = useState(false);

  useEffect(() => {
    if (prevTheme.current === undefined) {
      prevTheme.current = resolvedTheme;
      return;
    }
    if (prevTheme.current === resolvedTheme) return;
    prevTheme.current = resolvedTheme;

    const el = innerRef.current;
    if (!el) return;
    el.dataset.glitching = 'true';
    const t = setTimeout(() => {
      delete el.dataset.glitching;
    }, GLITCH_MS);
    return () => clearTimeout(t);
  }, [resolvedTheme]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let lastY = window.scrollY;
    let visible = false;
    let ticking = false;

    const apply = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      el.dataset.visible = v ? 'true' : 'false';
      el.setAttribute('aria-hidden', v ? 'false' : 'true');
      setPillVisible(v);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY;
        if (y < 80) apply(false);
        else if (dy < -6) apply(true);
        else if (dy > 6) apply(false);
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-visible="false"
      aria-hidden="true"
      style={{ willChange: 'opacity', '--pill-glitch-ms': `${GLITCH_MS}ms` } as CSSProperties}
      className="scroll-pill-nav pointer-events-none fixed inset-x-0 top-3 z-[60] px-4 opacity-0 transition-opacity duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[visible=true]:pointer-events-auto data-[visible=true]:opacity-100 sm:px-0"
    >
      <div
        ref={innerRef}
        className="relative mx-auto flex max-w-frame items-center gap-4 rounded-full border border-border bg-background/90 px-4 py-2 shadow-sm backdrop-blur-md sm:gap-5 sm:px-5"
      >
        <Link
          href="/"
          className="font-mono text-brand font-semibold tracking-tight text-accent lowercase focus-ring"
        >
          d-n
        </Link>
        <nav
          className="hidden items-center gap-5 text-nav font-mono tracking-[0.04em] text-text-secondary sm:flex"
          aria-label="Floating navigation"
        >
          <NavLink href="/">Home</NavLink>
          <NavLink href="/posts">Posts</NavLink>
          <NavLink href="/agentic-design-patterns">Patterns</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <GitHubLink />
          <ThemeToggle />
          <MobileNav panelId="pill-mobile-nav-panel" variant="pill" forceClose={!pillVisible} />
        </div>
      </div>
    </div>
  );
}
