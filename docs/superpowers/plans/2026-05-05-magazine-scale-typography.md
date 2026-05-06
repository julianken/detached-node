# Magazine-Scale Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scale the site's reading surface (frame card, prose column, type system, chrome) into a generous magazine layout, with all chrome and headings scaling proportionally and a fluid `clamp()` responsive scale.

**Architecture:** All sizing magnitudes live as CSS custom properties in `src/app/globals.css`, exposed to Tailwind 4 via the existing `@theme inline` block (which generates `text-{name}` and `max-w-{name}` utilities automatically from `--font-size-{name}` and `--max-width-{name}` theme variables). Components consume these via Tailwind class names — no JS-side wiring, no per-component font-size config.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 (theme via `@theme inline`), CSS `clamp()` for fluid scale, Playwright for E2E verification.

**Spec:** `docs/superpowers/specs/2026-05-05-magazine-scale-typography-design.md`
**Issue:** [#361](https://github.com/julianken/detached-node/issues/361)
**Branch:** `feat/magazine-typography`

---

## File Structure

### Files modified

| Path | Responsibility |
|---|---|
| `src/app/globals.css` | New `--width-*` and `--type-*` tokens; `@theme inline` exposing them; updated `.prose` font-size + new explicit `h1`/`h4` rules |
| `src/app/(frontend)/layout.tsx` | `site-frame` switches to `max-w-frame`; nav links → `text-nav`; brand → `text-brand` |
| `src/components/PageLayout.tsx` | `prose` and `content` size tokens swap to new max-width tokens |
| `src/components/PageHeader.tsx` | h1 → `text-page-h1`; subtitle → `text-body` |
| `src/components/StatusBar.tsx` | Status text → `text-meta` |
| `src/components/PostCard.tsx` | Title → `text-card-title`; summary → `text-card-summary`; date → `text-meta` |
| `src/components/agentic-patterns/PatternCard.tsx` | Same mapping as PostCard |
| `src/components/agentic-patterns/HubHero.tsx` | Title → `text-page-h1`; subtitle → `text-body` |
| `src/components/agentic-patterns/HubGrid.tsx` | Subtitle → `text-body` |
| `src/components/agentic-patterns/PatternHeader.tsx` | Title → `text-page-h1`; subtitle → `text-body` |
| `src/app/(frontend)/posts/loading.tsx` | Skeleton grid width adjusts to new prose token |
| `src/app/(frontend)/posts/[slug]/loading.tsx` | Skeleton column width adjusts to new prose-wide token |

### Files audited (decisions per file)

| Path | Decision |
|---|---|
| `src/components/Button.tsx` | Keep — UI primitive should stay compact; do not scale |
| `src/components/MermaidDiagram.tsx` | Keep — diagram-internal sizing |
| `src/components/agentic-patterns/PatternStickyRail.tsx` | Keep — rail intentionally smaller than body |
| `src/components/agentic-patterns/LivingCatalogBadge.tsx` | Keep — badge stays compact |
| `src/components/agentic-patterns/HubFilterableContent.tsx` | Audit — likely body-prose tier |
| `src/components/agentic-patterns/SourcedClaimTable.tsx` | Audit — table cells likely body-prose tier |
| `src/components/agentic-patterns/DecisionMatrix.tsx` | Audit — table cells likely body-prose tier |
| `src/components/agentic-patterns/RealizingDisclosure.tsx` | Audit — disclosure body likely prose tier |
| `src/components/agentic-patterns/DisclosureSection.tsx` | Audit — same |
| `src/components/agentic-patterns/ReferencesSection.tsx` | Audit — references list likely meta tier |
| `src/components/agentic-patterns/PrevNextNav.tsx` | Audit — nav element, likely text-nav tier |
| `src/components/agentic-patterns/PatternBody.tsx` | Audit — body content, likely scales via .prose |

### Files created

| Path | Responsibility |
|---|---|
| `tests/e2e/visual/typography-scale.spec.ts` | Playwright assertions on computed `font-size` and `max-width` at the 375 / 768 / 1280 viewport breakpoints |

---

### Task 1: Pre-flight — checkout branch and verify spec exists

**Files:** none (sanity check only)

- [ ] **Step 1: Confirm working tree is clean and on the right branch**

```bash
git -C /Users/jul/repos/detached-node status
git -C /Users/jul/repos/detached-node checkout feat/magazine-typography
git -C /Users/jul/repos/detached-node pull --ff-only origin feat/magazine-typography
```

Expected: branch is `feat/magazine-typography`, tree is clean (besides untracked dev artifacts), pull is up-to-date.

- [ ] **Step 2: Confirm spec is on this branch**

```bash
ls /Users/jul/repos/detached-node/docs/superpowers/specs/2026-05-05-magazine-scale-typography-design.md
```

Expected: file exists.

- [ ] **Step 3: Confirm dev server runs**

```bash
# In a separate terminal, leave running for the rest of the plan:
pnpm -C /Users/jul/repos/detached-node dev
```

Expected: dev server boots on `localhost:3000`.

---

### Task 2: Add CSS custom property tokens to `globals.css`

**Files:**
- Modify: `src/app/globals.css` (the existing `:root` block at line 144-190)

- [ ] **Step 1: Append the new token block immediately after the existing font stacks (line 190, before the closing `}` of `:root`)**

In `src/app/globals.css`, locate the end of the existing `:root` block (around line 190, just after `--font-mono-stack`) and append before the closing `}`:

```css
  /* ── Magazine-scale typography tokens ────────────────────
     Values picked so each clamp's min hits at a 375px viewport
     and max hits at a 1280px viewport. 1rem = 16px (root unchanged). */

  /* Width tokens */
  --width-frame: 1280px;
  --width-prose: 960px;
  --width-content: 1100px;

  /* Type tokens (fluid) */
  --type-body: clamp(19px, 1.1rem + 0.34vw, 22px);
  --type-nav: clamp(14px, 0.8rem + 0.34vw, 17px);
  --type-brand: clamp(18px, 1rem + 0.5vw, 22px);
  --type-meta: clamp(11px, 0.65rem + 0.22vw, 13px);
  --type-card-title: clamp(17px, 0.95rem + 0.45vw, 21px);
  --type-card-summary: clamp(15px, 0.85rem + 0.34vw, 18px);
  --type-page-h1: clamp(30px, 1.72rem + 0.66vw, 36px);
```

- [ ] **Step 2: Verify the file parses (no syntax error)**

```bash
pnpm -C /Users/jul/repos/detached-node lint
```

Expected: no errors related to `globals.css`.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/globals.css
git -C /Users/jul/repos/detached-node commit -m "feat(typography): add magazine-scale width and type CSS tokens"
```

---

### Task 3: Wire tokens into Tailwind via `@theme inline`

**Files:**
- Modify: `src/app/globals.css` (the existing `@theme inline` block at line 237-257)

- [ ] **Step 1: Extend `@theme inline` with the new font-size and max-width entries**

Locate the `@theme inline { ... }` block (around line 237). Just before its closing `}`, append:

```css
  /* Magazine-scale theme tokens — generate text-* and max-w-* utilities */
  --font-size-body: var(--type-body);
  --font-size-nav: var(--type-nav);
  --font-size-brand: var(--type-brand);
  --font-size-meta: var(--type-meta);
  --font-size-card-title: var(--type-card-title);
  --font-size-card-summary: var(--type-card-summary);
  --font-size-page-h1: var(--type-page-h1);

  --max-width-frame: var(--width-frame);
  --max-width-prose-wide: var(--width-prose);
  --max-width-content-wide: var(--width-content);
