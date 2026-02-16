'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789';
const MIN_INTERVAL = 45000; // 45 seconds
const MAX_INTERVAL = 90000; // 90 seconds
const GLITCH_DURATION = 80; // ms

function randomChar(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function scrambleText(text: string): string {
  return text
    .split('')
    .map((ch) => (Math.random() > 0.3 ? randomChar() : ch))
    .join('');
}

/**
 * Wraps content and intermittently glitches a random word every 45-90s.
 * Always active unless the user prefers reduced motion.
 */
export function TextGlitch({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefersReducedMotion = useReducedMotion();

  const triggerGlitch = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) =>
          node.textContent && node.textContent.trim().length > 3
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      }
    );

    const textNodes: Text[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) {
      textNodes.push(current as Text);
    }

    if (textNodes.length === 0) return;

    const targetNode = textNodes[Math.floor(Math.random() * textNodes.length)];
    const text = targetNode.textContent || '';
    const words = text.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return;

    const word = words[Math.floor(Math.random() * words.length)];
    const wordIndex = text.indexOf(word);
    if (wordIndex === -1) return;

    const parent = targetNode.parentNode;
    if (!parent) return;

    const before = text.slice(0, wordIndex);
    const after = text.slice(wordIndex + word.length);

    const span = document.createElement('span');
    span.className = 'text-glitch-active';
    span.setAttribute('aria-label', word);
    span.textContent = scrambleText(word);

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    frag.appendChild(span);
    if (after) frag.appendChild(document.createTextNode(after));

    parent.replaceChild(frag, targetNode);

    setTimeout(() => {
      const restoredText = document.createTextNode(text);
      const parentEl = span.parentNode;
      if (!parentEl) return;

      const nodesToRemove: Node[] = [];
      let sibling = span.previousSibling;
      if (sibling && sibling.nodeType === Node.TEXT_NODE && sibling.textContent === before) {
        nodesToRemove.push(sibling);
      }
      nodesToRemove.push(span);
      sibling = span.nextSibling;
      if (sibling && sibling.nodeType === Node.TEXT_NODE && sibling.textContent === after) {
        nodesToRemove.push(sibling);
      }

      parentEl.insertBefore(restoredText, nodesToRemove[0]);
      nodesToRemove.forEach((n) => parentEl.removeChild(n));
    }, GLITCH_DURATION);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    function scheduleNext() {
      const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      timerRef.current = setTimeout(() => {
        triggerGlitch();
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [prefersReducedMotion, triggerGlitch]);

  return <div ref={containerRef}>{children}</div>;
}
