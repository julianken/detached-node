# Content Model

Derived from `src/collections/*.ts`. Six Payload collections plus one code-resident content surface.

---

## Payload Collections

### 1) Posts

The primary content type. Source: `src/collections/Posts.ts`.

**Access:** published documents are public; drafts require authentication.

**Top-level fields (16):**

- `title` — text, required, 5–200 chars
- `slug` — text, required, unique, auto-derived from title via slug hook
- `type` — select, required, default `essay`; values: `essay`, `decoder`, `index`, `field-report`. The `field-report` value is retained intentionally per PR #134's design.
- `summary` — textarea, required, 50–500 chars
- `featuredImageLight` — upload (relation to Media), required; light-mode hero image
- `featuredImageDark` — upload (relation to Media), required; dark-mode hero image — must match light version dimensions
- `focalPoint` — group field (crop anchor for hero image, 0=left/top, 50=center, 100=right/bottom, default 50/50) with sub-fields:
  - `x` — number, 0–100, default 50 (horizontal: 0=left, 100=right)
  - `y` — number, 0–100, default 50 (vertical: 0=top, 100=bottom)
- `body` — richText, required
- `references` — array of objects, each with entry fields:
  - `title` — text, required
  - `url` — text
  - `author` — text
  - `publication` — text
  - `date` — date
- `tags` — relationship (hasMany) to Tags collection
- `status` — select, required, default `draft`; values: `draft`, `published`, `archived`; indexed
- `publishedAt` — date; indexed for sort
- `featured` — checkbox, default false; indexed
- `theme` — select; values: `isolation`, `signal`, `architecture`; indexed; used for pillar page grouping
- `seoTitle` — text, max 160 chars; falls back to `title` if blank
- `metaDescription` — textarea, max 320 chars; falls back to `summary` if blank

---

### 2) Listings

Curated collections of posts. Source: `src/collections/Listings.ts`.

**Access:** published documents are public; drafts require authentication.

**Fields:**

- `title` — text, required
- `slug` — text, required, unique, auto-derived from title
- `description` — textarea
- `featuredImage` — upload (relation to Media)
- `items` — relationship (hasMany) to Posts collection
- `status` — select, required, default `draft`; values: `draft`, `published`; indexed

---

### 3) Pages

Fixed-content pages (e.g. About, Method). Source: `src/collections/Pages.ts`.

**Access:** published documents are public; drafts require authentication.

**Fields:**

- `title` — text, required
- `slug` — text, required, unique, auto-derived from title
- `description` — textarea; used for SEO meta description
- `body` — richText, required
- `status` — select, required, default `draft`; values: `draft`, `published`; indexed

---

### 4) Tags

Taxonomy labels applied to posts. Source: `src/collections/Tags.ts`.

**Access:** public read; write requires authentication.

**Fields:**

- `name` — text, required, unique
- `slug` — text, required, unique, auto-derived from name
- `description` — textarea

---

### 5) Media

Image uploads with auto-generated preview data. Source: `src/collections/Media.ts`.

**Access:** public read; write requires authentication.

**Image sizes generated on upload:** `thumbnail` (400×300), `card` (768×512), `hero` (1920×auto).

**Fields:**

- `alt` — text, required
- `caption` — textarea
- `lqip` — text, read-only; legacy AVIF data-URL placeholder written during the PR #140 → #246 deploy window. Transitional: will be removed once all documents have a populated `preview`. Tracked in #246.
- `preview` — group field (auto-generated content-aware preview, populated on upload or by backfill) with sub-fields:
  - `color` — text, read-only; dominant color as `#rrggbb`
  - `ascii` — text, read-only; 24×12 luminance halftone (288 chars, row-major)

Both `lqip` and `preview` hooks (`generateLqipHook`, `generatePreviewHook`) run on `beforeChange`. The `preview` fields are canonical post-PR-#140; `lqip` is dual-written only during the cutover window.

---

### 6) Users

Authentication accounts for CMS access. Source: `src/collections/Users.ts`.

**Access:** Payload auth collection; read/write require authentication.

**Fields (beyond built-in Payload auth fields):**

- `name` — text

---

## Code-Resident Content Surface: Agentic Design Patterns (ADP)

ADP patterns are **not** a Payload collection. They are a code-resident content type living under `src/data/agentic-design-patterns/`. Key files in that directory include `index.ts`, `types.ts`, `layers.ts`, `changelog.ts`, `references.lock.json`, and a `patterns/` subdirectory.

This surface is real and must be treated as part of the content model. It is not managed through the Payload admin UI and does not appear in the database.

---

## Source-of-Truth Note

This file is manually re-derived from `src/collections/*.ts`. There is no auto-generator. When collections change, update this file in the same PR.
