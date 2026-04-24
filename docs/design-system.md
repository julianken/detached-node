# Design System Documentation

This document defines the visual design system for Detached Node, ensuring consistency across all pages and components.

## Color Palette

### Light Mode

| Usage | Tailwind Class | Hex | Notes |
|-------|---------------|-----|-------|
| **Page Background** | `bg-white` | `#ffffff` | Main body background |
| **Surface/Card** | `bg-zinc-50` | `#fafafa` | Cards, elevated elements |
| **Borders (Standard)** | `border-zinc-200` | `#e4e4e7` | Card borders, dividers |
| **Borders (Subtle)** | `border-zinc-200` | `#e4e4e7` | Footer, section dividers |
| **Text (Primary)** | `text-zinc-900` | `#18181b` | Headings, body copy |
| **Text (Secondary)** | `text-zinc-600` | `#52525b` | Descriptions, paragraphs |
| **Text (Tertiary)** | `text-zinc-500` | `#71717a` | Metadata, timestamps, captions |

### Dark Mode

| Usage | Tailwind Class | Hex | Notes |
|-------|---------------|-----|-------|
| **Page Background** | N/A (CSS var) | `#0a0a0a` | Main body background via `--background` |
| **Surface/Card** | `dark:bg-zinc-800` | `#27272a` | Cards, elevated elements |
| **Borders (Standard)** | `dark:border-zinc-700` | `#3f3f46` | Card borders, dividers |
| **Borders (Subtle)** | `dark:border-zinc-800` | `#27272a` | Footer, section dividers |
| **Text (Primary)** | `dark:text-zinc-100` | `#f4f4f5` | Headings, body copy |
| **Text (Secondary)** | `dark:text-zinc-400` | `#a1a1aa` | Descriptions, paragraphs |
| **Text (Tertiary)** | `dark:text-zinc-500` | `#71717a` | Metadata, timestamps, captions |

### Interactive States

| State | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| **Hover (Background)** | `hover:bg-zinc-50` | `dark:hover:bg-zinc-800` | Cards, buttons |
| **Hover (Border)** | `hover:border-zinc-400` | `dark:hover:border-zinc-500` | Interactive cards |
| **Hover (Text)** | `hover:text-zinc-900` | `dark:hover:text-zinc-100` | Links, nav items |
| **Active/Selected** | `bg-zinc-200` | `dark:bg-zinc-700` | Active states (rarely used) |

## Usage Guidelines

### Page Backgrounds

The page background uses CSS custom properties defined in `globals.css`:

```css
/* Light mode */
:root {
  --background: #ffffff;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
  }
}

body {
  background: var(--background);
}
```

**Do not** apply background classes to the body element. The background is handled via CSS custom properties.

### Cards and Surfaces

Cards use `zinc-50` in light mode and `zinc-800` in dark mode to create elevation above the page background:

```tsx
// Standard card
<div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
  {/* Card content */}
</div>

// Interactive card with hover state
<Link className="bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
  {/* Card content */}
</Link>
```

**Note:** Hover state in dark mode stays at `zinc-800` because the border change provides sufficient feedback. The base state has no background, so hover adds `zinc-800`.

### Nested Surfaces

Avoid deeply nested cards when possible. If you must nest a card within a card:

```tsx
// Outer card
<div className="bg-zinc-50 dark:bg-zinc-800">
  {/* Inner card - use white/zinc-700 for contrast */}
  <div className="bg-white dark:bg-zinc-700">
    {/* Inner content */}
  </div>
</div>
```

### Text Hierarchy

Use consistent text colors to establish visual hierarchy:

```tsx
// Headings - highest contrast
<h1 className="text-zinc-900 dark:text-zinc-100">Main Heading</h1>

// Body text - slightly reduced contrast for readability
<p className="text-zinc-600 dark:text-zinc-400">Body paragraph content...</p>

// Metadata, captions - lowest contrast
<span className="text-zinc-500 dark:text-zinc-500">Posted on Jan 1, 2025</span>
```

**Note:** Tertiary text uses `zinc-500` in both modes for consistent subtle appearance.

### Borders

Use standard borders for most UI elements, subtle borders for major page sections:

```tsx
// Standard borders (cards, form inputs, dividers)
<div className="border border-zinc-200 dark:border-zinc-700">

// Subtle borders (footer, major sections)
<footer className="border-t border-zinc-200 dark:border-zinc-800">
```

### Buttons

Button styles are defined in the `Button` component using class-variance-authority:

```tsx
// Primary button
<Button variant="primary">Submit</Button>
// Dark mode: dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300

// Secondary button
<Button variant="secondary">Cancel</Button>
// Dark mode: dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500

// Ghost button
<Button variant="ghost">Edit</Button>
// Dark mode: dark:text-zinc-100 dark:hover:bg-zinc-800
```

### Interactive Elements

Links and navigation items use text color changes for hover states:

```tsx
// Navigation links
<Link className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
  About
</Link>
```

## Component Reference

### Card

File: `src/components/Card.tsx`

Default styling:
- Border: `zinc-200` / `dark:border-zinc-700`
- Hover border: `zinc-400` / `dark:hover:border-zinc-500`
- Hover background: `zinc-50` / `dark:hover:bg-zinc-800`

### PostCard

File: `src/components/PostCard.tsx`

Identical styling to Card component, with additional typography:
- Title: `text-zinc-900 dark:text-zinc-100`
- Date: `text-zinc-500 dark:text-zinc-400`
- Summary: `text-zinc-600 dark:text-zinc-400`
- "Read more": `text-zinc-900 dark:text-zinc-100` with hover state

### Button

File: `src/components/Button.tsx`

Three variants:
- **Primary:** Inverted colors in dark mode (light button on dark background)
- **Secondary:** Bordered button with subtle colors
- **Ghost:** Text-only with hover background

## Consistency Checklist

Run this audit periodically to ensure consistency:

- [ ] All page backgrounds use `--background` CSS variable (no bg classes on body)
- [ ] All card surfaces use `bg-zinc-50 dark:bg-zinc-800`
- [ ] Standard borders use `border-zinc-200 dark:border-zinc-700`
- [ ] Subtle borders (footer, sections) use `border-zinc-200 dark:border-zinc-800`
- [ ] Text hierarchy follows primary (100)/secondary (400)/tertiary (500) pattern
- [ ] Interactive states use appropriate zinc shades
- [ ] Hover backgrounds are `zinc-50` / `dark:hover:bg-zinc-800`
- [ ] No use of zinc-600 or zinc-900 for backgrounds (except special cases)

## Special Cases

### About Page Callout

The about page has a special callout box that intentionally uses `dark:bg-zinc-900` to create a recessed appearance (darker than the page background). This is an exception to the standard card pattern.

```tsx
<section className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
  {/* Callout content */}
</section>
```

### Error Page Code Block

Error pages display code in a distinct surface:

```tsx
<pre className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
  {/* Error stack trace */}
</pre>
```

## Mermaid diagrams

### Authoring

In the Payload admin, open a post and scroll to the body field. Click **Add block** and select **Mermaid diagram**. Paste valid Mermaid source (e.g. `sequenceDiagram`, `flowchart`, `classDiagram`) into the `code` textarea. Save and publish as normal. No additional configuration is required.

### Rendering contract

- **Loading:** The ~500 KB `mermaid` runtime ships in the client bundle for `/posts/[slug]` routes. Runtime execution is client-side (the component is `'use client'`) and the SVG is generated post-hydration. Lazy-loading via `next/dynamic` is a future optimization.
- **Theme:** Follows `next-themes` `resolvedTheme`. The diagram re-renders on light/dark toggle; the SVG id regenerates each render.
- **Security:** Initialized with `securityLevel: 'strict'`. Click handlers and raw HTML embedded in diagram source are disabled. Do not author diagrams that depend on interactive features.
- **Error fallback:** Invalid Mermaid source renders as a styled `<pre>` block rather than throwing. The page remains functional.

### Source locations

| Artifact | Path |
|----------|------|
| Component | `src/components/MermaidDiagram.tsx` |
| Lexical converter | `src/lib/lexical/mermaid-converter.tsx` |
| Block config | `src/lib/lexical/blocks/mermaid.ts` |
| Test helper | `createRichTextWithMermaid` in `src/lib/rich-text.ts` |

### References

- Mermaid documentation: https://mermaid.js.org/
- Sequence diagram syntax: https://mermaid.js.org/syntax/sequenceDiagram.html

## Migration Notes

### Fixing Inconsistencies

When updating existing components:

1. Check if the component is a card/surface → should use `dark:bg-zinc-800`
2. Check if it's a special callout/recessed element → may use `dark:bg-zinc-900`
3. Verify border colors: standard = `zinc-700`, subtle = `zinc-800`
4. Ensure text hierarchy matches the three-tier system

### Adding New Components

When creating new components:

1. Start with the closest existing component as a template
2. Use Card or PostCard as the base for card-like elements
3. Reference this document for color decisions
4. Document any new patterns or exceptions in this file