```

- [ ] **Step 2: Verify Tailwind picks up the new utilities by running build**

```bash
pnpm -C /Users/jul/repos/detached-node build
```

Expected: build succeeds without errors. Tailwind 4 will silently generate `text-body`, `text-nav`, `text-brand`, `text-meta`, `text-card-title`, `text-card-summary`, `text-page-h1`, `max-w-frame`, `max-w-prose-wide`, `max-w-content-wide`.

If the build errors with "unknown utility", it's likely a Tailwind 4 version difference — fall back to using `text-[var(--type-body)]` arbitrary-value syntax in component files instead, and skip Step 1 of this task. Re-add the bare CSS variables (without `@theme inline` exposure) and proceed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/globals.css
git -C /Users/jul/repos/detached-node commit -m "feat(typography): expose magazine tokens to Tailwind via @theme inline"
```

---

### Task 4: Update `.prose` font-size and add explicit h1/h4 rules

**Files:**
- Modify: `src/app/globals.css` (the `.prose` block at line 10-16, and the headings block at line 30-50)

- [ ] **Step 1: Replace `.prose`'s hardcoded `font-size: 1.125rem` with the body token**

In `src/app/globals.css`, change line 14 from:

```css
.prose {
  color: var(--prose-body);
  line-height: 1.75;
  transition: color 150ms ease;
  font-size: 1.125rem;  /* OLD */
}
```

