# Agentic Design Patterns — Companion Site

**Date:** 2026-05-02
**Status:** Draft — pending user review (iterated 3× with fresh-context critics)

## Problem

Build an **independent reader's companion** to Antonio Gulli's *Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems* (Springer, 2026): a free, web-native reference page that helps developers find the right pattern fast and sends them to the source. The page must:

1. Function as a **reference tool** developers keep open while coding — dense, scannable, fast
2. **Honor the author** with extreme care — clear citation everywhere, original prose and diagrams only, generous outbound CTAs to the book, Springer, and Save the Children
3. Earn organic search traffic for "agentic design patterns" and pattern-specific long-tail
4. Demonstrate **2026-era frontend craft** — Next.js 16 server components with minimal client JS, View Transitions API for cross-document navigation, CSS Container Queries for responsive cards, CSS scroll-driven animations for reveals, custom per-pattern OG images via `next/og`, terminal-aesthetic mermaid diagrams

Success criterion (private; not surfaced in any artifact Gulli might see): Antonio Gulli sees this page and feels his work is being honored — that we built marginalia for his book, not a replacement for it.

## Solution

A static pillar-cluster pattern: one **hub** at `/agentic-design-patterns` linking to **21 satellite pages** at `/agentic-design-patterns/[slug]`. All routes are server-rendered, force-static. Hub is a dense reference tool (search, Part filters, all 21 patterns visible). Satellites share a single anatomy: 7 authored content slots (the "what to read") plus 1 author-reserved placeholder for Gulli's voice plus framing chrome. The `<InTheBookPanel>` is visually dominant — the page reads as "Gulli's chapter, with our marginalia," not "our reference page that cites him." Attribution is encoded in shared components (`<BookCitationCard>`, `<InTheBookPanel>`, `<MarginaliaDivider>`) so it cannot drift across pages.

The user-facing framing is "an independent reader's companion." Internal goals (rankings, dwell time, etc.) live in private planning notes only — never in code comments, OG images, copy, or footer text Gulli might see.

## Editorial principles (load-bearing — encoded in components, not just docs)

These rules are why this page is honoring rather than parasitic. They translate into specific component contracts:

1. **Author byline above the fold** on every satellite — "Chapter N of *Agentic Design Patterns* by Antonio Gulli" — and Gulli's name is a **link** to him (LinkedIn or Scholar), not to the book or to a fork
2. **Hero CTA goes outward** to Gulli's canonical sources (Google Doc first, then Springer, then Amazon-with-charity), never inward (no email signup, no "subscribe")
3. **"All royalties to Save the Children" surfaced wherever royalties are mentioned**, with a `★` glyph; **Amazon URL never carries an affiliate tag** (lint rule enforces)
4. **Original prose only** — we summarize patterns in our own words; we never paraphrase Gulli's sentences. The style guide includes worked good-vs-bad examples.
5. **Original diagrams only** — every Mermaid is ours; we may invent a *different decomposition*, not just a restyle of his (a structurally identical diagram with different fills is still derivative)
6. **`<InTheBookPanel>` is visually dominant** on every satellite — large card, cover thumbnail, prominent CTAs. Our content sits beneath, framed by an explicit "**Detached Node's notes →**" divider that signals the voice shift from honoring to commenting.
7. **Pattern names match Gulli's exactly** — "Reflection," not "Agentic Self-Critique"
8. **"Open in the book →"** as the outbound CTA label — book language, not homework language. Never "Read this chapter →" (homework framing).
9. **Satellite footer always carries:** "Chapter from *Agentic Design Patterns* by Antonio Gulli (Springer, 2026). Maintained as a free companion by Julian Ken (writing as Detached Node)."
10. **Hub footer:** "An independent companion. Not affiliated with Antonio Gulli or Springer." + signed "Why this page exists" letter linked.
11. **Pre-launch outreach: silence is NOT consent.** Respectful outreach to Gulli on LinkedIn (`/searchguy`) and X (`@antoniogulli`) with a private preview link. Public launch only after explicit positive response or documented 60-day good-faith outreach window. (See "If Gulli says no" section.)
12. **"Reader gotcha" not "common failure mode"** — we don't claim deployment authority we don't have. Each pattern's gotcha bullet must cite a public source (paper, public discussion, named OSS report). Allowed to be empty.
13. **"From the author" placeholder** structurally present on every satellite — empty by default, ready for Gulli's voice if he ever wants to leave a quote or correction.
14. **Page author identity is named** — Julian Ken's real name appears in the "Why this page exists" letter, the satellite footer, and the schema's `Article.author`. The "Detached Node" pseudonym remains the *publisher*; the *author* is named.

## Architecture

### Routes

```
/agentic-design-patterns                    → src/app/(frontend)/agentic-design-patterns/page.tsx
/agentic-design-patterns/[slug]             → src/app/(frontend)/agentic-design-patterns/[slug]/page.tsx
```

Both `export const dynamic = "force-static"`. Mirrors the existing `/failure-modes` pillar-page pattern.

Slugs are kebab-case from chapter title:
`prompt-chaining`, `routing`, `parallelization`, `reflection`, `tool-use`, `planning`, `multi-agent`, `memory-management`, `learning-and-adaptation`, `model-context-protocol`, `goal-setting-and-monitoring`, `exception-handling-and-recovery`, `human-in-the-loop`, `knowledge-retrieval-rag`, `inter-agent-communication-a2a`, `resource-aware-optimization`, `reasoning-techniques`, `guardrails-safety`, `evaluation-and-monitoring`, `prioritization`, `exploration-and-discovery`.

### Data model

**File layout** (deliberately split per pattern to eliminate merge-conflict contention during parallel agentic dispatch):

```
src/data/agentic-design-patterns/
├── README.md           // documents the directory's purpose + slug→pattern conventions
├── types.ts            // PartId, Part, Framework, Pattern types (shared)
├── parts.ts            // PARTS constant (4 entries)
├── index.ts            // barrel: imports all 21 patterns, exports PATTERNS array + helpers
└── patterns/
    ├── prompt-chaining.ts        // exports `prompt-chaining: Pattern`
    ├── routing.ts
    ├── parallelization.ts
    ├── ... (one file per slug, 21 total)
```

Each `patterns/<slug>.ts` is a single named export — wave-N subagents touch only their assigned files, so PRs don't conflict.

**Types** (in `types.ts`):

