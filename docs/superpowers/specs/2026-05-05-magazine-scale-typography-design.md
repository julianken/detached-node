---
title: Magazine-scale typography and content margin
date: 2026-05-05
status: draft
---

# Magazine-scale typography and content margin

Scale the site's reading surface — frame card, prose column, type system, chrome — into a generous magazine layout, with all chrome and headings scaling proportionally and a fluid responsive scale that protects mobile readability.

## Goals

- The bordered site card grows from `max-w-5xl` (1024 px) to **1280 px** on desktop.
- The prose reading column grows from `max-w-3xl` (768 px) to **960 px**.
- Body type runs at **22 px on desktop**, fluidly scaling down to **19 px on phones** via `clamp()`.
- Chrome (nav, status bar, brand mark, card metadata) scales by ~+22% to match the body bump, so the site reads uniformly larger.
- Heading hierarchy keeps the existing `em`-based ratios (`h2 = 1.5em`, `h3 = 1.25em`). No modular-scale change.

## Non-goals

- Not changing the violet terminal palette.
- Not changing fonts (Crimson Pro body, JetBrains Mono headings/chrome).
- Not changing layout structure (`site-frame` > `<main>` > optional prose constraint).
- Not changing the CRT glow or view-transition glitch effects in this pass; they may need a follow-up tuning pass once headings and body land at new sizes.
- Not redesigning hub-card grids; existing components scale via tokens, not redesign.

## Design decisions (settled in brainstorm)

| Decision | Choice | Rationale |
|---|---|---|
| Direction | **C — Magazine scale** | Frame 1280, prose 960, body 22. The most committed of three options. |
| Chrome scaling | **C2 — Everything scales together** | Nav, brand, status bar, metadata bump ~+22%. Site reads uniformly larger, not just article-focused. |
| Responsive | **R2 — Fluid `clamp()`** | Body fluid 19 → 22 px across viewports. No breakpoint cliffs; mobile readability protected. |
| Heading ratios | **S1 — Conservative (current ratios kept)** | Headings inherit body via `em` (`h2 = 1.5em`, `h3 = 1.25em`). Reads tight and considered, not billboard-y. |

## Token system

All magnitudes are expressed as CSS custom properties in `globals.css`, exposed to Tailwind via the existing `@theme inline` block (no `tailwind.config.ts` changes needed — Tailwind 4 reads CSS theme directly).

### Width tokens

```css
:root {
  --width-frame: 1280px;
  --width-prose: 960px;
  --width-content: 1100px;  /* intermediate, for ADP slug rail layouts */
}

@theme inline {
  --max-width-frame: var(--width-frame);
  --max-width-prose-wide: var(--width-prose);
  --max-width-content-wide: var(--width-content);
}
```

Usage at call sites: `max-w-frame`, `max-w-prose-wide`, `max-w-content-wide`.

The renamed `prose-wide` / `content-wide` avoid collision with Tailwind's built-in `max-w-prose` (= 65ch).

### Type tokens (fluid)

Each tier defines `clamp(min, A·rem + B·vw, max)` such that the min hits at a 375 px viewport and the max hits at a 1280 px viewport. Values rounded to land within ~1 px of the targets.

```css
:root {
  /* Body — 19px @ 375vw → 22px @ 1280vw */
  --type-body: clamp(19px, 1.1rem + 0.34vw, 22px);

  /* Nav links — 14px → 17px */
  --type-nav: clamp(14px, 0.8rem + 0.34vw, 17px);

  /* Brand "d-n" mark — 18px → 22px */
  --type-brand: clamp(18px, 1rem + 0.5vw, 22px);

  /* Status bar / frame label / metadata — 11px → 13px */
  --type-meta: clamp(11px, 0.65rem + 0.22vw, 13px);

  /* Card titles (PostCard, PatternCard h3-equivalents) — 17px → 21px */
  --type-card-title: clamp(17px, 0.95rem + 0.45vw, 21px);

  /* Card summaries (one tier below body) — 15px → 18px */
  --type-card-summary: clamp(15px, 0.85rem + 0.34vw, 18px);

  /* Hub page h1 (PageHeader on /posts, /about, hub listings) — 30px → 36px.
     Stays visibly smaller than article h1 (44px) so hub titles read as
     wayfinding, not editorial. Article h1 inside .prose uses 2em
     inheritance instead — see below. */
  --type-page-h1: clamp(30px, 1.72rem + 0.66vw, 36px);
}

@theme inline {
  --font-size-body: var(--type-body);
  --font-size-nav: var(--type-nav);
  --font-size-brand: var(--type-brand);
  --font-size-meta: var(--type-meta);
  --font-size-card-title: var(--type-card-title);
  --font-size-card-summary: var(--type-card-summary);
  --font-size-page-h1: var(--type-page-h1);
}
```

Inside `.prose`, headings continue to use `em` and inherit from `--type-body` automatically. At the upper bound (body 22 px):

- `h1`: 2em → 44 px (set explicitly to avoid browser default drift)
- `h2`: 1.5em → 33 px (unchanged from existing rule)
- `h3`: 1.25em → 27.5 px (unchanged)
- `h4`: 1.125em → 24.75 px (set explicitly; today inherits 1em)

## Architecture and file impact