to:

```css
.prose {
  color: var(--prose-body);
  line-height: 1.75;
  transition: color 150ms ease;
  font-size: var(--type-body);  /* NEW */
}
```

- [ ] **Step 2: Add explicit `.prose h1` and `.prose h4` rules**

After the existing `.prose h3 { ... }` block (around line 50), insert:

```css
/* Lock article-h1 at 2× body so it tracks the fluid body scale.
   Set explicitly so we don't depend on browser-default drift. */
.prose h1 {
  font-size: 2em;
  margin-top: 0;
  margin-bottom: 0.5em;
}

.prose h4 {
  font-size: 1.125em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
```

- [ ] **Step 3: Visual sanity check at the dev server**

Open `http://localhost:3000/posts/architecture-of-agent-systems` in a browser. Use DevTools to confirm `.prose` element has computed `font-size: 22px` at viewport 1280×800.

Expected: body type renders bigger; existing h2/h3 ratios still apply (visibly larger because they cascade from the new body); h1 reads at 44px.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/globals.css
git -C /Users/jul/repos/detached-node commit -m "feat(typography): apply --type-body to .prose, add explicit h1/h4 rules"
```

---

### Task 5: Write the failing E2E typography-scale spec

**Files:**
- Create: `tests/e2e/visual/typography-scale.spec.ts`

- [ ] **Step 1: Write the spec file**

Create `tests/e2e/visual/typography-scale.spec.ts` with:

```typescript
import { test, expect } from '@playwright/test'

/**
 * Verifies the magazine-scale typography spec
 * (docs/superpowers/specs/2026-05-05-magazine-scale-typography-design.md)
 *
 * Asserts computed CSS at the spec's three reference viewports:
 *   375px → body 19px, frame fits viewport
 *   768px → body roughly mid-clamp
 *   1280px → body 22px, frame 1280px, prose 960px
 *
 * Slug 'architecture-of-agent-systems' is one of the seed-test-db post
 * slugs (see seed-test-db.ts and tests/e2e/public/post-detail.spec.ts).
 */

const POST_SLUG = 'architecture-of-agent-systems'

async function getComputedNumber(page, selector: string, prop: string): Promise<number> {
  return await page.locator(selector).first().evaluate(
    (el, p) => parseFloat(window.getComputedStyle(el).getPropertyValue(p)),
    prop,
  )
}