```ts
export type PartId = 'foundations' | 'memory' | 'recovery' | 'production'

export type Part = {
  id: PartId
  number: 1 | 2 | 3 | 4
  title: string             // "Foundations" | "Memory & Adaptation" | ...
  description: string       // 1-sentence editorial framing
}

// Frameworks Gulli uses in chapter examples. MCP is a *pattern* (chapter 10),
// not a framework — kept out of this enum to avoid type collision.
export type Framework = 'langchain' | 'langgraph' | 'crew-ai' | 'google-adk'

export type Pattern = {
  number: number            // 1..21 — matches book chapter
  slug: string              // kebab-case, equals filename
  name: string              // exact name from book
  partId: PartId
  chapterNumber: number     // matches book chapter number
  pdfPageRange: [number, number]   // PDF positional pages (NOT print-edition pages — PDF re-paginates mid-document)
  oneLineSummary: string    // hub card; ≤ 90 chars (enforced by unit test)
  bodySummary: string[]     // 2-3 paragraphs for satellite (~300 words total) — sits beneath "Detached Node's notes →" divider as marginalia
  mermaidSource: string     // our original diagram, mermaid syntax, labeled boxes only
  mermaidAlt: string        // alt text for screen readers
  whenToUse: string[]       // 3-5 bullets
  whenNotToUse: string[]    // 2-3 bullets
  realWorldExamples: { text: string; sourceUrl: string }[] // 3 bullets, each cites a public source
  implementationSketch: string // TypeScript snippet (~15 lines, Vercel AI SDK or vendor SDK)
  readerGotcha?: { text: string; sourceUrl: string } // optional, MUST cite source — leave undefined rather than invent
  fromAuthor?: string       // optional, populated only if Gulli ever provides a quote/correction
  relatedSlugs: string[]    // 2-4 cross-link chips; build fails if any don't resolve
  frameworks: Framework[]   // which framework(s) book uses for this chapter (rendered as small badges on hub card)
}
```

**Helpers** (in `index.ts`):

```ts
export const PARTS: Part[]
export const PATTERNS: Pattern[] // length 21
export function getPattern(slug: string): Pattern | undefined
export function getPatternsByPart(partId: PartId): Pattern[]
export function getPatternSlugs(): string[]
export function getAdjacentPatterns(slug: string): { prev: Pattern | null; next: Pattern | null }
```

`README.md` documents: this directory holds curated, version-controlled, type-safe content for static pages that don't benefit from CMS workflow; one file per slug to enable parallel authoring; barrel `index.ts` is the public API surface.

### Component inventory

**Build new** (companion-specific):
- `<HubHero>` — thin title band + 1-line attribution (compact, not a full hero)
- `<HubGrid>` — server component rendering 4 Part sections, each with its pattern cards. Filter chip state lives in `?part=` searchParam (server-readable for SSR-correct rendering); search query is local client state (not URL).
- `<HubSearchBar>` — client component, `/`-keyed; client-side fuzzy match across 21 names + summaries (hand-rolled — no library needed for 21 items)
- `<PatternCard>` — hub grid card. Dense: chapter#, name, `oneLineSummary`, page count, framework badges row
- `<PatternHeader>` — satellite header (Part eyebrow, "Chapter N", title, byline-with-link-to-Gulli)
- `<InTheBookPanel>` — *visually dominant* card on satellites with cover thumbnail + chapter title + page range + 4 prominent CTAs (Google Doc / Springer / Amazon-with-charity / community PDF mirror with maintainer credit)
- `<MarginaliaDivider>` — thin label "**Detached Node's notes →**" that sits between `<InTheBookPanel>` and our content body, signaling the voice shift
- `<PatternBody>` — the 8-slot template body (overview / mermaid / when-to+when-not-to / sketch / examples / reader-gotcha / related / from-author)
- `<BookCitationCard>` — full version (hub bottom, with all CTAs in the canonical order) and compact version (satellite bottom)
- `<AboutAntonioGulli>` — bio panel for hub bottom (NEW): linked-portrait + bio paragraph + curated links to *his* work (Manning, Scholar, his other Springer titles, X/LinkedIn). Zero purchase links.
- `<PrevNextNav>` — satellite footer prev/next within current Part, labeled "Previous chapter / Next chapter" (book language, not site language)
- **`/agentic-design-patterns/why-this-exists` route** — a dedicated page with the "Why this page exists" letter signed by Julian Ken (real name); linked from hub footer

**Reuse as-is**:
- `MermaidDiagram` (`src/components/MermaidDiagram.tsx`) — render `<MermaidDiagram source={pattern.mermaidSource} />` once per satellite
- `Card`, `Button`, `PageLayout`, `PageHeader`, `SchemaScript`, `FadeReveal` — all from `src/components/`
- `next-view-transitions` `<Link>` — for hub→satellite transitions (already in use via `(frontend)/layout.tsx`)

**New schema utilities**:
- `src/lib/schema/book.ts` — exports `BOOK_CONFIG` and `generateBookSchema()` returning a `Book` schema.org node. Referenced via `isBasedOn` from every Article schema.
- `generateHubChildBreadcrumb()` in `src/lib/schema/breadcrumb.ts` — 3-level breadcrumb (Home > Hub > Pattern)

## Hub page composition (top to bottom)

