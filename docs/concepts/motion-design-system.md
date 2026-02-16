# Motion Design System: Detached Node

**Status:** Concept
**Source:** Design exploration, February 2026
**Theme:** "Reading the source code of reality"

---

## Design Philosophy

The reader is someone who has stepped outside the signal. They can see the conditioning apparatus -- the loops, the repetition, the manufactured consensus. The interface should feel like a precision instrument for the awakened: a high-end terminal that treats the reader as an operator, not a consumer.

**Three governing principles:**

1. **Restraint over spectacle.** Every animation must earn its place. If it does not reinforce the theme or improve usability, it does not ship.
2. **Dark mode is the primary experience.** Light mode is a concession. The terminal lives in the dark.
3. **Nothing should impede reading.** The content is philosophy. The motion layer must enhance focus, never compete with it. Every interaction described below must pass the test: "Would this annoy someone reading a 3,000-word essay for the fourth time?"

---

## 1. Navigation Micro-Interactions

### 1A. Underscore Cursor Hover

**Description:** Nav links have no visible underline by default. On hover, a blinking block cursor (like a terminal insertion point) appears at the end of the link text. The cursor blinks at a steady 530ms interval -- the classic terminal rate. When the cursor appears, the link text shifts to a monospace font with a 120ms ease-out transition, as though the system is "resolving" the destination.

On focus (keyboard navigation), the same cursor appears without requiring hover.

**Visual detail:**
- Cursor: 2px wide, full text height, `zinc-400` in dark mode, `zinc-600` in light
- Blink: `opacity: 1` for 530ms, `opacity: 0` for 530ms
- Font transition: system sans -> mono, 120ms ease-out
- Link color shifts from `zinc-400` to `zinc-100` (dark) over 150ms

**Complexity:** 2/5
**Subtlety:** 2/5 (noticeable but not flashy)
**Annoyance risk:** Low. Only fires on hover. Keyboard users see a stable cursor.
**Recommendation:** Always-on

**Implementation notes:**
```css
/* The blinking cursor pseudo-element */
.nav-link::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  margin-left: 2px;
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.nav-link:hover::after,
.nav-link:focus-visible::after {
  animation: terminal-blink 1.06s step-end infinite;
}

@keyframes terminal-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

```tsx
// In layout.tsx nav links
<Link
  className="nav-link font-sans hover:font-mono transition-[font-family] duration-120
             text-zinc-600 dark:text-zinc-400
             hover:text-zinc-900 dark:hover:text-zinc-100
             py-2 focus-ring"
  href="/posts"
>
  Posts
</Link>
```

### 1B. Command Prefix on Active Route

**Description:** The currently active nav link displays a `>` prefix character in `zinc-500`, mimicking a terminal prompt. This character fades in on page load with a 200ms delay. Other links show no prefix.

**Visual detail:**
- Prefix: `>` in monospace, `zinc-500`
- Spacing: 4px gap between prefix and link text
- Fade-in: 200ms ease-out, 200ms delay after page mount

**Complexity:** 1/5
**Subtlety:** 3/5 (clearly visible but unobtrusive)
**Annoyance risk:** None
**Recommendation:** Always-on

### 1C. Site Title Decode Effect (Initial Load Only)

**Description:** On the very first page load of a session, the "Detached Node" site title in the header briefly displays as scrambled characters before resolving to the actual text. The scramble uses characters from a curated set: `01./\|{}[]<>$#@`. Each character resolves left-to-right over approximately 400ms total, with each character taking 2-3 "rolls" before settling.

On subsequent navigations within the session, the title is static. This only fires once.

**Visual detail:**
- Character set: `0 1 . / \ | { } [ ] < > $ # @`
- Resolution: left-to-right, each char rolls 2-3 times at 40ms intervals
- Total duration: ~400-600ms
- Font: monospace during decode, transitions to sans after completion
- Uses `sessionStorage` flag to fire only once per session

**Complexity:** 3/5
**Subtlety:** 4/5 (very noticeable on first load, then gone)
**Annoyance risk:** None (fires once)
**Recommendation:** Always-on, dark mode only. In light mode, display statically.