test.describe('Magazine-scale typography', () => {
  test('body type at 1280 viewport is 22px (max of clamp)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const fontSize = await getComputedNumber(page, '.prose', 'font-size')
    expect(fontSize).toBeGreaterThanOrEqual(21.5)
    expect(fontSize).toBeLessThanOrEqual(22.5)
  })

  test('body type at 375 viewport is 19px (min of clamp)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const fontSize = await getComputedNumber(page, '.prose', 'font-size')
    expect(fontSize).toBeGreaterThanOrEqual(18.5)
    expect(fontSize).toBeLessThanOrEqual(19.5)
  })

  test('site frame max-width is 1280px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/')
    const frameWidth = await getComputedNumber(page, '.site-frame', 'max-width')
    expect(frameWidth).toBe(1280)
  })

  test('prose container max-width is 960px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    // PageLayout's prose constraint is on the wrapping div with max-w-prose-wide
    const proseWrapper = page.locator('main > div').first()
    const w = await proseWrapper.evaluate(el =>
      parseFloat(window.getComputedStyle(el).maxWidth)
    )
    expect(w).toBe(960)
  })

  test('body type scales fluidly between min and max at 768 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const fontSize = await getComputedNumber(page, '.prose', 'font-size')
    // At viewport 768: 1.1rem + 0.34vw = 17.6 + 2.611 = 20.21px
    expect(fontSize).toBeGreaterThan(19.5)
    expect(fontSize).toBeLessThan(21.0)
  })
})
```

- [ ] **Step 2: Run the test, expect FAILURE**

```bash
pnpm -C /Users/jul/repos/detached-node exec playwright test tests/e2e/visual/typography-scale.spec.ts --project=chromium --reporter=list
```

Expected: at least the `frame max-width is 1280px` and `prose container max-width is 960px` tests FAIL (because Tasks 6 and 7 haven't run yet). Body-type tests may PASS if Task 4 already shipped — that is OK.

- [ ] **Step 3: Commit the failing test**

```bash
git -C /Users/jul/repos/detached-node add tests/e2e/visual/typography-scale.spec.ts
git -C /Users/jul/repos/detached-node commit -m "test(typography): assert magazine-scale spec acceptance via E2E"
```

---

### Task 6: Update `site-frame` max-width in `layout.tsx`

**Files:**
- Modify: `src/app/(frontend)/layout.tsx:93`

- [ ] **Step 1: Change `max-w-5xl` to `max-w-frame` on the site-frame div**

In `src/app/(frontend)/layout.tsx`, line 93, change:

```tsx
<div className="site-frame mx-auto my-4 flex min-h-[calc(100vh-2rem)] max-w-5xl flex-col rounded-sm border border-border sm:my-6 sm:min-h-[calc(100vh-3rem)]">
```

to:

```tsx
<div className="site-frame mx-auto my-4 flex min-h-[calc(100vh-2rem)] max-w-frame flex-col rounded-sm border border-border sm:my-6 sm:min-h-[calc(100vh-3rem)]">
```

- [ ] **Step 2: Verify in browser at 1600px viewport**

Open `http://localhost:3000/` at viewport 1600×900. Use DevTools to inspect `.site-frame` — its computed `max-width` should be `1280px`.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/\(frontend\)/layout.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): site-frame uses max-w-frame (1280px)"
```

---

### Task 7: Update `PageLayout` width tokens

**Files:**
- Modify: `src/components/PageLayout.tsx:23-26`

- [ ] **Step 1: Swap the maxWidth class entries**

In `src/components/PageLayout.tsx`, update the `maxWidthClasses` constant (lines 22-26) from:

```tsx
const maxWidthClasses = {
  full: "",
  prose: "max-w-3xl mx-auto",
  content: "max-w-5xl mx-auto",
} as const;
```

to:

```tsx
const maxWidthClasses = {
  full: "",
  prose: "max-w-prose-wide mx-auto",
  content: "max-w-content-wide mx-auto",
} as const;
```

- [ ] **Step 2: Verify in browser at 1600px viewport**

Open `http://localhost:3000/posts/architecture-of-agent-systems`. Inspect the wrapping div (PageLayout's outer flex). Its computed `max-width` should be `960px` (prose token).

Open `http://localhost:3000/agentic-design-patterns/parallelization` (or any pattern slug). The PageLayout wrapper there should have `max-width: 1100px` (content token).

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/PageLayout.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): PageLayout prose/content use new wide tokens"
```

---

### Task 8: Update `layout.tsx` chrome (nav links + brand)

**Files:**
- Modify: `src/app/(frontend)/layout.tsx:95-114`

- [ ] **Step 1: Update the brand link's text-size class**

In `src/app/(frontend)/layout.tsx`, line 95:

```tsx
<Link href="/" className="font-mono text-lg font-semibold tracking-tight text-accent lowercase focus-ring">
  d-n
</Link>
```

→

```tsx
<Link href="/" className="font-mono text-brand font-semibold tracking-tight text-accent lowercase focus-ring">
  d-n
</Link>
```

- [ ] **Step 2: Update the nav links' text-size class**

In `src/app/(frontend)/layout.tsx`, line 99 — the nav `<nav>` element:

```tsx
<nav className="flex flex-wrap items-center gap-4 text-sm font-mono tracking-[0.04em] text-text-secondary sm:gap-6" aria-label="Main navigation">
```

→

```tsx
<nav className="flex flex-wrap items-center gap-4 text-nav font-mono tracking-[0.04em] text-text-secondary sm:gap-6" aria-label="Main navigation">
```

- [ ] **Step 3: Verify in browser**

At viewport 1280×900, the nav text should render at 17px and the brand at 22px (DevTools computed style).

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/\(frontend\)/layout.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): nav text-nav, brand text-brand"
```

