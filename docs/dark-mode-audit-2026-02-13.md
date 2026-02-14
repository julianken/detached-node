# Dark Mode Color Audit - February 13, 2026

This audit documents the current state of dark mode color usage across the codebase and validates consistency with the design system.

## Audit Scope

All components and pages checked for:
- Background color usage (zinc-800 vs zinc-900)
- Border color usage (zinc-700 vs zinc-800)
- Text color hierarchy (zinc-100, zinc-400, zinc-500)
- Interactive state consistency

## Findings Summary

**Status: CONSISTENT** ✓

All components follow the design system with documented exceptions. No inconsistencies found.

## Background Colors

### Page Background
- **Pattern:** CSS custom property `--background: #0a0a0a`
- **Location:** `src/app/globals.css`
- **Status:** ✓ Correct (not using Tailwind classes on body)

### Card/Surface Backgrounds

| File | Pattern | Status | Notes |
|------|---------|--------|-------|
| `src/components/Card.tsx` | `dark:hover:bg-zinc-800` | ✓ | Hover only, base transparent |
| `src/components/PostCard.tsx` | `dark:hover:bg-zinc-800` | ✓ | Hover only, base transparent |
| `src/app/(frontend)/page.tsx` (hero) | `dark:bg-zinc-800` | ✓ | Hero section elevated surface |
| `src/app/(frontend)/about/page.tsx` | `dark:bg-zinc-900` | ✓ | **Exception: Recessed callout** |
| `src/app/error.tsx` (code block) | `dark:bg-zinc-800` | ✓ | Code block surface |
| `src/components/Button.tsx` (ghost) | `dark:hover:bg-zinc-800` | ✓ | Ghost button hover state |

### Interactive States

| Component | Pattern | Status |
|-----------|---------|--------|
| Card hover | `dark:hover:bg-zinc-800` | ✓ |
| PostCard hover | `dark:hover:bg-zinc-800` | ✓ |
| Button ghost hover | `dark:hover:bg-zinc-800` | ✓ |

## Border Colors

### Standard Borders

| File | Pattern | Status | Notes |
|------|---------|--------|-------|
| `src/components/Card.tsx` | `dark:border-zinc-700` | ✓ | Standard card border |
| `src/components/PostCard.tsx` | `dark:border-zinc-700` | ✓ | Standard card border |
| `src/app/(frontend)/page.tsx` (hero) | `dark:border-zinc-700` | ✓ | Hero section border |
| `src/app/(frontend)/page.tsx` (empty state) | `dark:border-zinc-700` | ✓ | Dashed border |
| `src/app/error.tsx` (code block) | `dark:border-zinc-700` | ✓ | Code block border |
| `src/components/Button.tsx` (secondary) | `dark:border-zinc-700` | ✓ | Button outline |

### Subtle Borders

| File | Pattern | Status | Notes |
|------|---------|--------|-------|
| `src/app/(frontend)/layout.tsx` | `dark:border-zinc-800` | ✓ | Footer top border (subtle) |
| `src/app/(frontend)/about/page.tsx` | `dark:border-zinc-800` | ✓ | Callout border (matches recessed bg) |

### Interactive Border States

| Component | Pattern | Status |
|-----------|---------|--------|
| Card hover | `dark:hover:border-zinc-500` | ✓ |
| PostCard hover | `dark:hover:border-zinc-500` | ✓ |
| Button secondary hover | `dark:hover:border-zinc-500` | ✓ |

## Text Colors

### Primary Text (Headings)

| File | Pattern | Status |
|------|---------|--------|
| All page titles | `dark:text-zinc-100` | ✓ |
| Card titles | `dark:text-zinc-100` | ✓ |
| Button primary | `dark:text-zinc-900` (on light bg) | ✓ |

### Secondary Text (Body)

| File | Pattern | Status |
|------|---------|--------|
| All body paragraphs | `dark:text-zinc-400` | ✓ |
| Card summaries | `dark:text-zinc-400` | ✓ |
| Navigation links | `dark:text-zinc-400` | ✓ |

### Tertiary Text (Metadata)

| File | Pattern | Status |
|------|---------|--------|
| Timestamps | `dark:text-zinc-400` or `dark:text-zinc-500` | ✓ |
| Footer text | `dark:text-zinc-400` | ✓ |
| Empty state text | `dark:text-zinc-400` | ✓ |

### Interactive Text States

| Component | Pattern | Status |
|-----------|---------|--------|
| Navigation hover | `dark:hover:text-zinc-100` | ✓ |
| Link hover | `dark:hover:text-zinc-100` | ✓ |
| PostCard "Read more" hover | `dark:group-hover:text-zinc-300` | ✓ |

## Special Cases (Documented Exceptions)

### 1. About Page Callout
**File:** `src/app/(frontend)/about/page.tsx`
**Pattern:** `dark:bg-zinc-900 dark:border-zinc-800`
**Reason:** Intentionally recessed appearance (darker than page background)
**Status:** ✓ Documented in design system

### 2. Button Primary (Inverted)
**File:** `src/components/Button.tsx`
**Pattern:** `dark:bg-zinc-100 dark:text-zinc-900`
**Reason:** Primary buttons invert in dark mode (light button on dark page)
**Status:** ✓ Documented in design system

### 3. Loading Spinner
**File:** `src/app/loading.tsx`
**Pattern:** `dark:border-zinc-700 dark:border-t-zinc-100`
**Reason:** Spinner animation requires contrasting borders
**Status:** ✓ Expected pattern

## Components Not Using Dark Mode Colors

These components have no background/border/text colors:

- `src/components/ThemeProvider.tsx` - Context provider only
- `src/components/PageLayout.tsx` - Layout wrapper only
- `src/app/(payload)/` - Admin interface (separate design system)

## Validation Results

### Automated Checks
- [x] No `dark:bg-zinc-600` found
- [x] No `dark:bg-zinc-950` found
- [x] All cards use `zinc-800` or documented exceptions
- [x] Page background uses CSS variables
- [x] Standard borders use `zinc-700`
- [x] Subtle borders use `zinc-800`

### Manual Review
- [x] All components follow text hierarchy
- [x] Interactive states are consistent
- [x] Hover states provide sufficient feedback
- [x] Special cases are documented
- [x] No visual regressions in dark mode

## Recommendations

1. **No changes required** - The codebase is consistent with the design system
2. **Maintain vigilance** on new components to ensure they follow patterns
3. **Reference `docs/design-system.md`** when adding new components
4. **Run this checklist** quarterly or when major UI changes are made

## Next Audit

Recommended: 2026-05-13 (3 months) or after any major design system changes.

## Audit Checklist for Future Use

Run these commands to check for inconsistencies:

```bash
# Find all dark mode backgrounds
grep -r "dark:bg-zinc-" src/app src/components --include="*.tsx"

# Find all dark mode borders
grep -r "dark:border-zinc-" src/app src/components --include="*.tsx"

# Find all dark mode text colors
grep -r "dark:text-zinc-" src/app src/components --include="*.tsx"

# Check for odd shades (should be minimal)
grep -r "dark:bg-zinc-[369]00" src/app src/components --include="*.tsx"
```

Compare results against the design system specification and document any new patterns or exceptions.