**Implementation sketch:**
```tsx
'use client';
import { useEffect, useRef, useState } from 'react';

const CHARS = '01./\\|{}[]<>$#@';
const TARGET = 'Detached Node';

export function DecodingTitle() {
  const [display, setDisplay] = useState(TARGET);
  const [resolved, setResolved] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    if (sessionStorage.getItem('title-decoded')) {
      setResolved(true);
      return;
    }
    hasRun.current = true;

    let currentIndex = 0;
    const interval = setInterval(() => {
      setDisplay(prev => {
        const chars = TARGET.split('');
        return chars.map((char, i) => {
          if (i < currentIndex) return char;
          if (char === ' ' || char === '-') return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
      });
      currentIndex += 0.5; // resolves ~2 chars per 40ms tick
      if (currentIndex >= TARGET.length) {
        clearInterval(interval);
        setDisplay(TARGET);
        setResolved(true);
        sessionStorage.setItem('title-decoded', '1');
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={resolved ? 'font-sans' : 'font-mono'}>
      {display}
    </span>
  );
}
```

---

## 2. Page Transitions

### 2A. Terminal Clear (Recommended)

**Description:** When navigating between pages, the outgoing content fades to black with a slight vertical compression (as though the content is being "cleared" from a CRT). The incoming content renders line-by-line from top with a very fast stagger (not a full typewriter -- more like a terminal dumping output). Total transition time: 250-350ms.

**Visual detail:**
- Exit: opacity 1 -> 0, scaleY 1 -> 0.98, 150ms ease-in
- Brief black gap: 50ms (the "clear")
- Enter: content appears top-down, each major block (header, paragraphs, sidebar) staggers by 30ms
- Enter opacity: 0 -> 1 per block, 120ms ease-out
- No horizontal movement. Vertical only. Clean.

**Complexity:** 3/5 (requires View Transitions API or Framer Motion with layout animations)
**Subtlety:** 3/5
**Annoyance risk:** Low if fast. MUST stay under 400ms total. Users should never feel "waiting" for an animation.
**Recommendation:** Always-on, with `prefers-reduced-motion` check that falls back to instant swap

**Implementation approach:**
Next.js View Transitions API (experimental in Next 15, stable by Next 16) is the cleanest path. Alternatively, a `<TransitionProvider>` wrapping the main content area with Framer Motion `AnimatePresence`.

```tsx
// Using Next.js View Transitions (preferred)
// In globals.css:
@view-transition {
  navigation: auto;
}

::view-transition-old(main-content) {
  animation: terminal-clear-out 150ms ease-in forwards;
}

::view-transition-new(main-content) {
  animation: terminal-clear-in 200ms ease-out 50ms both;
}

@keyframes terminal-clear-out {
  to {
    opacity: 0;
    transform: scaleY(0.98);
    transform-origin: top;
  }
}

@keyframes terminal-clear-in {
  from {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}
```

### 2B. Glitch Transition (Alternative -- Special Pages Only)

**Description:** A brief RGB channel-split and horizontal displacement on transition. The outgoing page "tears" horizontally -- red channel shifts left 2px, blue shifts right 2px -- for 100ms, then cuts to black, then the new page renders cleanly.

**Visual detail:**
- Duration: 200ms total
- RGB split: red -2px, blue +2px horizontal offset via `text-shadow` or SVG filter
- Horizontal tear: 2-3 thin horizontal bars of the page shift 4-8px left or right
- Cut to new content: no stagger, instant render

**Complexity:** 4/5
**Subtlety:** 4/5 (very noticeable)
**Annoyance risk:** Medium if overused. Should NOT be the default transition.
**Recommendation:** Opt-in. Only on specific pages (e.g., navigating to the "About" page, or triggered by a special interaction). Could also fire randomly 1-in-20 times for an unsettling effect.

---

## 3. Content Reveal on Scroll

### 3A. Redaction Lift (Recommended)

**Description:** As the user scrolls, upcoming paragraphs appear with a "redaction" effect: the text is initially visible but obscured by a solid overlay bar (like a censorship redaction mark) that slides away left-to-right, revealing the text beneath. The overlay is a thin `zinc-700` bar that matches the text line height.