---

### Task 9: Update `PageHeader`

**Files:**
- Modify: `src/components/PageHeader.tsx`

- [ ] **Step 1: Replace the file with token-based sizes**

Open `src/components/PageHeader.tsx` and replace its body so the h1 uses the page-h1 token and the subtitle uses the body token:

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header>
      <h1 className="font-mono text-page-h1 font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-prose text-body leading-relaxed text-text-secondary">
          {subtitle}
        </p>
      )}
    </header>
  );
}
```

(Changed: `text-3xl` → `text-page-h1`; subtitle `text-base leading-6` → `text-body leading-relaxed`. The `leading-relaxed` keeps the existing visual breathing — the previous `leading-6` was a fixed 1.5rem, which after the body bump would feel cramped.)

- [ ] **Step 2: Verify on the about and posts pages**

Open `http://localhost:3000/about` at viewport 1280. The h1 "About" should render at ~36px. Open `http://localhost:3000/posts`. The "Posts" h1 should render at ~36px. Subtitles should render at ~22px.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/PageHeader.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): PageHeader h1=text-page-h1, subtitle=text-body"
```

---

### Task 10: Update `StatusBar`

**Files:**
- Modify: `src/components/StatusBar.tsx`

- [ ] **Step 1: Read the current file to understand its structure**

```bash
cat /Users/jul/repos/detached-node/src/components/StatusBar.tsx
```

- [ ] **Step 2: Update any `text-xs` / `text-sm` occurrences in StatusBar to `text-meta`**

For each Tailwind text-size class on the status bar's primary status text spans, swap to `text-meta`. Keep `font-mono`, color tokens, and layout classes unchanged. The status bar should have at most one primary type tier.

If you find more nuanced sizing (e.g., a clock at one size and a connection state at another), use `text-meta` for both — they sit on the same UI tier.

Example (the exact code will depend on what's in the file):

```tsx
// Before
<span className="text-xs font-mono uppercase tracking-[0.1em] text-text-tertiary">

// After
<span className="text-meta font-mono uppercase tracking-[0.1em] text-text-tertiary">
```

- [ ] **Step 3: Verify in browser**

At viewport 1280, the StatusBar text should render at 13px (meta upper bound).

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/StatusBar.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): StatusBar uses text-meta"
```

---

### Task 11: Update `PostCard`

**Files:**
- Modify: `src/components/PostCard.tsx:48-55`

- [ ] **Step 1: Update each text-size class on PostCard's content elements**

In `src/components/PostCard.tsx`:

Line 49 (title h2): `text-lg` → `text-card-title`
Line 50 (date span): `text-xs` → `text-meta`
Line 52 (summary p): `text-base leading-6` → `text-card-summary leading-relaxed`
Line 53 ("Read more" p): `text-sm` → `text-meta`

Final shape (lines 48-55):

```tsx
<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
  <h2 className="font-mono text-card-title font-semibold tracking-tight text-text-primary [text-wrap:balance]">{title}</h2>
  {date && <span className="text-meta tracking-[0.03em] text-text-tertiary sm:whitespace-nowrap">{date}</span>}
</div>
<p className="mt-2 max-w-prose text-card-summary leading-relaxed text-text-secondary [text-wrap:pretty]">{summary}</p>
<p className="mt-3 text-meta font-medium text-accent group-hover:text-accent-muted transition-colors">
  Read more →
</p>
```

- [ ] **Step 2: Verify on /posts**

