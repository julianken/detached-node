'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from './NavLink';

const links = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/agentic-design-patterns', label: 'Patterns' },
  { href: '/about', label: 'About' },
];

const EXIT_MS = 150;

export function MobileNav({
  panelId = 'mobile-nav-panel',
  variant = 'header',
  forceClose = false,
}: {
  panelId?: string;
  variant?: 'header' | 'pill';
  forceClose?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (exitTimerRef.current !== null) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const close = () => {
    if (!open || exiting) return;
    setExiting(true);
    if (exitTimerRef.current !== null) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      setOpen(false);
      setExiting(false);
    }, EXIT_MS);
  };

  useEffect(() => {
    if (forceClose && open && !exiting) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceClose, open, exiting]);

  const toggle = () => {
    if (exiting) return;
    if (open) close();
    else setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exiting]);

  const panelClasses =
    variant === 'pill'
      ? 'absolute inset-x-0 top-full z-40 mt-2 rounded-3xl border border-border bg-background/90 px-2 py-2 backdrop-blur-md sm:hidden'
      : 'absolute inset-x-0 top-full z-40 border-b border-border bg-background px-4 py-2 sm:hidden';

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={panelId}
        className="p-2 text-text-secondary hover:text-accent transition-colors focus-ring rounded-md sm:hidden"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {open && !exiting ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {(open || exiting) && mounted &&
        createPortal(
          <div
            aria-hidden="true"
            onClick={close}
            className="fixed inset-0 z-30 sm:hidden"
          />,
          document.body,
        )}
      {(open || exiting) && (
        <>
          <nav
            id={panelId}
            aria-label="Mobile navigation"
            className={`${panelClasses} ${exiting ? 'panel-glitch-out' : 'panel-glitch-in'}`}
          >
            <ul
              onClick={close}
              className="flex flex-col font-mono text-nav tracking-[0.04em] text-text-secondary"
            >
              {links.map(({ href, label }) => (
                <li key={href}>
                  <NavLink href={href} className="block py-3 px-2 rounded-md">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