This directly references the blog's theme -- information being declassified, redactions being lifted, the reader gaining access to what was hidden.

**Visual detail:**
- Each paragraph has an `::before` pseudo-element: full-width, line-height tall, `bg-zinc-700 dark:bg-zinc-600`
- On intersection (IntersectionObserver, threshold 0.15), the pseudo-element transitions `transform: scaleX(1)` to `scaleX(0)` with `transform-origin: right`, 400ms ease-out
- Text beneath is always in the DOM (good for SEO/accessibility), just visually obscured
- Stagger: each paragraph in a group delays by 80ms
- Only fires once per element (no re-animation on scroll back up)

**Complexity:** 3/5
**Subtlety:** 3/5
**Annoyance risk:** Medium on long articles if every paragraph does it. Should be limited to first 3-4 paragraphs per section, or only on first visit.
**Recommendation:** Always-on for post listing pages and homepage. On article pages, only apply to the first section (summary/intro). Body paragraphs in long-form reading should appear instantly.

**Implementation approach:**
```tsx
'use client';
import { useRef, useEffect } from 'react';

export function RedactedReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="redacted-reveal">
      {children}
    </div>
  );
}
```

```css
.redacted-reveal {
  position: relative;
  overflow: hidden;
}

.redacted-reveal::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--foreground);
  transform: scaleX(1);
  transform-origin: left;
  transition: transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
  pointer-events: none;
}

.redacted-reveal.revealed::before {
  transform: scaleX(0);
  transform-origin: right;
}
```

### 3B. Line-by-Line Fade (Alternative)

**Description:** Content fades in line-by-line as it enters the viewport. Each line (not paragraph -- actual rendered lines) fades from `opacity: 0` to `opacity: 1` with a 20ms stagger between lines. No vertical movement. Text simply appears as though being printed to screen.

**Visual detail:**
- Opacity: 0 -> 1, 200ms ease-out per line
- Stagger: 20ms between lines
- No transform (no slide up/down)
- Uses CSS `background-clip: text` trick or a reveal mask

**Complexity:** 4/5 (line-level animation is technically challenging without splitting text nodes)
**Subtlety:** 2/5
**Annoyance risk:** Low if fast enough. Could feel slow on long content.
**Recommendation:** Consider for special pages (homepage hero, about page) rather than article body.

---

## 4. Cards and Post Listings

### 4A. Border Trace on Hover

**Description:** When hovering over a post card, the border animates as a single line tracing around the perimeter of the card -- starting from the top-left corner and completing the full rectangle in 400ms. The line is brighter than the default border (`zinc-400` in dark mode). Once complete, the border stays lit until mouse leaves, at which point it fades uniformly over 200ms.

**Visual detail:**
- Default border: `zinc-700` (dark mode)
- Animated border: `zinc-400` (dark mode), 1px
- Trace direction: top-left -> top-right -> bottom-right -> bottom-left -> top-left
- Duration: 400ms total, linear
- On mouse leave: border fades to default, 200ms ease-out
- Implementation: `conic-gradient` on a pseudo-element, animated via custom property

**Complexity:** 4/5 (conic-gradient animation with `@property` registration)
**Subtlety:** 3/5
**Annoyance risk:** Low. Satisfying and purposeful.
**Recommendation:** Always-on in dark mode. In light mode, fall back to standard border color change.

**Implementation approach:**
```css
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.card-trace {
  position: relative;
  border: 1px solid transparent;
  background-clip: padding-box;
}

.card-trace::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--border-angle),
    transparent 0%,
    #a1a1aa 10%,   /* zinc-400 */
    transparent 20%,
    transparent 100%
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 200ms ease-out;
  --border-angle: 0deg;
}

.card-trace:hover::before {
  opacity: 1;
  animation: border-trace 400ms linear forwards;
}

@keyframes border-trace {
  to {
    --border-angle: 360deg;
  }
}

/* After trace completes, show solid border */
.card-trace:hover {
  border-color: #a1a1aa; /* zinc-400 */
  transition: border-color 0ms 400ms; /* delay until trace completes */
}
```

### 4B. Scanline Sweep on Hover

**Description:** On card hover, a single horizontal scanline (1px, semi-transparent white) sweeps from top to bottom of the card over 300ms. This is purely decorative -- a CRT monitor reference.