```
src/app/globals.css
  ├── new --width-* tokens
  ├── new --type-* tokens
  ├── extend @theme inline to expose them
  ├── .prose { font-size: var(--type-body); }     # was 1.125rem
  └── .prose h1 { font-size: 2em } added; .prose h4 { font-size: 1.125em } added

src/app/(frontend)/layout.tsx
  ├── site-frame: max-w-frame                      # was max-w-5xl
  ├── nav links: text-nav                          # was text-sm
  └── brand "d-n": text-brand                      # was text-lg

src/components/PageLayout.tsx
  ├── prose: max-w-prose-wide mx-auto              # was max-w-3xl mx-auto
  └── content: max-w-content-wide mx-auto          # was max-w-5xl mx-auto

src/components/PageHeader.tsx
  ├── h1: text-page-h1                             # was text-3xl
  └── subtitle paragraph: text-body                # was text-base

src/components/StatusBar.tsx
  └── status text: text-meta                       # was likely text-xs

src/components/PostCard.tsx
  ├── title: text-card-title                       # was text-lg/text-xl
  ├── summary: text-card-summary                   # was text-base
  └── date: text-meta                              # was text-sm

src/components/PatternCard.tsx
  └── (same mapping as PostCard)

src/components/agentic-patterns/HubHero.tsx
  ├── title (h1): text-page-h1
  └── subtitle: text-body

src/components/agentic-patterns/HubGrid.tsx
  └── subtitle paragraph: text-body                # was text-base

src/components/agentic-patterns/PatternHeader.tsx
  ├── title: text-page-h1
  └── subtitle: text-body                          # was text-lg
```

### Audit pass (likely additional touches)

- Loading skeletons matching the new prose width (`/posts/[slug]/loading.tsx`, `/posts/loading.tsx`).
- Any component with hardcoded `text-(sm|xs|base|lg|xl)` not listed above. Run a grep audit during implementation and decide tier-by-tier whether each should map to a `--type-*` token, scale to a Tailwind utility one tier up, or stay anchored.
- The article h1 in `/posts/[slug]/page.tsx` and `/agentic-design-patterns/[slug]/page.tsx` — confirm whether it uses `PageHeader` or has its own heading; if custom, apply `text-page-h1`.

## Responsive behavior

| Viewport | Body | Nav | Brand | Page h1 | Frame width |
|---|---|---|---|---|---|
| 375 px (phone) | 19 px | 14 px | 18 px | 30 px (hub) / 38 px (article) | viewport-1 (~343 px inside frame chrome) |
| 768 px (tablet) | ~20 px | ~15 px | ~19.8 px | ~32 px / ~40 px | 768 - frame margin |
| 1024 px (small laptop) | ~21 px | ~16.3 px | ~21.1 px | ~34 px / ~42 px | 1024 - margin |
| 1280 px+ (desktop) | 22 px | 17 px | 22 px | 36 px / 44 px | 1280 px |

The two h1 tracks: **hub page h1** (PageHeader) uses `--type-page-h1` and stays at the smaller end of the magazine scale; **article h1** inside `.prose` uses the explicit `2em` rule (so it tracks `--type-body`) and reads as the editorial centerpiece.

The site-frame's existing `mx-auto my-4 sm:my-6` continues to provide outer viewport padding. On a 1366 px laptop the frame leaves ~43 px on each side; on a 1920 px monitor, ~320 px each side. Acceptable for the magazine identity.

## Risks and mitigations

- **CRT glow text-shadow blur radius (`0 0 6px` on dark headings) reads tighter on bigger headings.** Mitigation: deferred to a follow-up tuning pass; revisit only if visibly off after the main change.
- **Hardcoded Tailwind utilities outside the impact list** produce inconsistent chrome feel. Mitigation: full grep audit during implementation; each hit gets a yes/no decision.
- **Bigger frame (1280) on narrow laptops (1366 px):** frame nearly fills viewport. Acceptable — common pattern on `max-w-7xl` content sites today.
- **Mermaid diagrams sized in absolute pixels** may look small relative to bigger body. Out of scope; revisit if visibly off.
- **Rollback:** the entire change is in CSS tokens and Tailwind class swaps. A single revert commit returns to current state.

## Test plan

- [ ] Visual smoke: `/`, `/posts`, `/posts/[slug]`, `/agentic-design-patterns`, `/agentic-design-patterns/[slug]`, `/agentic-design-patterns/changelog`, `/about`, `/test-error`.
- [ ] At 375 px viewport: line length on `/posts/[slug]` reads between 45 and 65 chars; nav remains usable; no horizontal overflow.
- [ ] At 768 px viewport: clamp transitions smoothly while resizing — no visible jumps.
- [ ] At 1280 px viewport: frame at 1280 px confirmed in DevTools; prose column at 960 px; body at 22 px.
- [ ] At 1920 px viewport: frame still 1280; viewport gutter symmetric; prose centered.
- [ ] Light + dark themes: all `--type-*` tokens render identically (they don't depend on theme).
- [ ] `pnpm build` succeeds (Tailwind resolves new theme tokens, no class-name regressions).
- [ ] `pnpm lint` passes.
- [ ] E2E shards 1-4 pass.

## Open implementation questions (for writing-plans)

- **Heading h1 inside `.prose`:** lock at `2em` explicitly so we don't depend on browser-default drift. (Decision pre-made above; confirm during implementation.)
- **Article-page h1** rendering: `PageHeader` vs custom layout — audit `/posts/[slug]/page.tsx` and `/agentic-design-patterns/[slug]/page.tsx`.
- **Tailwind 4 `text-*` from `@theme inline` font-size tokens:** confirm `text-body`, `text-nav`, etc. resolve correctly without `tailwind.config.ts` extension. If not, fall back to `text-[var(--type-body)]` arbitrary-value syntax.

## Out of scope (future passes)

- CRT glow blur radii reflow.
- Mermaid diagram sizing on the new frame.
- Reading-mode toggle (serif vs sans).
- Tablet-specific layout (e.g., reading rails on iPad portrait).