1. Existing site nav (from `(frontend)/layout.tsx`)
2. **Thin title band** — `<HubHero>` with one-line attribution + the "not affiliated" disclaimer (so it's surfaced *above the fold* not just buried in the footer):
   "**Agentic Design Patterns** — an independent companion to *Agentic Design Patterns* by [Antonio Gulli](https://www.linkedin.com/in/searchguy) (Springer, 2026) →" — Gulli's name links to *him* (LinkedIn `/searchguy`), the book title is the inline italic; "→" is a quiet visual hint that this is a launch point
3. **Sticky search + filter row** — `<HubSearchBar>` + filter chips. Chip set: 1 reset chip ("All 21 — selected by default") + 4 Part chips ("Foundations 7 / Memory 4 / Recovery 3 / Production 7"). Total 5 visible elements; only the 4 Parts are filterable groups.
4. **Grid sections by Part** — 4 sections, each `<PatternCard>` grid using **CSS Container Queries** (cards reflow based on container width, not viewport — better behavior in narrow embeds, sidebars, future split-pane views). All 21 cards always visible — no collapse for v1. Each `<PatternCard>` shows a tiny row of `Framework` badges (`langchain` / `langgraph` / `crew-ai` / `google-adk`) as monospace tags — a quick "what stack does this chapter use" signal that earns its keep on every card.
5. **Book card 2A** — `<BookCitationCard variant="full">` after the grid. CTAs in canonical order: **Open in the book** (Google Doc — Gulli's own canonical), **Springer**, **Buy print (royalties to Save the Children)**, **PDF mirror (community)** with `@AnkunHuang` maintainer credit. Plus ISBN + author handles + Save-the-Children badge.
6. **About Antonio Gulli panel** (NEW per critic #3) — short bio drawn from his public profiles, links to *his* work (his Manning books, his Google Scholar, his other Springer publications, his X / LinkedIn). No purchase links in this panel — purchase lives in the Book card. This panel signals "we honor *him*, not just his book."
7. **About this companion** — short footer block: "A free companion to Antonio Gulli's *Agentic Design Patterns*, maintained by Julian Ken (writing as Detached Node). All summaries and diagrams are original; the patterns are Gulli's. PDF mirror credit: `@AnkunHuang` on GitHub. **Not affiliated with Antonio Gulli or Springer.**"
8. **"Why this page exists" letter** (NEW per critic #3) — linked from the footer, a real two-paragraph letter signed with Julian's real name, written *to Gulli's likely first reaction*. States: this was built without contacting him first, what we wrote and what we didn't, the kill-switch, and a one-click contact form/mailto for "please take this down" or "please change X." Not marketing copy — a real letter.

> **Divergence from routing-agent recommendation:** the agent recommended placing the book card AT TOP. We chose patterns-lead-and-book-card-bottom per the user's "tool, not article" framing. Trade-off: less aggressive author signaling at first paint vs. tool-like density above the fold. Mitigation: the hub's title band (#2 above) is the always-visible attribution surface.

## Satellite page anatomy

**Visual posture:** the satellite is *Gulli's chapter, with our marginalia* — not "our reference page that cites him." The `<InTheBookPanel>` is the visually dominant element of the page, with cover thumbnail, large chapter title, and prominent CTAs. Our content sits beneath, framed by an explicit divider — **"Detached Node's notes →"** — that signals when we shift from honoring his work to commenting on it.

The page is composed of: 5 chrome elements (rendered by template, no per-pattern work), 1 hero panel (auto-derived from pattern data), 1 marginalia divider, 7 authored content slots, and 1 author-reserved placeholder. The 7 authored slots are what subagents fill in.

### Chrome (rendered by template wrapper)

- **(C1)** Breadcrumb back to hub + "Chapter N" indicator (book chapter numbering, not "pattern N of 21" — we don't gamify the book)
- **(C2)** `<PatternHeader>` — Part eyebrow, pattern name, "Chapter N of *Agentic Design Patterns* by [Antonio Gulli](https://www.linkedin.com/in/searchguy)" subtitle. Author name is a link to Gulli (LinkedIn `/searchguy`), not the book.
- **(C3)** `<PrevNextNav>` after the body — prev/next within Part. Labeled "Previous chapter" / "Next chapter" — book language, not site language.
- **(C4)** Compact `<BookCitationCard variant="compact">` — small cover thumb + title + ISBN + "Open in the book →" CTA
- **(C5)** Closing outbound CTA row: "Open Chapter N in the book →" (Google Doc) + "Buy print (royalties to Save the Children) →" + "PDF mirror (community, @AnkunHuang) →"

### Hero panel (auto-derived from pattern data)

- **`<InTheBookPanel>`** — visually dominant. Large card with cover thumbnail, chapter title in large type, page range, and 4 prominent CTAs in canonical order (Google Doc → Springer → Amazon-with-charity → community mirror). The reader's eye lands here first.

### Marginalia divider

- **`<MarginaliaDivider>`** — thin label "**Detached Node's notes →**" in mono uppercase. Signals the voice shift from honoring his work to commenting on it.

### Authored content slots (subagents fill these)

1. **Overview** — 2-3 paragraph summary (`pattern.bodySummary`) in our voice, framed beneath the divider as marginalia
2. **Mermaid diagram** — `<MermaidDiagram source={pattern.mermaidSource} />`. Caption: "Our diagram, inspired by the pattern Gulli describes in Chapter N. See the book for his original."
3. **When to use / When NOT to use** — two bullet lists side by side. Framed as "the inverse list, surfaced for skim-readers who already know when they want it" — utility framing, not "differentiator" framing.
4. **Implementation sketch** — TypeScript code snippet (~15 lines) using Vercel AI SDK or relevant non-LangChain SDK. Framed: "A TypeScript counterpart for readers arriving via Vercel AI SDK. The book's Python/LangChain examples are canonical." Must compile (see `scripts/typecheck-sketches.ts`).
5. **Real-world examples** — 3 short bullets, each citing a public, observable system (named OSS agent, public paper, etc.). Not invented.
6. **Reader gotcha (optional)** — replaces the previous "common failure mode in our POV." Operational: "Things people writing about this pattern in public have flagged as easy to get wrong." Sourced (citation in the bullet). **Allowed to be empty** if we don't have a sourced gotcha — better than fabricating one. Never invent failure modes for patterns we haven't deployed.
7. **Related patterns** — chip row linking to 2-4 sibling patterns

### Author-reserved placeholder

- **"From the author"** — empty by default, structurally present. If Gulli ever wants to leave a quote, correction, or note on a specific pattern, this is where it lives. The outreach explicitly tells him this surface exists. Renders as nothing when `pattern.fromAuthor === undefined`.

### Hero-panel detail (`<InTheBookPanel>`)

CTA hierarchy (top to bottom):
- **Open in the book →** (primary, accent-bordered) — Google Doc anchor for this chapter (Gulli's own canonical)
- **Springer →** (secondary outline)
- **Buy print (royalties to Save the Children) →** (secondary outline, with a `★` glyph). **Amazon URL must NOT carry an affiliate tag** — codified in `BOOK_LINKS` and enforced by lint rule.
- **PDF mirror (community, @AnkunHuang) →** (tertiary; smaller; clearly labeled as a community mirror, not Gulli's repo)

The user's brief said "links to chapters and parts of the book on GitHub" — but Gulli's own canonical is the Google Doc. We honor the brief's intent (deep-link to the chapter the reader needs) while honoring the author's choice of canonical (Google Doc, not a GitHub fork he didn't author).

## Schema.org / SEO infrastructure

### Hub
- `Article` schema (matches `failure-modes` pillar precedent — pillar pages are hub documents, not blog posts)
- `BreadcrumbList` (2-level: Home > Agentic Design Patterns)
- `Article.mentions: [...21 Pattern @ids]`
- `Article.isBasedOn: { @id: BOOK.id }`
- `Book` node included in the schema array

### Each satellite
- `Article` schema (NOT multi-typed with `LearningResource` — we summarize, we don't teach; using `LearningResource.teaches` on derivative summaries is exactly the schema-spam pattern Google quality raters penalize)
- `BreadcrumbList` (3-level: Home > Agentic Design Patterns > Pattern Name)
- `isBasedOn: { @id: BOOK.id }` — the load-bearing relationship
- Optional `citation: [...]` for any third-party paper the chapter references (and that we link to in slot 5 / 6 — `realWorldExamples.sourceUrl` or `readerGotcha.sourceUrl`)
- `Article.author = AUTHOR_CONFIG` (detached-node, the page's author) — never confused with `isBasedOn.author` (Gulli, the book's author)

### Other SEO assets
- `metadata.alternates.canonical` set per page (no trailing slashes)
- Per-page unique `<meta description>`
- 22 entries added to `src/app/sitemap.ts` (hub at priority 0.95, satellites at 0.8)
- Per-pattern OG images via `next/og` — single template at `src/app/(frontend)/agentic-design-patterns/[slug]/opengraph-image.tsx`, dynamic title from pattern data
- Hub OG image at `src/app/(frontend)/agentic-design-patterns/opengraph-image.tsx`
- Add `"agentic design patterns"`, `"AI agent design patterns"`, `"agent design patterns"` to `siteKeywords` in `src/lib/site-config.ts`
- All outbound links to the book use `rel="noopener"` (intentionally NOT `nofollow` — we want to pass authority outward)

### `BOOK_LINKS` map (single source-of-truth for outbound URLs)

To prevent URL drift across 22 pages and the GitHub repo restructuring underneath us, all canonical URLs to the book live in one map at `src/data/agentic-design-patterns/book-links.ts`:

```ts
// Canonical author-controlled sources (Gulli himself).
// These are what we link to FIRST when sending readers to "the book."
export const CANONICAL_BOOK_LINKS = {
  googleDoc: 'https://docs.google.com/document/d/1rsaK53T3Lg5KoGwvf8ukOUvbELRtH-V0LnOIFDxBryE/preview',
  springer: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
  amazon: 'https://www.amazon.com/Agentic-Design-Patterns-Hands-Intelligent/dp/3032014018',
  // NOTE: Amazon link MUST NOT carry an affiliate tag, ever. The royalties go to Save the Children — that is the gesture, untainted.
} as const

// Community-maintained PDF mirror — NOT Gulli's repo (he hosts canonically on Google Docs and Springer).
// Treat this as a mirror maintained by the community; credit the maintainer; secondary CTA only.
export const COMMUNITY_MIRROR = {
  githubRepo: 'https://github.com/AnkunHuang/Agentic_Design_Patterns',
  maintainerHandle: '@AnkunHuang',
  pdfDownload: 'https://github.com/AnkunHuang/Agentic_Design_Patterns/raw/main/Agentic_Design_Patterns.pdf',
} as const

export const SUPPORTING_LINKS = {
  saveTheChildren: 'https://www.savethechildren.org/',
  authorLinkedin: 'https://www.linkedin.com/in/searchguy',
  authorTwitter: 'https://twitter.com/antoniogulli',
  authorScholar: 'https://scholar.google.com/citations?user=wfiEFPQAAAAJ',
  authorManning: 'https://www.manning.com/authors/antonio-gulli',
} as const

// Per-chapter Google Doc anchors are populated by Phase 1 once we crawl the doc
// to extract heading IDs. Until then, all chapter links go to the doc root.
export const CHAPTER_GOOGLE_DOC_ANCHORS: Record<number, string | null> = {
  1: null, // populated in Phase 1
  // ...
}
```

**The hierarchy of "the book" links** (used everywhere we surface CTAs):
1. **Google Doc** (Gulli's own canonical) — primary CTA, "Open in the book →"
2. **Springer** (publisher canonical) — secondary, "Springer →"
3. **Amazon** (with the Save-the-Children royalty note) — secondary, "Buy print →"
4. **Community mirror PDF** (`AnkunHuang/Agentic_Design_Patterns`) — labeled as "PDF mirror (community)" with maintainer credit; tertiary CTA for readers who specifically want a git-hosted PDF

A weekly scheduled GitHub Action runs `scripts/check-book-links.mjs` — HEADs every URL in `BOOK_LINKS`, opens an issue if any returns non-200. Cheap insurance against the GitHub repo or Google Doc moving.

### Author-of-page identity
The schema's `Article.author` for these 22 pages names **Julian Ken** as the human author, with `affiliation` set to "Detached Node" (the publication). This differs from the global `AUTHOR_CONFIG`-based `author` used on Posts: editorial principle #14 requires Julian's real name to appear in the schema and the satellite footer for *this feature only* — the rest of the site can keep the pseudonymous default. Gulli is always `isBasedOn` (the book's author), never `author` (of these pages). The hub footer reinforces: "Maintained by Julian Ken (writing as Detached Node)."

## Cross-cutting concerns

### Accessibility (a11y)
- Filter chips: `<button>` elements (not divs); arrow-key navigation between chips; `aria-pressed` for active state
- Search input: visible label (`aria-label="Search 21 patterns"`); `/` shortcut listens at the document level but ignores key events when target is a textarea/input/contenteditable (prevents focus theft)
- Focus order: skip-to-content link → site nav → search → filter chips → first card → grid in source order
- Pattern cards: `<a>` (the whole card is the link); ensure visible focus ring uses existing `focus-ring` class
- Color contrast: every text/background pair tested against WCAG AA 4.5:1 in both light + dark; the muted `zinc-500` on `zinc-50` in our design tokens passes
- Mermaid diagrams: include `aria-label` describing the diagram's content (subagents author this in the data file as `mermaidAlt: string`)
- Reduced motion: respect `prefers-reduced-motion` for FadeReveal, scroll-driven animations, and view transitions

### Analytics taxonomy

All events go through Detached Node's existing analytics pipeline. New event names for this feature:

| Event | Trigger | Properties |
|---|---|---|
| `agentic_patterns_hub_view` | Hub page mount | `referrer`, `viewport_width` |
| `agentic_patterns_filter_change` | User clicks a Part chip | `from_part`, `to_part` |
| `agentic_patterns_search` | User submits a search (debounced 300ms) | `query_length`, `result_count` |
| `agentic_patterns_card_click` | User clicks a `<PatternCard>` | `slug`, `partId`, `position_in_grid` |
| `agentic_patterns_satellite_view` | Satellite page mount | `slug`, `partId`, `referrer` |
| `agentic_patterns_outbound_click` | User clicks any outbound CTA on hub or satellite | `destination` (`github` \| `google_doc` \| `springer` \| `amazon` \| `save_the_children` \| `author_linkedin` \| `author_x`), `surface` (`hub_book_card` \| `satellite_in_book_panel` \| `satellite_closing_cta`), `pattern_slug` (if applicable) |
| `agentic_patterns_related_click` | User clicks a related-pattern chip on a satellite | `from_slug`, `to_slug` |
| `agentic_patterns_prev_next` | User clicks prev/next nav | `from_slug`, `to_slug`, `direction` |

The `outbound_click` event with `destination=github` is the proxy for "did this page actually help readers reach the source?" — the headline metric we care about (private; not surfaced).

### Performance budget

| Page | LCP target | CLS | TBT | JS shipped (transferred) | Lighthouse perf |
|---|---|---|---|---|---|
| Hub | ≤ 1.8s on Slow 4G | < 0.05 | < 200ms | ≤ 30KB (search component is the only client JS beyond global) | ≥ 95 |
| Satellite | ≤ 1.5s on Slow 4G | < 0.05 | < 100ms | ≤ 50KB (mermaid runtime dominates; lazy-loaded after first paint) | ≥ 95 |

Mitigations:
- Mermaid runtime is lazy-loaded via `next/dynamic` with `ssr: false` and `loading` skeleton (already the pattern in `MermaidDiagram.tsx`)
- Crimson Pro + JetBrains Mono are subset to Latin and use `display: swap`
- OG images cached by Vercel edge (force-static + immutable)
- Hub uses CSS Container Queries (no JS for responsive behavior)

### Mobile

- Sticky search/filter row collapses on mobile: search bar full-width on its own row; filter chips horizontally scrollable on a second row with `overflow-x-auto` + scroll snap
- Pattern cards stack to 1 column under 480px container width (Container Queries, not viewport breakpoints)
- `<InTheBookPanel>` outbound CTAs stack vertically under 360px; full-width tap targets ≥ 44px tall
- Mermaid diagrams: pinch-zoom enabled (already supported via `MermaidDiagram` lightbox)

### Search component spec

- **Algorithm:** prefix + substring match across `pattern.name`, `pattern.oneLineSummary`, and `pattern.partId` label, ranked by: exact name match > name prefix > name substring > summary substring > part match. No external library; single function in `src/lib/pattern-search.ts`.
- **Behavior:** search filters the visible cards client-side (no server round-trip); empty query shows all 21; no-results state shows a "no patterns matched X" message + a "clear search" button
- **Debouncing:** 150ms after last keystroke before re-rendering grid
- **URL state:** Filter chip state lives in `?part=` (shareable; teammates can paste a "Foundations only" link). Search query is **not** in URL state (YAGNI for 21 items; share via screenshot). SSR reads `?part=` and renders the filtered grid server-side.
- **Keyboard:** `/` focuses the search bar (only when focus isn't already in an input/textarea/contenteditable, to avoid stealing focus from forms); `Esc` clears the search; `Enter` is a no-op (filter is live); `Tab` moves to first chip
- **Accessibility:** `<input type="search">` with `aria-label`; live region (`aria-live="polite"`) announces `n results` after debounce settles

### Internationalization
v1 is English-only. Components use `lang="en"` on the `<html>` element (already set globally). No translation files; copy lives inline.

### Content licensing
Before Phase 1 commits the PDF, a one-time licensing check confirms: (a) the PDF is publicly hosted by the author with intent to distribute (yes, per the GitHub repo + Save-the-Children royalty model), (b) we link to the canonical source rather than redistributing, (c) we never quote more than 2 sentences in any single satellite, (d) all diagrams are original — never reproduced from the book. Documented in `docs/agentic-design-patterns/LICENSE-NOTICE.md`.

## Build sequence

This project is delivered via **parallel agentic work**, not a staged editorial calendar. After Phase 1 ships the scaffold and one template-proving pattern, the remaining 20 patterns are authored by subagents dispatched against GitHub sub-issues in waves.

### Phase 1 — Scaffold + template + one proving pattern + agentic prerequisites

Phase 1 ships everything Phase 2's parallel subagents need to succeed. If any of these is missing, Phase 2 dispatch will block.

**Code & data scaffold:**
1. Create `src/data/agentic-design-patterns/` directory with `types.ts`, `parts.ts`, empty `index.ts` barrel, and 21 stub `patterns/<slug>.ts` files (each: `oneLineSummary` only, other fields placeholder)
2. Create `src/data/agentic-design-patterns/README.md`
3. Build hub route + `<HubHero>`, `<HubGrid>`, `<HubSearchBar>`, `<PatternCard>` — renders all 21 cards (linking to satellite stubs)
4. Build satellite route + template (`<PatternHeader>`, `<InTheBookPanel>`, `<PatternBody>` — implementing the 8 content slots, `<BookCitationCard>`, `<PrevNextNav>`)
5. Build `BOOK_CONFIG` + `generateBookSchema()` + `generateHubChildBreadcrumb()` in `src/lib/schema/`
6. Wire up sitemap entries and per-page metadata; set `dynamicParams: false` on the satellite route so unknown slugs 404 cleanly
7. **Author one pattern fully** (recommended: **Reflection** — short chapter, well-understood concept, exercises every slot of the template). This is the template proof, the editorial-voice anchor, and the reference exemplar that every Phase-2 subagent will read before authoring its own pattern.
7a. **Wire the kill-switch feature flag** — `AGENTIC_DESIGN_PATTERNS_PUBLIC` env var, defaulting to `false`. Routes return `notFound()` and emit `noindex` when off. Exclude the routes from `sitemap.ts` while off. Document the flip mechanism in `src/data/agentic-design-patterns/README.md`. (See "If Gulli says no" section.)
7b. **Write the "Why this page exists" letter** — a real, two-paragraph letter from Julian Ken (real name) addressed to Antonio Gulli. States: this was built without contacting him first as a fan companion, what we wrote and what we explicitly didn't, that the kill-switch defaults closed, and a one-click takedown contact (mailto link). Lives at `src/app/(frontend)/agentic-design-patterns/why-this-exists/page.tsx`. Linked from hub footer.
7c. **Build the `<AboutAntonioGulli>` panel data** — short bio paragraph (drawn from his public profile, no fabrication), a portrait link to his Google Scholar profile photo (linking, not embedding, to avoid rights questions), and a curated list of *his* work links (Manning books, Scholar publications, his other Springer titles, his X / LinkedIn). Lives in the BOOK_LINKS module.

**Agentic-dispatch prerequisites (must exist before Phase 2 can dispatch — kept deliberately lean):**

8. **Commit the source PDF** to the repo at `docs/agentic-design-patterns/Agentic_Design_Patterns.pdf` (with a brief LICENSE-NOTICE.md noting it's the publicly-distributed PDF; we use it for fact-checking, do not redistribute, and link readers to the canonical sources). Subagents read pages from this committed copy.
9. **Write `docs/superpowers/specs/agentic-design-patterns-style-guide.md`** — the voice rules (terse, diagnostic, second-person imperative for "When to use" bullets, third-person observational for prose), the attribution rules (the 11 from this spec), the "no paraphrasing the book" rule with worked examples (good vs. bad), the mermaid security rules. Single short doc, not a system prompt.
10. **Add `scripts/check-pattern-overlap.mjs`** as an *optional manual tool* (not a CI gate) — word-level Jaccard between a pattern's `bodySummary` and its corresponding book chapter pages, exempting proper-noun runs (chapter titles, framework names like "LangGraph"/"Crew AI"). Julian runs it during PR review when prose feels too close to the source. Runs locally; not wired into GitHub Actions in v1.
11. **Add `scripts/typecheck-sketches.ts`** — compiles every `Pattern.implementationSketch` against `@ai-sdk/openai` (or `@ai-sdk/anthropic`/equivalent) types in a sandbox. Run as part of `npm run lint`. Catches fabricated code before merge. *This is the single most important guardrail* — it directly addresses the "invented but plausible" failure mode for patterns without a canonical SDK shape.
12. **Hand-write 2 implementation sketches as a Phase-0 spike** for the patterns most likely to invite fabrication: **A2A** (no canonical SDK) and **MCP** (canonical SDK exists but isn't Vercel AI SDK). Time the work. If a single sketch takes >45 min to produce something honest, *the parallel-subagent plan is fiction* and Phase 2 must be re-shaped (e.g., sequential authoring, smaller scope, or sketch-omission for those patterns).
13. **Add `STYLE_PASS` checklist** to `agentic-design-patterns/README.md`: every PR-author subagent must check off these items in the PR body — the same items Julian checks during review.

### Phase 2 — GitHub epic + 20 sub-issues, dispatched to subagents in waves

1. **Create GitHub epic issue** "Author all 21 agentic design pattern satellites" — pinned, lists all 20 remaining sub-issues, links: the Phase-1-authored Reflection page as the template exemplar, the style guide, the committed PDF, the `STYLE_PASS` checklist.
2. **Create 20 sub-issues**, one per remaining pattern. Each uses the sub-issue template (below).
3. **Resolve cross-link dependencies first.** `relatedSlugs` build-fails if any target doesn't exist. Every Phase-1 stub already exports the pattern with `relatedSlugs: []`; Phase 2 PRs *populate* `relatedSlugs` only after both ends of the link exist. Julian enforces this during review — a PR setting `relatedSlugs: ['x']` is only mergeable if `x.ts` already has populated content (not just stub).
4. **Dispatch subagents in waves of 4-5 patterns** to keep PR review tractable. Wave order: prefer Part 1 patterns first (other patterns reference them as related); then Part 2; then Parts 3 & 4 in parallel.
5. **Julian reviews every PR** using his standard workflow (Claude Code as code-review companion). The review checks:
   - Slot completeness (all 8 content slots populated; no placeholders)
   - Voice match against the Reflection exemplar (qualitative, eyeball)
   - Implementation sketch passes `npm run lint` (which includes `scripts/typecheck-sketches.ts`)
   - Mermaid renders (visual confirmation in dev server)
   - No prose drift toward the book chapter (eyeball; optional `scripts/check-pattern-overlap.mjs` if it feels close)
   - Cross-links resolve
   - All outbound URLs return 200 (CI link-check workflow)
6. **If a PR fails review:** Julian comments with specifics. The originating subagent (or a fresh dispatch) re-attempts. No formal retry counter; if a pattern proves intractable for the agent, Julian writes it himself.
7. **Final consistency pass** once all 21 are merged: Julian re-reads all 21 satellites in sequence, fixes any cross-pattern drift in language or structure. Single-pass, single editor.

> **What this spec deliberately does NOT build:** a dedicated reviewer agent with its own system prompt, a GitHub Actions workflow that auto-dispatches review on PR open, an n-gram CI gate, or a formal retry/escalation queue. These are platform investments that would amortize across many future authoring projects — not justified for one-shot content. The `typecheck-sketches.ts` script *is* in scope because it catches the highest-risk failure mode (fabricated code) cheaply and stays useful for any future TypeScript snippet authoring.

### Phase 3 — Polish and launch
- Hand-designed OG images for the hero patterns (most-shareable)
- Analytics events for outbound clicks (measure how many readers reach the book)
- Author outreach to Gulli (LinkedIn + X) with preview link before public launch
- Launch push: HN Show, Lobste.rs, AI newsletters
- Add the page to global site nav

### Sub-issue template (for the GitHub epic)

```markdown
## Pattern: {NAME} (Chapter {N})

**Slug:** /agentic-design-patterns/{slug}
**Part:** {PART}
**PDF pages:** {start}-{end}
**Frameworks in book chapter:** {LangChain | LangGraph | Crew AI | Google ADK}

### Reference exemplar
The Reflection satellite page at `/agentic-design-patterns/reflection` is the canonical template for tone, depth, and structure. Read it before authoring this pattern. Do not deviate from its 8-slot structure.

### Source material
Read pages {start}-{end} of `docs/agentic-design-patterns/Agentic_Design_Patterns.pdf`. Use the chapter to confirm conceptual accuracy ONLY — do not paraphrase its prose. See the style guide for "good vs. bad paraphrase" examples.

### Slots to populate (edit `src/data/agentic-design-patterns/patterns/{slug}.ts`)
- `bodySummary: string[]` — 2-3 paragraphs (~300 words) in the Detached Node voice — UNDER the "Detached Node's notes →" divider, framed as marginalia, not replacement
- `mermaidSource: string` + `mermaidAlt: string` — original Mermaid diagram (labeled boxes only — no icon shortcodes; `securityLevel: 'strict'` will reject them) plus an alt-text describing it for screen readers. Caption renders as: "Our diagram, inspired by the pattern Gulli describes in Chapter N. See the book for his original."
- `whenToUse: string[]` — 3-5 bullets
- `whenNotToUse: string[]` — 2-3 bullets (utility framing — "the inverse list, surfaced for skim-readers" — NOT framed as differentiator vs. the book)
- `realWorldExamples: ReaderGotcha[]` — 3 short bullets, each citing a public, observable system (named OSS agent, public paper, etc.) — NOT invented
- `implementationSketch: string` — ~15 lines TypeScript, Vercel AI SDK or relevant non-LangChain SDK (the book uses Python/LangChain). **Must compile** against types in `scripts/typecheck-sketches.ts` — fabricated code will fail `npm run lint`. Framed as a TypeScript counterpart, NOT an upgrade or correction.
- `readerGotcha?: { text: string; sourceUrl: string }` — operational gotcha cited from a public source (paper, public discussion, named OSS report). **Allowed to be undefined** if no sourced gotcha exists — better than fabricating one. (Replaces the prior "failureMode in Detached Node's POV" — we don't claim deployment authority.)
- `relatedSlugs: string[]` — 2-4 sibling patterns whose `patterns/<slug>.ts` is already populated (not stub)
- `fromAuthor?: string` — leave undefined unless Gulli has provided a quote/correction/note specifically for this pattern; the slot exists structurally so we can drop in his voice if/when he ever wants to

### STYLE_PASS checklist (paste into PR body, check each item)
- [ ] All 8 slots populated; types compile (`npm run typecheck`)
- [ ] `npm run lint` passes (includes implementation-sketch type-check)
- [ ] Read the style guide; voice matches the Reflection exemplar
- [ ] No prose copied or paraphrased from the book chapter (ran `scripts/check-pattern-overlap.mjs` if prose felt close)
- [ ] Mermaid diagram renders in `npm run dev` (visual check; alt text written)
- [ ] All outbound URLs in this PR return 200
- [ ] Cross-links in `relatedSlugs` resolve to populated patterns (not stubs)
- [ ] Did NOT modify any other pattern's file
```

## Testing strategy

- **Unit tests** for `getPattern`, `getPatternsByPart`, `getAdjacentPatterns`, slug consistency (all 21 slugs match data)
- **Schema validation tests** — every page emits valid JSON-LD; `Book.isbn`, `BreadcrumbList.itemListElement` shapes correct
- **Mermaid render smoke** — every `mermaidSource` parses without error (using the existing converter pipeline)
- **Playwright E2E** smoke per page type:
  - Hub: filter chips switch state, search returns expected hits
  - Satellite (one example): InTheBookPanel renders, prev/next links work, mermaid diagram renders
- **Link integrity** — every URL in `BOOK_LINKS` (canonical + community mirror + supporting links) returns 200; weekly scheduled `scripts/check-book-links.mjs` opens an issue on failure
- **Sitemap test** — verify all 22 URLs are present after a build

## Out of scope for v1 (deliberate)

- Search across pattern *bodies* (only across names + summaries for v1)
- Filter dimensions beyond Part (no journey-stage / use-case / framework filters)
- Live pattern sandbox / interactive simulation
- Command palette (⌘K)
- Collapsible part sections (per user decision; deferred to v2 after usage signal)
- Per-pattern hand-designed OG images (auto-generated for now; hand-designed as a subset later)
- A 22nd page for Appendix A (Advanced Prompting Techniques) — deferred indefinitely; reconsider only after v1 ships and we hear demand
- CMS migration of pattern data — only if editing convenience materially exceeds git-tracked authorship benefit

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Voice inconsistency across 21 parallel-authored satellites** — subagents drafting in parallel will produce 21 different tones | Mandatory pre-authoring read of the Phase-1 Reflection exemplar; style-guide doc at `docs/superpowers/specs/agentic-design-patterns-style-guide.md`; Julian reviews every PR (his standard workflow); final cross-pattern consistency pass after all 21 are merged |
| **DMCA / Springer sensitivity** — companion sites for unreleased books can attract publisher attention | Pre-launch outreach to Gulli; explicit "not affiliated" disclaimer in footer; zero PDF hosting; original prose discipline (rule #4) |
| **Cold-start authority** — domain lacks backlinks to outrank Anthropic | Launch push (HN, Lobste.rs, AI newsletters) + author outreach (a single backlink from Gulli would 10× our trust signal) |
| **Mermaid `securityLevel: 'strict'` breaks diagrams using icon shortcodes** | Diagram standard: labeled boxes only (no icons). Code review enforces this on every `mermaidSource`. |
| **Page numbering discontinuity in PDF** — Part III appears to renumber | Use chapter numbers as primary citation; capture exact pages once a clean version-controlled PDF lands in repo |
| **Routing-agent findings are single-source** — one agent ran all 3 streams inline | Per-pattern table verified manually before populating `bodySummary`. Chapter 17 (Reasoning Techniques) and Chapter 20 (Prioritization) were inferred — re-read directly before writing those satellites. |
| **Subagent context dilution** — each subagent sees only its sub-issue, may miss cross-pattern references or repeat what other agents are doing | Epic issue carries the shared style guide, the canonical exemplar link, and a "patterns already in flight" status table; build fails if any `relatedSlugs` target doesn't exist (TypeScript `keyof typeof PATTERNS` constraint) |
| **Subagent paraphrases the book** — easiest failure mode for an LLM given source text | Style guide includes worked good-vs-bad paraphrase examples; Julian eyeballs prose during PR review; `scripts/check-pattern-overlap.mjs` available as optional manual tool when prose feels too close |
| **Subagent fabricates an `implementationSketch` for patterns without a canonical SDK shape** (A2A, MCP, Multi-Agent) — the spec's highest-priority single risk | `scripts/typecheck-sketches.ts` compiles every sketch against `@ai-sdk/openai`/equivalent types as part of `npm run lint`; Phase-0 spike hand-writes 2 sketches as a calibration check before parallel dispatch |
| **Reviewer drift past wave 3** — if we used a separate reviewer agent, its judgments would compound voice drift across waves | Mitigated by removing the reviewer agent entirely; Julian's eye is the single anchor across all 20 PRs |
| **Sustainability past launch** — agentic-dispatch infrastructure has no consumers after the 21 satellites are written | Built only the infra that earns its keep beyond this project: `BOOK_LINKS` map, `typecheck-sketches.ts`, kill-switch flag pattern. The reviewer-agent / GitHub Action / n-gram CI gate were deliberately *not* built. |
| **Voice mismatch hub-to-site** — site is mono/terminal; satellite content is reference prose | Use existing `globals.css` typography (Crimson Pro for prose, JetBrains Mono for code/labels). No new fonts. |

## "If Gulli says no" — kill switch and rollback plan

Outreach happens in Phase 3 *before* public launch (Phase 3 step 3). The window between Phase 2 completion (21 satellites merged) and Phase 3 outreach is the kill-switch window. If Gulli responds negatively (DMCA, "please don't," any flavor of objection), the response must be reversible without complex git surgery.

**The mechanism:**

- All 22 routes are gated behind a server-side feature flag `AGENTIC_DESIGN_PATTERNS_PUBLIC` (env var, default `false`)
- When `false`: the routes return `notFound()` for unauthenticated visitors; admin/preview tokens still see them; sitemap excludes them; `<meta name="robots" content="noindex,nofollow">` set
- When `true`: routes are publicly accessible and indexed; sitemap includes them
- Outreach to Gulli happens **with the flag still off** — a private preview link uses an admin token

**Outreach policy (silence is NOT consent):**

- Initial outreach: LinkedIn DM + X reply, with the preview link, the kill-switch description, and an explicit invitation to ask for changes or takedown before any public flip
- If no response in 14 days: gentle follow-up
- If still no response in 30 days total: **the flag does NOT flip**. Silence is not permission. We try one more outreach channel (email via a public address if discoverable; otherwise wait)
- Public flip happens only after explicit positive response from Gulli, OR after 60 days of silence with documented good-faith outreach attempts AND a final-warning post on his most-recent public thread linking the preview
- If at any point Gulli responds with anything less than enthusiasm, default behavior is "do not flip; ask what he wants"

**If Gulli objects after public launch** (worst case): set the flag back to `false` (one env var change, immediate). The 22 routes start returning 404; sitemap drops them on next regeneration. The git history is preserved so we can revisit the conversation. We do not delete the branch or the data.

**Other rollback levers** if a partial response is appropriate:
- Add `<meta name="robots" content="noindex">` per-page (keep the page accessible but de-rank it)
- Strip the `BookCitationCard` and `InTheBookPanel` if Gulli wants no association at all (page becomes purely Detached Node's own analysis)
- Hide the satellites but keep the hub as a meta-page about the book (link only, no summaries)

The kill switch is documented in `src/data/agentic-design-patterns/README.md` so future maintainers know how to flip it.

## Pre-launch checklist (before public URL)

**Content & build:**
1. [ ] All 21 satellites authored, reviewed, voice-passed
2. [ ] Phase-0 spike done: 2 hand-written `implementationSketch`es validated as honest TypeScript
3. [ ] Schema validates in Google's Rich Results Test for hub + 3 random satellites; no `LearningResource.teaches` misuse
4. [ ] All outbound links in `BOOK_LINKS` return 200 (manual verification + scheduled `check-book-links.mjs`)
5. [ ] Amazon URL contains no affiliate tag (lint rule + manual review)
6. [ ] Sitemap includes all 22 URLs *only when flag is on*
7. [ ] OG images render correctly for hub + 5 random satellites; no over-claim copy in any OG
8. [ ] Mobile review on iPhone + Android
9. [ ] Lighthouse score ≥ 95 on hub and 3 random satellites
10. [ ] Footer disclaimer present on hub and every satellite

**Honoring the author:**
11. [ ] "Why this page exists" letter is real, signed Julian Ken (real name), with working contact link
12. [ ] `<AboutAntonioGulli>` panel renders with curated links to *his* work (no purchase links in this panel)
13. [ ] Every Gulli mention links to him (LinkedIn or Scholar) at least once per page
14. [ ] Every "common failure mode" / "reader gotcha" cites a public source — none are fabricated
15. [ ] Cover thumbnail sources don't violate Springer rights (link, don't embed; or embed with permission documented)
16. [ ] No "Pattern N of 21" Pokédex framing — uses "Chapter N" book language throughout
17. [ ] No "differentiator" / "improve on" / "definitive" language anywhere in copy or schema descriptions
18. [ ] Daniele Salatti / @AnkunHuang mirror credit present where the community PDF is referenced

**Outreach gating:**
19. [ ] Outreach drafts ready: LinkedIn DM to `/searchguy`, X reply tagging `@antoniogulli`, both linking the *private* preview
20. [ ] Outreach explicitly invites response and explains the kill switch
21. [ ] Outreach explicitly tells Gulli the "From the author" placeholder per pattern is his to fill if he wants
22. [ ] Hacker News, Lobste.rs, AI newsletter outreach drafts ready — but **gated behind Gulli's positive response** or 60-day documented good-faith silence
23. [ ] Kill-switch feature flag wiring tested (flip on → 22 routes accessible + indexable; flip off → 22 routes 404 + noindex + sitemap drops them on next regeneration)

**Final ethical review:**
24. [ ] One-pass read of every visible artifact (every page, OG image, schema description, alt text, copy fragment) by Julian, asking "would Gulli love this?" — fix anything that fails the test before flag flip

## Success metrics (private — internal planning only, never surfaced in artifacts Gulli might see)

These live in this spec for internal alignment only. Do not duplicate into copy, OG images, code comments, PR descriptions, or anywhere indexable. Goals:

- ≥ 100 unique outbound clicks to the GitHub-repo CTA in the first 90 days (proxy for "real help reaching the source")
- ≥ 50 unique outbound clicks to the Springer/Amazon CTAs in the first 90 days (proxy for "honoring royalties to Save the Children")
- Antonio Gulli engages publicly with the page (acknowledgment, screenshot, share)
- Zero DMCA / cease-and-desist
- Organic search visibility growth — measured via existing search-console pipeline; specific ranking thresholds not committed in writing