**Visual detail:**
- Line: 1px height, `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.12)` gradient
- Sweep: translateY from -100% to 100% of card height, 300ms ease-in-out
- Fires once per hover (does not loop)

**Complexity:** 2/5
**Subtlety:** 1/5 (barely visible)
**Annoyance risk:** None
**Recommendation:** Always-on

### 4C. Monospace Metadata Shift

**Description:** The date and tag metadata on post cards transitions from proportional to monospace font on card hover, matching the nav link behavior. This creates a subtle "the system is reading this card" feel.

**Visual detail:**
- Font transition: sans -> mono, 120ms ease-out
- Only affects date string and tags, not title or summary
- Slight letter-spacing adjustment to prevent layout shift: `letter-spacing: -0.02em` on mono

**Complexity:** 1/5
**Subtlety:** 2/5
**Annoyance risk:** None
**Recommendation:** Always-on

---

## 5. Loading States

### 5A. Blinking Cursor with Status Text

**Description:** While content loads, display a blinking block cursor followed by cycling status text in monospace. The text cycles through contextually appropriate messages:

```
> Retrieving signal...
> Decoding transmission...
> Verifying authenticity...
> Rendering cleartext...
```

Each message displays for 800ms before cycling. The cursor blinks at the standard 530ms rate.

**Visual detail:**
- Font: monospace, `text-sm`
- Color: `zinc-500`
- Cursor: block cursor (filled rectangle, not line), same color as text
- Position: centered in the loading area, vertically and horizontally
- Messages cycle with a crossfade (100ms overlap)

**Complexity:** 2/5
**Subtlety:** 3/5
**Annoyance risk:** Low if loading is fast. Could feel gimmicky if loading takes more than 3 seconds. Add a fallback: after 3 seconds, switch to a simple progress indicator.
**Recommendation:** Always-on for page-level loading. For component-level loading (lazy-loaded sections), use a simpler single-line cursor.

### 5B. Skeleton with Noise Texture

**Description:** Skeleton loading placeholders use a subtle animated noise texture instead of the typical shimmer effect. The noise pattern references CRT static / signal interference.

**Visual detail:**
- Base: `zinc-800` (dark mode)
- Noise: CSS `background-image` using a tiny (4x4) repeating noise pattern at 5% opacity
- Animation: the noise pattern shifts position by 1px every 100ms, creating subtle "static"
- Shape: matches the content it replaces (text lines = thin rectangles, images = full rectangles)

**Complexity:** 2/5
**Subtlety:** 1/5 (very subtle)
**Annoyance risk:** None
**Recommendation:** Always-on, replaces standard skeleton shimmer

---

## 6. Cursor Design

### 6A. Crosshair Cursor on Interactive Elements (Recommended)

**Description:** Interactive elements (cards, buttons, links) trigger a custom cursor: a small crosshair (`+` shape) rendered in `zinc-400`. The crosshair is 16x16px with 1px lines. Default cursor remains for body text to avoid impeding readability.

**Visual detail:**
- Shape: `+` crosshair, 16x16px, 1px stroke
- Color: `zinc-400` (dark), `zinc-600` (light)
- Transition: default cursor smoothly cross-fades to crosshair (not possible natively -- use JS cursor replacement for smooth transition, or accept the native swap)
- On text content: standard text cursor (I-beam)
- On body/background: standard arrow

**Complexity:** 2/5
**Subtlety:** 3/5
**Annoyance risk:** Low. Only changes on interactive elements, standard cursors elsewhere.
**Recommendation:** Always-on in dark mode. Standard cursors in light mode.

**Implementation:**
```css
/* Custom cursor SVG as data URI */
.interactive-cursor {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cline x1='8' y1='0' x2='8' y2='16' stroke='%23a1a1aa' stroke-width='1'/%3E%3Cline x1='0' y1='8' x2='16' y2='8' stroke='%23a1a1aa' stroke-width='1'/%3E%3C/svg%3E") 8 8, pointer;
}
```

### 6B. Cursor Trail (Rejected)

**Description:** A subtle phosphor trail behind the cursor, like a CRT afterglow.