Open `http://localhost:3000/posts` at viewport 1280. Card titles should render at ~21px, summaries at ~18px, dates and "Read more" at ~13px.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/PostCard.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): PostCard uses card-title/card-summary/meta tokens"
```

---

### Task 12: Update `PatternCard`

**Files:**
- Modify: `src/components/agentic-patterns/PatternCard.tsx`

- [ ] **Step 1: Read the file**

```bash
cat /Users/jul/repos/detached-node/src/components/agentic-patterns/PatternCard.tsx
```

- [ ] **Step 2: Apply the same mapping as PostCard**

Within the file, find the analogous title / summary / date / link elements. Apply:

- Title (h2 / h3): `text-lg` or `text-xl` → `text-card-title`
- Summary paragraph: `text-base` → `text-card-summary`
- Metadata / dates: `text-xs` or `text-sm` → `text-meta`
- "Read more" / CTA link: `text-sm` → `text-meta`

Preserve `font-mono`, `font-semibold`, `tracking-*`, color tokens, and layout classes. Only swap text-size classes.

- [ ] **Step 3: Verify on /agentic-design-patterns**

Open `http://localhost:3000/agentic-design-patterns`. Pattern cards should match PostCard sizing.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/PatternCard.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): PatternCard uses card-title/card-summary/meta tokens"
```

---

### Task 13: Update `HubHero`, `HubGrid`, `PatternHeader`

**Files:**
- Modify: `src/components/agentic-patterns/HubHero.tsx`
- Modify: `src/components/agentic-patterns/HubGrid.tsx`
- Modify: `src/components/agentic-patterns/PatternHeader.tsx`

- [ ] **Step 1: HubHero — title to `text-page-h1`, subtitle to `text-body`**

In `src/components/agentic-patterns/HubHero.tsx` line 31:

```tsx
<p className="max-w-prose text-lg leading-7 text-text-secondary [text-wrap:pretty]">
```

→

```tsx
<p className="max-w-prose text-body leading-relaxed text-text-secondary [text-wrap:pretty]">
```

Find the title element in the same file (likely an h1 or h2 with `text-3xl` / `text-4xl` / `text-2xl`) and change to `text-page-h1`.

- [ ] **Step 2: HubGrid — subtitle to `text-body`**

In `src/components/agentic-patterns/HubGrid.tsx` line 34:

```tsx
<p className="max-w-prose text-base leading-6 text-text-secondary [text-wrap:pretty]">
```

→

```tsx
<p className="max-w-prose text-body leading-relaxed text-text-secondary [text-wrap:pretty]">
```

- [ ] **Step 3: PatternHeader — title to `text-page-h1`, subtitle to `text-body`**

In `src/components/agentic-patterns/PatternHeader.tsx` line 48:

```tsx
<p className="max-w-prose text-lg leading-7 text-text-secondary [text-wrap:pretty]">
```

→

```tsx
<p className="max-w-prose text-body leading-relaxed text-text-secondary [text-wrap:pretty]">
```

Find the title h1 in the same file and change its size class to `text-page-h1`.

- [ ] **Step 4: Verify on /agentic-design-patterns and a pattern detail page**

Open `http://localhost:3000/agentic-design-patterns`. Hub hero title should render at ~36px, subtitle at ~22px. Open a pattern slug — pattern header title should also be ~36px, subtitle ~22px.

- [ ] **Step 5: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/HubHero.tsx src/components/agentic-patterns/HubGrid.tsx src/components/agentic-patterns/PatternHeader.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): pattern hub components use page-h1 + body tokens"
```

---

### Task 14: Update loading skeletons

**Files:**
- Modify: `src/app/(frontend)/posts/[slug]/loading.tsx`
- Modify: `src/app/(frontend)/posts/loading.tsx`

- [ ] **Step 1: Update `[slug]/loading.tsx`**

In `src/app/(frontend)/posts/[slug]/loading.tsx`, line 4:

```tsx
className="glitch-reveal mx-auto flex max-w-3xl flex-col gap-16 animate-pulse"
```

→

```tsx
className="glitch-reveal mx-auto flex max-w-prose-wide flex-col gap-16 animate-pulse"
```

- [ ] **Step 2: Update `posts/loading.tsx` if it has a width constraint**

```bash
cat /Users/jul/repos/detached-node/src/app/\(frontend\)/posts/loading.tsx
```

If the file has `max-w-3xl` or `max-w-5xl`, change to `max-w-prose-wide` or `max-w-content-wide` respectively. If it has no width class, leave it alone — it likely fills the frame.

- [ ] **Step 3: Verify by triggering loading state**

Throttle the network in DevTools and refresh `/posts/architecture-of-agent-systems`. The skeleton column should match the new prose width.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/\(frontend\)/posts/loading.tsx src/app/\(frontend\)/posts/\[slug\]/loading.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(typography): loading skeletons match new prose width"
```

