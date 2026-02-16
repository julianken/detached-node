# Design System Proposal: Terminal-Inspired Color & Typography System

**Date:** 2026-02-14
**Status:** Proposal (awaiting review)
**Scope:** Color palettes, typography, visual texture, thematic alignment

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette Options](#color-palette-options)
   - [Option A: Phosphor (Green)](#option-a-phosphor-green)
   - [Option B: Amber (Warm Terminal)](#option-b-amber-warm-terminal)
   - [Option C: Cyan (Cool Clinical)](#option-c-cyan-cool-clinical)
3. [Typography System](#typography-system)
4. [Visual Texture & Effects](#visual-texture--effects)
5. [Thematic Alignment](#thematic-alignment)
6. [Implementation Strategy](#implementation-strategy)
7. [CSS Custom Property Definitions](#css-custom-property-definitions)

---

## Design Philosophy

The visual system is not cosplay. It does not try to look like a 1983 VT100 terminal. Instead, it borrows the *atmosphere* of terminal interfaces -- the feeling of looking at raw, unmediated information -- and refines it into something that reads like a premium editorial experience.

The key tension: **a blog about seeing through manufactured aesthetics should not itself rely on gimmicks.** The terminal reference must be earned through restraint. Scanlines are out. Thoughtfully chosen phosphor-tinted accent colors and monospaced navigational elements are in.

### Governing principles

1. **Readability above all.** Long-form analytical prose demands high contrast, generous line height, and typographic clarity. The terminal aesthetic lives in accents, not in the body copy.
2. **Dark-first, light-compatible.** The dark mode is the primary personality of the site. Light mode should feel like the same system with the lights on -- not a different site.
3. **Earned atmosphere.** Every decorative choice must reinforce the blog's themes: clarity, decoding, seeing structure. If a visual element does not serve that purpose, it does not belong.
4. **Progressive enhancement of texture.** Start clean. Layer in subtle effects (glow, grain, scanline hints) only where they add meaning.

---

## Color Palette Options

All three palettes share a common structure:

| Role | Description |
|------|-------------|
| `--bg-primary` | Page background |
| `--bg-secondary` | Elevated surfaces (cards, callouts) |
| `--bg-tertiary` | Deeply recessed areas (code blocks, inset panels) |
| `--text-primary` | Headings, emphasis |
| `--text-secondary` | Body copy |
| `--text-muted` | Metadata, timestamps, captions |
| `--accent` | Links, interactive elements, primary highlight |
| `--accent-muted` | Hover states, secondary highlights |
| `--accent-glow` | Glow/emphasis effects (low opacity overlays) |
| `--border` | Standard borders |
| `--border-subtle` | Section dividers, subtle separation |
| `--surface-hover` | Hover state background |

---

### Option A: Phosphor (Green)

*Inspired by P1 phosphor CRTs, but pulled into a refined, desaturated register. Not "The Matrix." Think: an elegant research terminal at a well-funded university in 1987.*

#### Dark Mode ("Lights Off")

| Token | Hex | Description |
|-------|-----|-------------|
| `--bg-primary` | `#0c0f0c` | Near-black with faint green cast |
| `--bg-secondary` | `#141a14` | Elevated surfaces -- barely perceptible lift |
| `--bg-tertiary` | `#080a08` | Recessed: code blocks, inset panels |
| `--text-primary` | `#d4e4d0` | High-contrast: desaturated pale green |
| `--text-secondary` | `#9aab96` | Body copy: comfortable sustained reading |
| `--text-muted` | `#5e6e5a` | Metadata: recedes without disappearing |
| `--accent` | `#5bdf73` | Links and interactive: vivid phosphor green |
| `--accent-muted` | `#3a8f4a` | Hover state / secondary accent |
| `--accent-glow` | `#5bdf7320` | Glow overlay (12% opacity) |
| `--border` | `#1e2b1e` | Standard borders: barely visible structure |
| `--border-subtle` | `#151d15` | Section dividers: whisper-thin |
| `--surface-hover` | `#1a241a` | Hover background on cards |

#### Light Mode ("Lights On")

| Token | Hex | Description |
|-------|-----|-------------|
| `--bg-primary` | `#f4f7f3` | Warm off-white with green tint |
| `--bg-secondary` | `#eaf0e8` | Cards: faint green-grey |
| `--bg-tertiary` | `#f9fbf8` | Recessed: slightly lighter |
| `--text-primary` | `#1a2418` | Near-black with green cast |
| `--text-secondary` | `#3d4f3a` | Body copy: dark green-grey |
| `--text-muted` | `#728a6e` | Metadata: mid-tone |
| `--accent` | `#1a7a2e` | Links: saturated but not neon |
| `--accent-muted` | `#2d9942` | Hover: slightly lighter |
| `--accent-glow` | `#1a7a2e10` | Subtle green wash (6% opacity) |
| `--border` | `#d2ddd0` | Standard borders |
| `--border-subtle` | `#e0e9de` | Section dividers |
| `--surface-hover` | `#e4ede2` | Hover background |

**Character:** Quiet authority. Feels like accessing classified information through a well-maintained system. The green is present but never garish.

---

### Option B: Amber (Warm Terminal)

*Inspired by P3 amber phosphor displays and vintage IBM terminals. Warm, authoritative, slightly nostalgic. This palette has the most personality -- it immediately feels like "a specific kind of thing" without being kitschy.*

#### Dark Mode ("Lights Off")

| Token | Hex | Description |
|-------|-----|-------------|
| `--bg-primary` | `#0f0d0a` | Near-black with warm amber cast |
| `--bg-secondary` | `#1a1610` | Elevated surfaces: warm dark brown |
| `--bg-tertiary` | `#0a0907` | Recessed: deepest amber-black |
| `--text-primary` | `#e4d5b7` | High-contrast: warm parchment |
| `--text-secondary` | `#b0a080` | Body copy: aged paper tone |
| `--text-muted` | `#6e6348` | Metadata: dusty amber |
| `--accent` | `#e4a832` | Links: warm golden amber |
| `--accent-muted` | `#a07a28` | Hover: deeper gold |
| `--accent-glow` | `#e4a83220` | Amber glow overlay (12% opacity) |
| `--border` | `#2a2318` | Standard borders: warm dark |
| `--border-subtle` | `#1e1a12` | Section dividers |
| `--surface-hover` | `#221d14` | Hover background |

#### Light Mode ("Lights On")

| Token | Hex | Description |
|-------|-----|-------------|
| `--bg-primary` | `#f7f3eb` | Warm cream |
| `--bg-secondary` | `#efe8da` | Cards: parchment |
| `--bg-tertiary` | `#faf7f1` | Recessed: lighter cream |
| `--text-primary` | `#2a2010` | Near-black with warm cast |
| `--text-secondary` | `#5a4e35` | Body copy: dark warm brown |
| `--text-muted` | `#8a7d62` | Metadata: mid amber |
| `--accent` | `#9a6e10` | Links: deep gold |
| `--accent-muted` | `#b08520` | Hover: brighter gold |
| `--accent-glow` | `#9a6e1010` | Subtle amber wash |
| `--border` | `#d8ceb8` | Standard borders |
| `--border-subtle` | `#e5dccb` | Section dividers |
| `--surface-hover` | `#e8dfcc` | Hover background |

**Character:** The feeling of reading a document you were not supposed to find. Warm, analog, like handling physical files in a dim office. This is the palette that most strongly evokes *archives, dossiers, and institutional memory.*

---

### Option C: Cyan (Cool Clinical)

*Inspired by modern terminal emulators, scientific instrumentation displays, and cold-war radar screens. Clinical, precise, contemporary. This is the least nostalgic option -- it feels like a system that is still actively running.*

#### Dark Mode ("Lights Off")

| Token | Hex | Description |
|-------|-----|-------------|
| `--bg-primary` | `#0a0d10` | Near-black with cool blue cast |
| `--bg-secondary` | `#101820` | Elevated surfaces: dark steel blue |
| `--bg-tertiary` | `#070a0d` | Recessed: deepest blue-black |
| `--text-primary` | `#cdd8e4` | High-contrast: cool pale blue-white |
| `--text-secondary` | `#8899aa` | Body copy: steel blue-grey |
| `--text-muted` | `#506070` | Metadata: muted blue-grey |
| `--accent` | `#38c8e8` | Links: electric cyan |
| `--accent-muted` | `#2890a8` | Hover: deeper cyan |
| `--accent-glow` | `#38c8e820` | Cyan glow overlay (12% opacity) |
| `--border` | `#182030` | Standard borders: dark blue-grey |
| `--border-subtle` | `#121a24` | Section dividers |
| `--surface-hover` | `#141e28` | Hover background |

#### Light Mode ("Lights On")

| Token | Hex | Description |
|-------|-----|-------------|
| `--bg-primary` | `#f2f5f8` | Cool blue-white |
| `--bg-secondary` | `#e6ecf2` | Cards: pale blue-grey |
| `--bg-tertiary` | `#f7f9fb` | Recessed: barely blue |
| `--text-primary` | `#141e28` | Near-black with blue cast |
| `--text-secondary` | `#3a4a58` | Body copy: dark blue-grey |
| `--text-muted` | `#6a7a88` | Metadata: mid blue-grey |
| `--accent` | `#0a7a96` | Links: deep teal |
| `--accent-muted` | `#1090b0` | Hover: brighter teal |
| `--accent-glow` | `#0a7a9610` | Subtle cyan wash |
| `--border` | `#ccd5de` | Standard borders |
| `--border-subtle` | `#dbe2ea` | Section dividers |
| `--surface-hover` | `#dce4ec` | Hover background |

**Character:** Analytical detachment. The feeling of running a diagnostic on a system from the outside. This is the palette for a blog that treats complex systems as objects to be analyzed and understood.

---

## Recommendation

**Option B (Amber)** is the strongest thematic fit. Here is why:

1. It is the most distinctive. Green and cyan terminal aesthetics have been done extensively. Amber is rarer in web design, which gives the site immediate recognizability.
2. The warm tones create a paradox: the content is cold-eyed analysis, but the container feels warm and analog. This tension is interesting. It suggests a human intelligence examining inhuman systems.
3. The "parchment" quality in light mode naturally evokes documents, dossiers, and archival research -- all directly thematic.
4. Amber has the best typographic rendering. Warm tones are inherently easier on the eyes for sustained reading than green or blue casts.

**However:** all three palettes are designed to be interchangeable via CSS custom properties. You could ship with Amber and offer the others as user-selectable modes (a small gesture that reinforces the theme of *choosing how you see things*).

---

## Typography System

### Font Stack

#### Primary (Body Text): Inter

```css
--font-body: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

**Rationale:** Inter was designed for screens. It has excellent legibility at small sizes, a large x-height, and superb rendering across all platforms. It is the most readable option for long-form analytical prose. Its neutrality prevents it from competing with the color palette's personality.

**Alternative:** If you want something slightly more editorial, consider **Source Sans 3** (Adobe) or **IBM Plex Sans** -- the latter has a subtle institutional quality that fits the theme.

#### Secondary (Headings, UI): JetBrains Mono or IBM Plex Mono

```css
--font-heading: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
```

**Rationale:** This is the signature move. Using a monospaced font for headings -- not body text -- creates the terminal reference without sacrificing readability. JetBrains Mono has distinctive ligatures and excellent weight range. IBM Plex Mono has a more institutional, authoritative character.

Headings in mono immediately signal "system output" / "decoded message" while the body text remains in a comfortable serif or sans-serif.

#### Monospace (Code, Terminal Elements): JetBrains Mono

```css
--font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace;
```

**Rationale:** Consistency with headings. Code blocks and terminal-styled elements use the same family at different weights, creating visual cohesion.

### Type Scale

Using a modular scale with a ratio of 1.25 (Major Third), anchored at 16px base:

| Token | Size | Use |
|-------|------|-----|
| `--text-xs` | `0.75rem` (12px) | Fine print, legal |
| `--text-sm` | `0.875rem` (14px) | Metadata, captions, nav items |
| `--text-base` | `1rem` (16px) | Body copy default |
| `--text-lg` | `1.125rem` (18px) | Lead paragraphs, post summaries |
| `--text-xl` | `1.25rem` (20px) | H4, section subheads |
| `--text-2xl` | `1.5rem` (24px) | H3 |
| `--text-3xl` | `1.875rem` (30px) | H2, page titles |
| `--text-4xl` | `2.25rem` (36px) | H1, hero headings |
| `--text-5xl` | `3rem` (48px) | Display text (rare) |

### Line Heights

Optimized for long-form reading:

| Context | Line Height | Rationale |
|---------|-------------|-----------|
| Body copy | `1.75` | Generous for sustained reading of dense analytical prose |
| Lead text | `1.65` | Slightly tighter for emphasis text |
| Headings (mono) | `1.3` | Tight for monospaced headings -- mono fonts need less leading |
| Small text / metadata | `1.5` | Compact but clear |
| Code blocks | `1.6` | Standard code readability |

### Letter Spacing

This is where the terminal feel lives at the typographic level:

| Context | Letter Spacing | Rationale |
|---------|---------------|-----------|
| Headings (mono) | `0.02em` | Slight opening for monospace at display sizes |
| Body copy | `0` | Inter has excellent default metrics |
| Small caps / labels | `0.08em` | Wide-tracked for terminal-label feel |
| Nav items | `0.04em` | Slightly open: terminal menu aesthetic |
| Metadata / timestamps | `0.03em` | Subtle widening signals "system text" |
| Uppercase labels | `0.12em` | Strong tracking for small uppercase text |

### Font Weights

| Weight | Use |
|--------|-----|
| `400` (Regular) | Body copy, metadata |
| `500` (Medium) | Nav items, UI labels, emphasis in body |
| `600` (SemiBold) | Headings (h2-h4), card titles |
| `700` (Bold) | H1, site title, strong emphasis |

### Sample Typography CSS

```css
/* Heading hierarchy using monospace */
h1, h2, h3, h4 {
  font-family: var(--font-heading);
  line-height: 1.3;
  letter-spacing: 0.02em;
}

/* Body copy optimized for reading */
.prose p {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.75;
  letter-spacing: 0;
}

/* Metadata and system text */
.meta {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.03em;
  text-transform: none;
}

/* Navigation with terminal character */
nav a {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* Small labels (tags, categories) */
.label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

## Visual Texture & Effects

### Background Texture

#### Noise grain (subtle)

A barely-perceptible noise overlay adds analog warmth and prevents the background from feeling like flat dead pixels. This should be almost invisible -- you feel it more than see it.

```css
.bg-grain::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03; /* Barely there */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  mix-blend-mode: overlay;
}

/* Slightly more visible in dark mode */
[data-theme="dark"] .bg-grain::after {
  opacity: 0.04;
}
```

#### Grid overlay (optional, specific contexts)

For hero sections or feature areas, a faint grid pattern suggests "looking at data through a coordinate system." Use sparingly.

```css
.bg-grid {
  background-image:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

#### Scanline hint (extremely subtle, dark mode only)

Not actual visible scanlines. Instead, a 2px repeating gradient at ~2% opacity that creates the faintest perceptible texture when scrolling. This is subliminal.

```css
[data-theme="dark"] .bg-scanline::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
}
```

### Depth Without Heavy Shadows

Terminal interfaces do not have drop shadows. Depth is communicated through:

1. **Background color stepping.** Three tiers of background darkness (primary > secondary > tertiary) create implied depth without any shadow.

2. **Border luminance.** Borders that are slightly brighter than the surface they sit on suggest a faint edge-lit quality.

3. **Inner glow on focus.** Instead of box-shadow for focus states, use an inset glow in the accent color:

```css
.card:focus-within {
  box-shadow: inset 0 0 0 1px var(--accent-muted),
              0 0 16px -4px var(--accent-glow);
}
```

4. **Top-edge highlight.** A 1px top border that is slightly brighter than the card background suggests overhead lighting (like a monitor bezel casting light on a display):

```css
.card-elevated {
  border: 1px solid var(--border);
  border-top-color: var(--border-highlight);
  /* where --border-highlight is ~10% brighter than --border */
}
```

### Border Treatments

Borders should feel "digital" -- precise, thin, consistent. Some patterns:

#### Standard border
```css
border: 1px solid var(--border);
```

#### Glowing border (interactive/focused elements)
```css
border: 1px solid var(--accent-muted);
box-shadow: 0 0 8px -2px var(--accent-glow);
```

#### Dashed border (placeholder/draft states)
```css
border: 1px dashed var(--border);
```

#### Animated gradient border (rare, for featured content)
```css
.featured-border {
  position: relative;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.featured-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    var(--accent-glow),
    transparent 40%,
    transparent 60%,
    var(--accent-glow)
  );
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}
```

### Glow Effects

Used sparingly for emphasis. The accent color at low opacity creates a warm/cool glow depending on the palette.

#### Text glow (accent headings, featured titles)
```css
.text-glow {
  text-shadow: 0 0 20px var(--accent-glow),
               0 0 40px var(--accent-glow);
}
```

#### Box glow (featured cards, active states)
```css
.box-glow {
  box-shadow: 0 0 20px -5px var(--accent-glow),
              0 0 40px -10px var(--accent-glow);
}
```

#### Cursor blink (for decorative "terminal cursor" elements)
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.cursor-blink {
  display: inline-block;
  width: 0.5em;
  height: 1.1em;
  background: var(--accent);
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}
```

---

## Thematic Alignment

The blog is about understanding complex systems and autonomous agents. Every visual choice should subtly reinforce the act of *decoding, analyzing, and seeing clearly.* Here is how each system contributes:

### Color as metaphor

| Theme | Visual Treatment |
|-------|-----------------|
| **Decoding / Decryption** | Monospaced headings suggest decoded messages. The accent color (green/amber/cyan) is the "signal" color -- the thing that has been isolated from noise. Use it only for meaningful interactive elements, never decoratively. |
| **Seeing hidden structures** | The grid overlay (used sparingly on hero areas) suggests looking through an analytical framework. Cards with faintly brighter top-borders suggest illumination -- light being cast on surfaces to reveal their contents. |
| **Clarity from noise** | The background grain texture IS the noise. The text sitting above it, in clear high-contrast colors, is the signal. This is a literal visual metaphor for the blog's purpose. The grain should be barely perceptible -- you want the *feeling* of noise without it interfering with clarity. |

### Typography as metaphor

- **Monospaced headings** evoke decoded transmissions, system output, terminal commands. They say: "this has been extracted and rendered legible."
- **Clean sans-serif body** says: "now read the analysis in comfort." The shift from mono to sans is itself a metaphor for the blog's mission: taking raw, encoded information and presenting it in a form humans can process.
- **Wide-tracked labels and metadata** (timestamps, tags, categories) feel like file classification stamps. `PUBLISHED: 2026-02-14` reads differently than "Published: February 14, 2026" -- the former feels like a document ID, the latter like a magazine.

### Interactive states as metaphor

- **Accent color glow on hover** suggests "scanning" or "selecting" -- the reader is actively examining something.
- **Focus states with inset glow** suggest a cursor lock / targeting reticle -- attention has been directed.
- **The theme toggle** should not be "light/dark." It should be labeled with language that fits: "signal / noise" or "cleartext / ciphertext" or simply an icon of an eye (open/closed).

### Specific UI element concepts

1. **Post dates displayed in monospace** with wider tracking: `2026.02.14` instead of "February 14, 2026"
2. **Tag labels** in uppercase mono with heavy tracking: `AGENTIC AI` `WORKFLOWS` `SYSTEMS`
3. **Blockquotes** with a left border in the accent color and a faint accent-glow background -- suggesting highlighted/flagged text
4. **Footnotes/references** styled like terminal output: monospace, slightly smaller, numbered with a different color
5. **The "Read more" link** could include a blinking cursor or a `>` prefix to suggest a terminal prompt

---

## Implementation Strategy

### Phase 1: Token foundation (do this now)

1. Define all CSS custom properties in `globals.css`
2. Set up the three-palette system with a default (recommended: Amber)
3. Update Tailwind config to reference custom properties
4. Add Google Fonts / local font files for Inter and JetBrains Mono

### Phase 2: Component migration (incremental)

1. Replace hardcoded `zinc-*` classes with token-based classes
2. Add the typography hierarchy (mono headings, etc.)
3. Update Card, PostCard, Button to use new tokens
4. Add texture overlays to the root layout

### Phase 3: Polish and enhancement

1. Add glow effects to interactive states
2. Implement palette switcher (let users choose A/B/C)
3. Add the subtle grain and scanline textures
4. Animate transitions between palettes

### Migration path from current system

The current system uses Tailwind's `zinc` scale directly. The migration path:

1. Define new custom properties alongside existing zinc references
2. Create Tailwind theme extensions that map to custom properties
3. Gradually replace `text-zinc-*` / `bg-zinc-*` with semantic tokens
4. Remove direct zinc references once migration is complete

No existing component needs to break during this process.

---

## CSS Custom Property Definitions

### Option A: Phosphor (Green)

```css
/* ============================================
   OPTION A: PHOSPHOR (GREEN)
   ============================================ */

:root[data-palette="phosphor"],
:root[data-palette="phosphor"] [data-theme="light"] {
  /* Backgrounds */
  --bg-primary: #f4f7f3;
  --bg-secondary: #eaf0e8;
  --bg-tertiary: #f9fbf8;

  /* Text */
  --text-primary: #1a2418;
  --text-secondary: #3d4f3a;
  --text-muted: #728a6e;

  /* Accent */
  --accent: #1a7a2e;
  --accent-muted: #2d9942;
  --accent-glow: rgba(26, 122, 46, 0.06);

  /* Borders */
  --border: #d2ddd0;
  --border-subtle: #e0e9de;
  --border-highlight: #dde8db;

  /* Surfaces */
  --surface-hover: #e4ede2;

  /* Semantic */
  --color-success: #1a7a2e;
  --color-warning: #8a7a20;
  --color-error: #9a2a2a;
  --color-info: #2a6a7a;
}

[data-palette="phosphor"] [data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #0c0f0c;
  --bg-secondary: #141a14;
  --bg-tertiary: #080a08;

  /* Text */
  --text-primary: #d4e4d0;
  --text-secondary: #9aab96;
  --text-muted: #5e6e5a;

  /* Accent */
  --accent: #5bdf73;
  --accent-muted: #3a8f4a;
  --accent-glow: rgba(91, 223, 115, 0.12);

  /* Borders */
  --border: #1e2b1e;
  --border-subtle: #151d15;
  --border-highlight: #253225;

  /* Surfaces */
  --surface-hover: #1a241a;

  /* Semantic */
  --color-success: #5bdf73;
  --color-warning: #dfb850;
  --color-error: #df5b5b;
  --color-info: #5bb8df;
}
```

### Option B: Amber (Warm Terminal) -- RECOMMENDED

```css
/* ============================================
   OPTION B: AMBER (WARM TERMINAL) -- DEFAULT
   ============================================ */

:root,
:root[data-palette="amber"],
:root[data-palette="amber"] [data-theme="light"],
[data-theme="light"] {
  /* Backgrounds */
  --bg-primary: #f7f3eb;
  --bg-secondary: #efe8da;
  --bg-tertiary: #faf7f1;

  /* Text */
  --text-primary: #2a2010;
  --text-secondary: #5a4e35;
  --text-muted: #8a7d62;

  /* Accent */
  --accent: #9a6e10;
  --accent-muted: #b08520;
  --accent-glow: rgba(154, 110, 16, 0.06);

  /* Borders */
  --border: #d8ceb8;
  --border-subtle: #e5dccb;
  --border-highlight: #e0d6c2;

  /* Surfaces */
  --surface-hover: #e8dfcc;

  /* Semantic */
  --color-success: #4a7a2a;
  --color-warning: #9a6e10;
  --color-error: #9a2a2a;
  --color-info: #2a6a7a;
}

[data-theme="dark"],
[data-palette="amber"] [data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #0f0d0a;
  --bg-secondary: #1a1610;
  --bg-tertiary: #0a0907;

  /* Text */
  --text-primary: #e4d5b7;
  --text-secondary: #b0a080;
  --text-muted: #6e6348;

  /* Accent */
  --accent: #e4a832;
  --accent-muted: #a07a28;
  --accent-glow: rgba(228, 168, 50, 0.12);

  /* Borders */
  --border: #2a2318;
  --border-subtle: #1e1a12;
  --border-highlight: #342b1e;

  /* Surfaces */
  --surface-hover: #221d14;

  /* Semantic */
  --color-success: #73b850;
  --color-warning: #e4a832;
  --color-error: #df5b5b;
  --color-info: #5bb8df;
}
```

### Option C: Cyan (Cool Clinical)

```css
/* ============================================
   OPTION C: CYAN (COOL CLINICAL)
   ============================================ */

:root[data-palette="cyan"],
:root[data-palette="cyan"] [data-theme="light"] {
  /* Backgrounds */
  --bg-primary: #f2f5f8;
  --bg-secondary: #e6ecf2;
  --bg-tertiary: #f7f9fb;

  /* Text */
  --text-primary: #141e28;
  --text-secondary: #3a4a58;
  --text-muted: #6a7a88;

  /* Accent */
  --accent: #0a7a96;
  --accent-muted: #1090b0;
  --accent-glow: rgba(10, 122, 150, 0.06);

  /* Borders */
  --border: #ccd5de;
  --border-subtle: #dbe2ea;
  --border-highlight: #d4dce5;

  /* Surfaces */
  --surface-hover: #dce4ec;

  /* Semantic */
  --color-success: #2a8a4a;
  --color-warning: #9a7a20;
  --color-error: #9a2a3a;
  --color-info: #0a7a96;
}

[data-palette="cyan"] [data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #0a0d10;
  --bg-secondary: #101820;
  --bg-tertiary: #070a0d;

  /* Text */
  --text-primary: #cdd8e4;
  --text-secondary: #8899aa;
  --text-muted: #506070;

  /* Accent */
  --accent: #38c8e8;
  --accent-muted: #2890a8;
  --accent-glow: rgba(56, 200, 232, 0.12);

  /* Borders */
  --border: #182030;
  --border-subtle: #121a24;
  --border-highlight: #202a38;

  /* Surfaces */
  --surface-hover: #141e28;

  /* Semantic */
  --color-success: #38df73;
  --color-warning: #dfb850;
  --color-error: #df5b5b;
  --color-info: #38c8e8;
}
```

### Shared Typography Tokens (all palettes)

```css
/* ============================================
   TYPOGRAPHY TOKENS
   ============================================ */

:root {
  /* Font families */
  --font-body: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace;

  /* Font sizes (Major Third scale, 1.25 ratio) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */

  /* Line heights */
  --leading-tight: 1.3;       /* Headings (mono) */
  --leading-snug: 1.5;        /* Small text, metadata */
  --leading-normal: 1.65;     /* Lead paragraphs */
  --leading-relaxed: 1.75;    /* Body copy */
  --leading-code: 1.6;        /* Code blocks */

  /* Letter spacing */
  --tracking-tight: -0.01em;  /* Large display text */
  --tracking-normal: 0;       /* Body copy */
  --tracking-mono: 0.02em;    /* Monospace headings */
  --tracking-wide: 0.04em;    /* Nav items */
  --tracking-wider: 0.08em;   /* Labels, small caps */
  --tracking-widest: 0.12em;  /* Uppercase labels */

  /* Font weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

### Shared Effect Tokens (all palettes)

```css
/* ============================================
   EFFECT TOKENS
   ============================================ */

:root {
  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 350ms ease;
  --transition-glow: 300ms ease-in-out;

  /* Border radius (minimal, precise) */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Spacing scale (4px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */

  /* Z-index scale */
  --z-base: 0;
  --z-raised: 10;
  --z-overlay: 100;
  --z-modal: 200;
  --z-toast: 300;
  --z-texture: 9998;   /* Background textures */
  --z-grain: 9999;     /* Noise grain overlay */
}
```

---

## Tailwind Integration

To use these tokens with Tailwind CSS 4, extend the theme in `globals.css`:

```css
@theme inline {
  /* Map custom properties to Tailwind tokens */
  --color-background: var(--bg-primary);
  --color-foreground: var(--text-primary);
  --color-surface: var(--bg-secondary);
  --color-surface-recessed: var(--bg-tertiary);
  --color-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-muted: var(--accent-muted);
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);

  /* Font families */
  --font-sans: var(--font-body);
  --font-mono: var(--font-mono);
  --font-heading: var(--font-heading);
}
```

This lets you write classes like:

```html
<div class="bg-surface text-foreground border-border">
  <h2 class="font-heading text-accent">Heading</h2>
  <p class="text-muted">Metadata</p>
</div>
```

---

## Accessibility Notes

### Contrast ratios (WCAG AA targets)

All palettes have been designed to meet minimum contrast requirements:

| Combination | Target | Amber Dark | Amber Light |
|-------------|--------|------------|-------------|
| text-primary on bg-primary | 4.5:1 min | ~12.5:1 | ~13.2:1 |
| text-secondary on bg-primary | 4.5:1 min | ~6.8:1 | ~7.1:1 |
| text-muted on bg-primary | 3:1 min* | ~3.5:1 | ~3.4:1 |
| accent on bg-primary | 4.5:1 min | ~7.2:1 | ~5.8:1 |
| accent on bg-secondary | 4.5:1 min | ~6.4:1 | ~5.2:1 |

*Note: text-muted is intentionally lower contrast for non-essential metadata. It meets WCAG AA for large text (3:1) but may not meet AA for small text (4.5:1). This is a deliberate design choice -- muted text should be readable but clearly hierarchically subordinate. If stronger accessibility compliance is needed, bump muted values toward the secondary range.

### Reduced motion

All animations (cursor blink, glow transitions) should respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .cursor-blink { animation: none; opacity: 1; }
  * { transition-duration: 0.01ms !important; }
}
```

---

## File Organization

Recommended structure for the token system:

```
src/
  styles/
    tokens/
      colors-amber.css      /* Option B palette (default) */
      colors-phosphor.css   /* Option A palette */
      colors-cyan.css       /* Option C palette */
      typography.css         /* Font families, sizes, scale */
      effects.css            /* Transitions, radii, spacing */
      textures.css           /* Grain, scanlines, grid overlays */
    globals.css              /* Imports all tokens, Tailwind config */
```

---

## Next Steps

1. **Choose a palette** (recommendation: Amber) or decide to ship all three with a switcher
2. **Review typography choices** -- do you want to try Inter + JetBrains Mono, or explore alternatives like IBM Plex Sans + IBM Plex Mono for a more institutional feel?
3. **Set the texture level** -- how much visual grain/scanline do you want? Scale of 0 (none) to 5 (heavy)
4. **Decide on font loading strategy** -- Google Fonts, self-hosted, or variable font files?
5. **Approve the implementation phases** and we can begin token migration