**Complexity:** 3/5
**Subtlety:** 4/5
**Annoyance risk:** HIGH. Cursor trails are universally associated with early-2000s novelty. Even a subtle one risks cheapening the aesthetic. Performance concerns on lower-end devices.
**Recommendation:** Do not implement. The crosshair is sufficient.

---

## 7. Easter Eggs and Ambient Details

### 7A. CRT Scanline Overlay

**Description:** A full-page overlay of barely-visible horizontal lines, simulating CRT scanlines. The lines are 1px `rgba(0,0,0,0.03)` with 2px spacing. In dark mode, use `rgba(255,255,255,0.015)`. This is essentially invisible unless you look closely, but adds a tactile "screen" quality.

**Visual detail:**
- Pattern: 1px line, 2px gap, repeating
- Opacity: 1.5-3% (barely perceptible)
- Fixed position: does not scroll with content
- Pointer-events: none (does not interfere with interaction)
- Covers entire viewport

**Complexity:** 1/5
**Subtlety:** 1/5 (nearly invisible -- that is the point)
**Annoyance risk:** None if opacity stays below 3%. Above that, it degrades text readability.
**Recommendation:** Always-on in dark mode only. Disabled in light mode.

**Implementation:**
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.015) 2px,
    rgba(255, 255, 255, 0.015) 3px
  );
}

/* Only in dark mode */
:root:not(.dark) body::after {
  display: none;
}
```

### 7B. Intermittent Text Glitch

**Description:** Approximately once every 45-90 seconds, a random word in the visible viewport briefly "glitches": the text scrambles to random characters for 80ms, then resolves back. This happens to exactly one word at a time, and only in the body text area (never in navigation or headings).

The effect references the idea that "the signal is not perfectly clean" -- the reader has tuned in to an underground transmission, and occasionally the interference shows.

**Visual detail:**
- Frequency: random interval between 45-90 seconds
- Target: one random visible word in article body text
- Effect: character scramble (same charset as site title decode), 80ms duration
- Recovery: instant snap back to correct text
- Maximum 1 glitch visible at any time
- Never targets the same word twice in a session

**Complexity:** 3/5
**Subtlety:** 2/5 (if you catch it, it is striking; most people will miss it)
**Annoyance risk:** Medium. Could be confusing for readers who think they misread something. MUST be skipped for users with `prefers-reduced-motion`.
**Recommendation:** Opt-in via settings toggle labeled "Signal interference" or similar. Default: off.

### 7C. Timestamp Flicker

**Description:** Post dates and timestamps occasionally flicker -- the opacity drops to 0.3 for one frame (16ms) and returns. This happens 2-3 times when a timestamp first enters the viewport, then stops. The effect suggests "temporal instability" -- dates are uncertain, history is mutable.

**Visual detail:**
- Trigger: IntersectionObserver on timestamp elements
- Effect: 2-3 rapid opacity flickers (1 -> 0.3 -> 1), each 16ms
- Total duration: ~100ms
- Fires once per element per page load

**Complexity:** 2/5
**Subtlety:** 1/5 (very easy to miss)
**Annoyance risk:** None
**Recommendation:** Always-on

### 7D. Hidden Message in Source

**Description:** An ASCII art comment block in the HTML source (visible via View Source or DevTools) containing a thematic message. This costs nothing to implement and rewards the curious.

```html
<!--
  ================================================================

       You looked behind the curtain.
       Most people never do.

       "The goal of propaganda is not to inform
        but to mobilize." -- Jacques Ellul

  ================================================================