---

### Task 15: Audit pass — remaining components

**Files:** various — see decision matrix below

- [ ] **Step 1: Run the audit grep**

```bash
grep -rn "text-sm\|text-xs\|text-lg\|text-base\|text-3xl\|text-2xl\|text-xl" /Users/jul/repos/detached-node/src --include="*.tsx" 2>/dev/null
```

- [ ] **Step 2: For each remaining file, apply the decision**

Apply only to files NOT already updated in Tasks 8-13. For each remaining hit, decide per the matrix:

| File | Action |
|---|---|
| `Button.tsx` | **Skip** — UI primitive |
| `MermaidDiagram.tsx` | **Skip** — diagram-internal |
| `PatternStickyRail.tsx` | **Skip** — rail intentionally compact |
| `LivingCatalogBadge.tsx` | **Skip** — badge stays compact |
| `HubFilterableContent.tsx` | If contains a body-prose paragraph, change `text-base` → `text-body` |
| `SourcedClaimTable.tsx` | If table cells use `text-sm`, change to `text-card-summary` (table reads denser than body) |
| `DecisionMatrix.tsx` | Same as SourcedClaimTable |
| `RealizingDisclosure.tsx` | If disclosure body uses `text-base`, change to `text-body` |
| `DisclosureSection.tsx` | Same as RealizingDisclosure |
| `ReferencesSection.tsx` | If list items use `text-xs`/`text-sm`, change to `text-meta` |
| `PrevNextNav.tsx` | If nav text uses `text-sm`, change to `text-nav` |
| `PatternBody.tsx` | If wraps RichText in `.prose`, no change needed (it inherits via .prose). Otherwise, body-prose tier |
| Any other file | Use judgment: prose-like body → `text-body`; metadata/labels → `text-meta`; card-tier → `text-card-summary` |

Make the changes and stage them per file. Where in doubt about a file, leave it as-is and add a TODO comment with the path so you can revisit before final commit.

- [ ] **Step 3: Verify each affected page renders**

Visit each route at viewport 1280: `/`, `/posts`, `/posts/[slug]`, `/agentic-design-patterns`, `/agentic-design-patterns/[slug]`, `/agentic-design-patterns/changelog`, `/about`. No horizontal overflow, no layout breakage, all type tiers visible.

- [ ] **Step 4: Commit per-file or as a single audit commit**

```bash
git -C /Users/jul/repos/detached-node add -p
# Stage changes interactively, then:
git -C /Users/jul/repos/detached-node commit -m "feat(typography): audit pass — apply tokens to remaining components"
```

---

### Task 16: Run E2E test, full build, lint

**Files:** none (verification)

- [ ] **Step 1: Run the typography-scale spec — should now PASS**

```bash
pnpm -C /Users/jul/repos/detached-node exec playwright test tests/e2e/visual/typography-scale.spec.ts --project=chromium --reporter=list
```

Expected: all 5 tests PASS.

If a test fails:
- `body type at 1280` failing → Task 4 didn't apply; check `globals.css` `.prose { font-size: var(--type-body) }`
- `frame max-width` failing → Task 6 didn't apply; check `layout.tsx` uses `max-w-frame`
- `prose container max-width` failing → Task 7 didn't apply; check `PageLayout.tsx` uses `max-w-prose-wide`

- [ ] **Step 2: Run full build**

```bash
pnpm -C /Users/jul/repos/detached-node build
```

Expected: build succeeds. Tailwind resolves all new utilities.

- [ ] **Step 3: Run lint**

```bash
pnpm -C /Users/jul/repos/detached-node lint
```

Expected: no errors.

- [ ] **Step 4: Run the full E2E suite (single chromium project, parallel)**

```bash
pnpm -C /Users/jul/repos/detached-node exec playwright test --project=chromium --reporter=list
```

Expected: all tests pass. If existing E2E tests rely on specific computed font sizes (e.g., `text-3xl`), those tests may need updating in the same PR. Update tests rather than reverting source — the new sizes are intentional.

---

### Task 17: Visual smoke + push + PR

**Files:** none (review and PR)

- [ ] **Step 1: Visual smoke at three viewports**