-->
```

**Complexity:** 1/5
**Subtlety:** 1/5 (invisible unless you view source)
**Annoyance risk:** None
**Recommendation:** Always-on

### 7E. Konami Code Activation

**Description:** Entering the Konami code (up up down down left right left right B A) triggers a 3-second "full Matrix" mode: the entire page renders in green-on-black monospace, scanlines intensify to 8% opacity, and falling character rain appears in the background. After 3 seconds, it fades back to normal.

**Complexity:** 3/5
**Subtlety:** 5/5 (very prominent when triggered)
**Annoyance risk:** None (requires deliberate activation)
**Recommendation:** Always-on (hidden easter egg)

---

## 8. Sound Design

### 8A. Ambient Hum (Strongly Considered, Then Rejected for Default)

A low, barely-audible electrical hum (like CRT tube hum) playing at -40dB. While thematically perfect, any auto-playing audio violates user trust. Browsers block it anyway.

**Recommendation:** Do not implement as ambient. See 8C for an alternative.

### 8B. Navigation Click Sound

**Description:** A subtle mechanical key-click sound plays when clicking navigation links. The sound is a short (30-50ms) sample of a mechanical keyboard switch -- not a full key press, just the crisp click of the actuation point.

**Visual detail (audio):**
- Duration: 30-50ms
- Volume: -20dB (quiet but audible with speakers/headphones)
- Character: dry, mechanical, no reverb
- Variation: 3 slightly different samples that rotate to avoid repetitiveness

**Complexity:** 2/5
**Subtlety:** 3/5
**Annoyance risk:** VERY HIGH if forced. Many users browse in shared spaces, have headphones playing other audio, or simply find UI sounds irritating.
**Recommendation:** Opt-in only. Hidden behind a setting. Default: silent.

### 8C. Sound Toggle / "Transmission Audio"

**Description:** A small speaker icon in the footer or settings area. When activated, it enables a package of subtle sounds:

1. Navigation clicks (as described in 8B)
2. A barely-audible low hum (the "carrier signal")
3. A soft static burst on page transitions (50ms, -30dB)
4. A faint "bleep" when hovering over cards (sine wave, 800Hz, 20ms, -35dB)

All sounds use the Web Audio API for precise timing and low latency. Total package is under 50KB of compressed audio data.

**Complexity:** 4/5
**Subtlety:** Varies by component (1-3)
**Annoyance risk:** None (entirely opt-in)
**Recommendation:** Opt-in. The toggle should be styled as a terminal command: `> AUDIO: OFF` that switches to `> AUDIO: ON` with a brief static burst.

---

## 9. Accessibility and Performance Constraints

### Mandatory Requirements

Every animation and effect described in this document MUST:

1. **Respect `prefers-reduced-motion`.** When this media query matches, all animations are disabled. Content appears instantly. No exceptions.

2. **Not block or delay content rendering.** Animations are decorative overlays on already-rendered content. A user with slow JavaScript should see the page immediately, without animations. Progressive enhancement.

3. **Run at 60fps or not at all.** Any animation that drops below 60fps on a mid-range 2023 laptop must be simplified or removed. Only `transform` and `opacity` properties should be animated. No animating `width`, `height`, `margin`, `padding`, `color` (use opacity cross-fade instead).

4. **Not interfere with screen readers.** Scrambled text (title decode, intermittent glitch) must never change the accessible text. Use `aria-label` on elements with visual-only text effects.

5. **Keep total JavaScript payload for animations under 8KB gzipped.** No heavy animation libraries for what CSS can handle. Framer Motion is acceptable only if already in the bundle for page transitions.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Remove scanline overlay */
  body::after {
    display: none !important;
  }
}
```

### Performance Budget

| Category | Budget |
|----------|--------|
| Animation JS | < 8KB gzipped |
| CSS for animations | < 2KB gzipped |
| Audio assets (opt-in) | < 50KB total |
| Render-blocking animations | 0 (none) |
| Maximum simultaneous animations | 3 on screen |
| Maximum animation duration | 600ms (page transitions excepted) |

---

## 10. Implementation Priority

Ordered by impact-to-effort ratio. Phase 3 (aesthetic layer) implementation order:

### Tier 1: Ship First (Low effort, high atmosphere)

| # | Effect | Effort | Files to modify |
|---|--------|--------|-----------------|
| 1 | 7D. Hidden source comment | 1/5 | `layout.tsx` |
| 2 | 7A. CRT scanline overlay | 1/5 | `globals.css` |
| 3 | 1B. Command prefix on active route | 1/5 | `layout.tsx` (nav) |
| 4 | 4C. Monospace metadata shift | 1/5 | `PostCard.tsx` |
| 5 | 1A. Terminal cursor hover on nav | 2/5 | `globals.css`, nav links |
| 6 | 6A. Crosshair cursor | 2/5 | `globals.css` |