Open `http://localhost:3000` in a browser. Test at each viewport via DevTools device toolbar:

- **375 × 667 (iPhone SE):** body type ~19px, no horizontal scroll, nav fits, line length on `/posts/[slug]` between 45-65 chars.
- **768 × 1024 (iPad):** body type ~20px, frame fits viewport with margin, no jumps when resizing.
- **1280 × 800 (laptop):** body type 22px, frame at 1280px, prose at 960px on /posts/[slug].
- **1920 × 1080 (desktop):** frame still 1280px, viewport gutter symmetric on both sides.

Pages to smoke at each: `/`, `/posts`, `/posts/architecture-of-agent-systems`, `/agentic-design-patterns`, `/agentic-design-patterns/changelog`, `/about`.

- [ ] **Step 2: Toggle dark/light themes on each page**

Use the ThemeToggle. Type tokens are theme-agnostic (no dependencies on `--prose-*`), so visual change should be palette-only.

- [ ] **Step 3: Push the branch**

```bash
git -C /Users/jul/repos/detached-node push origin feat/magazine-typography
```

- [ ] **Step 4: Open the PR**

```bash
gh pr create --repo julianken/detached-node \
  --title "feat(typography): magazine-scale type and content margin (closes #361)" \
  --body "$(cat <<'EOF'
## Summary

Implements the magazine-scale typography spec — frame card grows from 1024 → 1280 px, prose column from 768 → 960 px, body type fluid 19 → 22 px via `clamp()`, all chrome scales proportionally.

Closes #361.

## Design provenance

- Spec: `docs/superpowers/specs/2026-05-05-magazine-scale-typography-design.md`
- Plan: `docs/superpowers/plans/2026-05-05-magazine-scale-typography.md`
- Brainstorm: visual-companion mockups in `.superpowers/brainstorm/` (not committed)
- Decisions: C / C2 / R2 / S1

## Test plan

- [x] `tests/e2e/visual/typography-scale.spec.ts` — Playwright assertions on computed font-size and max-width at 375 / 768 / 1280 viewports
- [x] `pnpm build` succeeds (Tailwind resolves new tokens)
- [x] `pnpm lint` clean
- [x] Full E2E suite passes
- [x] Visual smoke at 375, 768, 1280, 1920 viewports across `/`, `/posts`, `/posts/[slug]`, `/agentic-design-patterns`, `/agentic-design-patterns/[slug]`, `/agentic-design-patterns/changelog`, `/about`
- [x] Light + dark themes verified

## Out of scope (follow-ups)

- CRT glow text-shadow blur radii reflow for bigger headings
- Mermaid diagram sizing in the new frame
- Reading-mode toggle (serif vs sans)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: After CI green and review approval, queue for merge**

```bash
gh pr comment <PR-NUMBER> --repo julianken/detached-node --body "@mergifyio queue"
```

(Replace `<PR-NUMBER>` with the actual PR number from Step 4. The exact phrase `@mergifyio queue` matters — see `mergify-merge-workflow` skill if Mergify ignores it.)

---

## Self-Review

Spec coverage check:

| Spec section | Implementing task |
|---|---|
| Frame width 1024 → 1280 | Tasks 2, 3, 6 |
| Prose width 768 → 960 | Tasks 2, 3, 7 |
| Body type fluid 19→22 | Tasks 2, 3, 4 |
| Chrome scaling (~+22%) | Tasks 8, 9, 10 |
| Heading rules (h1=2em, h2/h3 unchanged, h4=1.125em) | Task 4 |
| Card components | Tasks 11, 12 |
| Hub components | Task 13 |
| Loading skeletons | Task 14 |
| Audit pass | Task 15 |
| E2E test | Task 5 (write) + Task 16 (run pass) |
| Visual smoke | Task 17 |
| PR + queue | Task 17 |

No spec section is unimplemented.

Type/method consistency: token names are referenced in the same form across all tasks (`text-body`, `text-nav`, `text-brand`, `text-meta`, `text-card-title`, `text-card-summary`, `text-page-h1`, `max-w-frame`, `max-w-prose-wide`, `max-w-content-wide`).

No placeholders, no "TBD", no "similar to Task N" — every step has the actual code or command to run.