### Tier 2: Ship Second (Medium effort, strong effect)

| # | Effect | Effort | Files to modify |
|---|--------|--------|-----------------|
| 7 | 5A. Blinking cursor loading state | 2/5 | New: `LoadingTerminal.tsx` |
| 8 | 4B. Scanline sweep on card hover | 2/5 | `Card.tsx`, `PostCard.tsx` |
| 9 | 7C. Timestamp flicker | 2/5 | `PostCard.tsx` or new wrapper |
| 10 | 3A. Redaction lift scroll reveal | 3/5 | New: `RedactedReveal.tsx` |
| 11 | 1C. Site title decode | 3/5 | New: `DecodingTitle.tsx` |

### Tier 3: Ship Third (Higher effort, polish)

| # | Effect | Effort | Files to modify |
|---|--------|--------|-----------------|
| 12 | 2A. Terminal clear page transition | 3/5 | `globals.css`, layout config |
| 13 | 4A. Border trace on card hover | 4/5 | `Card.tsx`, `globals.css` |
| 14 | 5B. Skeleton noise texture | 2/5 | New: `SkeletonNoise.tsx` |
| 15 | 7E. Konami code easter egg | 3/5 | New: `KonamiCode.tsx` |

### Tier 4: Opt-in Features (Ship when ready)

| # | Effect | Effort | Files to modify |
|---|--------|--------|-----------------|
| 16 | 7B. Intermittent text glitch | 3/5 | New: `SignalInterference.tsx` |
| 17 | 8C. Sound toggle / transmission audio | 4/5 | New: `AudioEngine.tsx`, UI toggle |

---

## 11. Summary of Recommendations by Category

| Effect | Status | Default | Mode |
|--------|--------|---------|------|
| Terminal cursor nav hover | Ship | Always-on | Both modes |
| Command prefix active route | Ship | Always-on | Both modes |
| Site title decode | Ship | Always-on | Dark only |
| Terminal clear transition | Ship | Always-on | Both modes |
| Glitch transition | Maybe | Special pages | Dark only |
| Redaction lift scroll | Ship | Always-on (limited) | Both modes |
| Line-by-line fade | Maybe | Special pages | Both modes |
| Border trace cards | Ship | Always-on | Dark only |
| Scanline sweep cards | Ship | Always-on | Both modes |
| Monospace metadata shift | Ship | Always-on | Both modes |
| Blinking cursor loading | Ship | Always-on | Both modes |
| Skeleton noise | Ship | Always-on | Both modes |
| Crosshair cursor | Ship | Always-on | Dark only |
| Cursor trail | Rejected | N/A | N/A |
| CRT scanline overlay | Ship | Always-on | Dark only |
| Intermittent text glitch | Ship | Opt-in | Dark only |
| Timestamp flicker | Ship | Always-on | Both modes |
| Hidden source message | Ship | Always-on | Both modes |
| Konami code | Ship | Always-on (hidden) | Both modes |
| Navigation sound | Ship | Opt-in | Both modes |
| Ambient hum | Rejected | N/A | N/A |
| Sound toggle package | Ship | Opt-in | Both modes |

---

## 12. Thematic Coherence

Every effect maps back to the blog's subject matter:

| Effect | Thematic Reference |
|--------|--------------------|
| Scanlines | You are reading on a monitor. This is mediated reality. |
| Redaction lift | Classified information being declassified for you. |
| Text decode/scramble | The message was encoded. You have the cipher. |
| Terminal cursor | You are an operator, not a consumer. |
| Timestamp flicker | History is unstable. Dates are narratives. |
| Monospace shift | The system is inspecting itself. |
| Crosshair cursor | Precision reading. Targeted analysis. |
| Border trace | The system is scanning the content. |
| Signal interference | The transmission is not sanitized. |
| Command prefix | You are navigating with commands, not clicking buttons. |
| Hidden source message | The curious are rewarded. Most never look. |
| Konami code | A deeper layer exists for those who know the sequence. |

---

*This document is a concept reference for Phase 3 implementation. Nothing here should be built until the content pipeline (Phase 2) is complete and real articles exist to test against.*
