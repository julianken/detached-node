import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy handler — combines three independently-developed concerns for the
 * Payload-backed public routes. Whichever PR landed last (here: #418, merged
 * after #421) was responsible for stitching the responsibilities together
 * without dropping any of the other's behavior. Order matters:
 *
 *   1. Trailing-punctuation redirect            (issue #414 / PR #421)
 *      — strip `'`, `"`, `)`, `]`, `.`, `,`, `;`, `:`, `!`, `?` off the end
 *        of `/posts/<slug>` and 301 to the canonical URL.
 *   2. Soft-404 slug-existence short-circuit    (issue #414 / PR #421)
 *      — if the slug doesn't resolve to a published post, return HTTP 404
 *        with no-cache headers so the response never enters the ISR cache
 *        envelope (vercel/next.js#43831, #79497).
 *   3. `Last-Modified` header injection         (issue #418 / this PR)
 *      — on the pass-through path only, stamp a `Last-Modified` header
 *        sourced from the appropriate per-route timestamp so AI grounding
 *        crawlers (Bingbot/Copilot, PerplexityBot, CCBot) can schedule
 *        revalidation by date instead of by content hash.
 *
 * Steps 1 and 2 terminate the request before step 3 ever runs. Step 3 only
 * decorates the `NextResponse.next()` response on canonical paths that the
 * matcher and runtime regexes accept.
 *
 * Routes touched by step 3:
 *   - `/posts/<slug>`                          → Payload `posts.dedicatedDateModified ?? updatedAt`
 *   - `/agentic-design-patterns/<slug>`        → static pattern `dateModified`
 *   - `/agentic-design-patterns/changelog`     → catalog `getCatalogDateModified()` (static shadow of `[slug]`)
 *   - `/posts`                                 → ISR-snapshot floor (cheap)
 *   - `/agentic-design-patterns`               → ISR-snapshot floor (cheap)
 *   - `/about`                                 → Payload `pages.updatedAt` for slug "about"
 *
 * Page-level mechanisms (`generateMetadata`, `next/headers`,
 * `next.config.js`'s `headers()`, route handlers) cannot inject a dynamic
 * response header keyed off a per-doc `updatedAt`. See vercel/next.js#50914
 * and #58110. The Next 16 `proxy.ts` middleware successor is the only
 * viable hook.
 *
 * 304 / `If-Modified-Since` handling is intentionally NOT in this file. Per
 * vercel/next.js#82790, Next does not auto-convert presence of the header
 * into conditional-request shortcircuits, and the comparison adds a second
 * DB hop per gated request. Tracked separately.
 *
 * Why `proxy.ts` and not `middleware.ts`: Next 16 renamed the convention;
 * `proxy.ts` runs on the Node runtime by default, which is necessary so
 * the existence / `updatedAt` lookups can import Payload's Node-only
 * transitive deps (`url`, `fs`, `sharp`). The legacy `middleware.ts` file
 * convention defaults to the Edge runtime and cannot import Payload.
 *
 * The existence check delegates to `postSlugExists`, a field-projected
 * query (`select: { slug: true }`, depth 0, no joins) — it answers
 * existence without pulling the post's Lexical body, references, or joined
 * media. The proxy lookup is separate from the page handler's
 * `getPostBySlug` — React `cache()` is per-request and is NOT shared
 * between `proxy.ts` and the page render in Next.js 16 (they are distinct
 * execution contexts). The cost is one extra projected query in the proxy.
 *
 * Errors during the existence check fail OPEN (pass through to the page).
 * A transient DB outage shouldn't paint the entire site 404. The
 * `Last-Modified` lookups behave the same way — on failure, the header is
 * just omitted; the request never breaks.
 */

// ── Route-shape regexes (anchored, narrow) ────────────────────────────────
//
// Trailing-punctuation characters are case-invariant, and the downstream
// slug pattern + `isFormatValidSlug` are case-sensitive (lowercase only).
// Using `/i` here would 301 `/posts/Foo'` to `/posts/Foo` which would then
// 404 — an extra hop. Drop the `/i` and let mixed-case slugs fall through;
// they'd 404 anyway since they don't match the slug format.
const TRAILING_PUNCT_PATTERN = /^(\/posts\/[a-z0-9-]+?)['")\].,;:!?]+$/;
const POSTS_SLUG_PATTERN = /^\/posts\/([a-z0-9-]+)$/;
const PATTERNS_SLUG_PATTERN = /^\/agentic-design-patterns\/([a-z0-9-]+)$/;
const PATTERNS_CHANGELOG_PATTERN = /^\/agentic-design-patterns\/changelog\/?$/;
const POSTS_LISTING_PATTERN = /^\/posts\/?$/;
const PATTERNS_LISTING_PATTERN = /^\/agentic-design-patterns\/?$/;
const ABOUT_PATTERN = /^\/about\/?$/;

// Slug-format gate — mirrors `isValidSlug` from `src/lib/types/branded.ts`.
// Inlined to keep the proxy module's bundle minimal.
const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 200;

function isFormatValidSlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_FORMAT.test(slug)
  );
}

/**
 * ISR-snapshot floor: the earliest moment the currently-served snapshot of
 * a listing route could have been generated. Captured at module load (i.e.
 * process startup), it bounds the snapshot age to "no older than this
 * server's boot". For listing routes whose `revalidate` is 3600s, the
 * actual snapshot timestamp drifts forward as ISR regenerates, but the
 * boot floor is a safe lower bound — and matches the spec's chosen
 * "this snapshot was generated at X" semantic without requiring a true-live
 * max-of-children query (rejected as too expensive).
 *
 * In dev mode, this resets per `pnpm dev` restart; in production it resets
 * per Cloud Run cold start. Both are acceptable for the crawler signal.
 */
const ISR_SNAPSHOT_FLOOR_DATE: Date = new Date();

// ── DB-lookup delegates (test-swappable) ──────────────────────────────────
//
// Each lookup is field-projected to only the timestamp / existence bit we
// need and returns `null` on miss / fail-open. The proxy never
// short-circuits a request on lookup failure — it just omits the header
// and passes through, or (for the existence check) falls open to the page.

type UpdatedAtLookup = (slug: string) => Promise<string | null>;

/**
 * Existence-check delegate, broken out so unit tests can swap it via
 * `__testing__.setPostSlugExists` without booting Payload. The production
 * binding (below) defers the Payload import so proxy module load doesn't
 * pull the CMS into the cold-start path; the cost is only paid on actual
 * `/posts/<slug>` requests.
 */
async function defaultPostSlugExists(slug: string): Promise<boolean | null> {
  try {
    const { postSlugExists } = await import("@/lib/queries/posts");
    return await postSlugExists(slug);
  } catch {
    // Fail open — let the page handle it.
    return null;
  }
}

/**
 * Pick the post timestamp that should drive `Last-Modified`, matching the
 * BlogPosting JSON-LD's `dateModified` precedence (see
 * `src/lib/schema/blog-posting.ts` and PR #397):
 *
 *   1. `dedicatedDateModified` — deliberate signal stamped only on meaningful
 *      content changes (body/title/summary). Lets non-content saves
 *      (toggling featured, swapping a tag) avoid moving the freshness signal.
 *   2. `updatedAt` — Payload's auto-updated timestamp; covers posts that
 *      pre-date the dedicated field.
 *   3. `null` — both missing → omit the header rather than send a wrong one.
 *
 * Sending `Last-Modified` from a different source than the JSON-LD
 * `dateModified` would hand crawlers two contradictory freshness values
 * for the same page.
 *
 * Exported as a named symbol so unit tests can verify the precedence
 * without mocking Payload module-wide (which leaks across files).
 */
export function pickPostTimestamp(
  doc: { updatedAt?: string | null; dedicatedDateModified?: string | null } | undefined,
): string | null {
  return doc?.dedicatedDateModified ?? doc?.updatedAt ?? null;
}

async function defaultPostUpdatedAt(slug: string): Promise<string | null> {
  try {
    const { getPayload } = await import("payload");
    const config = (await import("@payload-config")).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: {
        slug: { equals: slug },
        status: { equals: "published" },
      },
      limit: 1,
      depth: 0,
      // Project both timestamps so `pickPostTimestamp` can apply the
      // BlogPosting `dateModified` precedence — see that helper's docstring.
      select: { updatedAt: true, dedicatedDateModified: true },
    });
    return pickPostTimestamp(docs[0]);
  } catch {
    return null;
  }
}

async function defaultPatternUpdatedAt(slug: string): Promise<string | null> {
  try {
    const { getPattern } = await import("@/data/agentic-design-patterns/index");
    const pattern = getPattern(slug);
    return pattern?.dateModified ?? null;
  } catch {
    return null;
  }
}

/**
 * `/agentic-design-patterns/changelog` is a static App Router route that
 * shadows the dynamic `[slug]` segment. The catalog has no pattern named
 * "changelog", so it would otherwise fall through with no header. Its
 * natural freshness signal is the most recent `dateModified` across all
 * non-archived patterns — the same value the changelog page itself uses
 * to describe the catalog's last edit.
 */
async function defaultChangelogUpdatedAt(): Promise<string | null> {
  try {
    const { getCatalogDateModified } = await import(
      "@/data/agentic-design-patterns/index"
    );
    return getCatalogDateModified();
  } catch {
    return null;
  }
}

async function defaultAboutUpdatedAt(): Promise<string | null> {
  try {
    const { getPayload } = await import("payload");
    const config = (await import("@payload-config")).default;
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "pages",
      where: {
        slug: { equals: "about" },
        status: { equals: "published" },
      },
      limit: 1,
      depth: 0,
      select: { updatedAt: true },
    });
    const doc = docs[0];
    return doc?.updatedAt ?? null;
  } catch {
    return null;
  }
}

// Mutable bindings so tests can override without booting Payload or the
// pattern catalog. Production code never reassigns these — only the
// `__testing__` API below does.
// eslint-disable-next-line prefer-const
let postSlugExistsImpl: (slug: string) => Promise<boolean | null> =
  defaultPostSlugExists;
let postUpdatedAtImpl: UpdatedAtLookup = defaultPostUpdatedAt;
let patternUpdatedAtImpl: UpdatedAtLookup = defaultPatternUpdatedAt;
let aboutUpdatedAtImpl: () => Promise<string | null> = defaultAboutUpdatedAt;
let changelogUpdatedAtImpl: () => Promise<string | null> =
  defaultChangelogUpdatedAt;

// ── Soft-404 response body ────────────────────────────────────────────────
//
// Minimal not-found HTML body. The browser shows a stripped-down 404
// page; this path is exercised primarily by crawlers and typo'd URLs,
// not human navigation, so we trade full-layout fidelity for the
// out-of-ISR-cache 404 status that fixes the soft-404 bug.
const NOT_FOUND_BODY = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Post not found · detached-node</title>
    <style>
      body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #fafafa; color: #18181b; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      main { text-align: center; padding: 2rem; }
      h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
      p { color: #71717a; margin: 0 0 1.5rem; }
      a { color: #18181b; text-decoration: underline; text-underline-offset: 4px; }
      @media (prefers-color-scheme: dark) { body { background: #18181b; color: #fafafa; } p { color: #a1a1aa; } a { color: #fafafa; } }
    </style>
  </head>
  <body>
    <main>
      <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">404</p>
      <h1>Post not found</h1>
      <p>This post does not exist, or may have been removed.</p>
      <a href="/posts">Browse all posts</a>
    </main>
  </body>
</html>`;

function notFoundResponse(): NextResponse {
  return new NextResponse(NOT_FOUND_BODY, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}

// ── Header formatting ─────────────────────────────────────────────────────

/**
 * Format a value as an RFC 7231 HTTP-date suitable for `Last-Modified`.
 * Accepts ISO strings, raw Date objects, or millisecond epochs. Returns
 * null when the input doesn't parse to a real date — the caller should
 * omit the header rather than send a malformed value.
 */
export function toHttpDate(input: string | Date | number | null): string | null {
  if (input === null) return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  // `Date.prototype.toUTCString` emits RFC 7231 / 1123 format, e.g.
  // "Sun, 18 May 2026 14:23:01 GMT". This is the canonical HTTP-date form.
  return date.toUTCString();
}

// ── Main proxy entry point ────────────────────────────────────────────────

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Trailing-punctuation redirect — runs first so the canonical URL
  //    is what the existence check below evaluates on the next hop.
  const puncMatch = pathname.match(TRAILING_PUNCT_PATTERN);
  if (puncMatch) {
    const canonicalPath = puncMatch[1];
    const redirectUrl = new URL(canonicalPath, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 2. Soft-404 short-circuit — only fires on canonical `/posts/<slug>`
  //    shapes (after the redirect above has cleaned trailing chars).
  const postsMatch = pathname.match(POSTS_SLUG_PATTERN);
  if (postsMatch) {
    const slug = postsMatch[1];
    if (!isFormatValidSlug(slug)) {
      return notFoundResponse();
    }
    const exists = await postSlugExistsImpl(slug);
    if (exists === false) {
      return notFoundResponse();
    }
    // `null` (DB unavailable) → fall through to header decoration below,
    // which itself fails open if the timestamp lookup also fails.

    // 3. Last-Modified header on the pass-through path for posts.
    const response = NextResponse.next();
    const updatedAt = await postUpdatedAtImpl(slug);
    const httpDate = toHttpDate(updatedAt);
    if (httpDate) {
      response.headers.set("Last-Modified", httpDate);
    }
    return response;
  }

  // 3. Last-Modified header for the remaining handled routes. None of
  //    these have a soft-404 short-circuit attached — they either render
  //    static content (`/about`, listing routes) or pass through to a
  //    static pattern catalog.

  const response = NextResponse.next();

  // `/agentic-design-patterns/changelog` is a static route that shadows the
  // `[slug]` dynamic segment. Check it BEFORE the slug regex so we emit the
  // catalog's most-recent-dateModified rather than falling through with no
  // header (which is what would happen for a slug not in the catalog).
  if (PATTERNS_CHANGELOG_PATTERN.test(pathname)) {
    const updatedAt = await changelogUpdatedAtImpl();
    const httpDate = toHttpDate(updatedAt);
    if (httpDate) {
      response.headers.set("Last-Modified", httpDate);
    }
    return response;
  }

  const patternsMatch = pathname.match(PATTERNS_SLUG_PATTERN);
  if (patternsMatch) {
    const slug = patternsMatch[1];
    if (isFormatValidSlug(slug)) {
      const updatedAt = await patternUpdatedAtImpl(slug);
      const httpDate = toHttpDate(updatedAt);
      if (httpDate) {
        response.headers.set("Last-Modified", httpDate);
      }
    }
    return response;
  }

  // Listing routes — ISR-snapshot floor (cheap, snapshot-accurate semantic).
  if (
    POSTS_LISTING_PATTERN.test(pathname) ||
    PATTERNS_LISTING_PATTERN.test(pathname)
  ) {
    const httpDate = toHttpDate(ISR_SNAPSHOT_FLOOR_DATE);
    if (httpDate) {
      response.headers.set("Last-Modified", httpDate);
    }
    return response;
  }

  // About — single Pages collection doc keyed on slug "about".
  if (ABOUT_PATTERN.test(pathname)) {
    const updatedAt = await aboutUpdatedAtImpl();
    const httpDate = toHttpDate(updatedAt);
    if (httpDate) {
      response.headers.set("Last-Modified", httpDate);
    }
    return response;
  }

  return response;
}

/**
 * Test-only: swap the lookup delegates so unit tests don't boot Payload or
 * the pattern catalog. Reset via the `reset*` methods in `afterEach`.
 */
export const __testing__ = {
  setPostSlugExists: (fn: (slug: string) => Promise<boolean | null>): void => {
    postSlugExistsImpl = fn;
  },
  resetPostSlugExists: (): void => {
    postSlugExistsImpl = defaultPostSlugExists;
  },
  setPostUpdatedAt: (fn: UpdatedAtLookup): void => {
    postUpdatedAtImpl = fn;
  },
  resetPostUpdatedAt: (): void => {
    postUpdatedAtImpl = defaultPostUpdatedAt;
  },
  setPatternUpdatedAt: (fn: UpdatedAtLookup): void => {
    patternUpdatedAtImpl = fn;
  },
  resetPatternUpdatedAt: (): void => {
    patternUpdatedAtImpl = defaultPatternUpdatedAt;
  },
  setAboutUpdatedAt: (fn: () => Promise<string | null>): void => {
    aboutUpdatedAtImpl = fn;
  },
  resetAboutUpdatedAt: (): void => {
    aboutUpdatedAtImpl = defaultAboutUpdatedAt;
  },
  setChangelogUpdatedAt: (fn: () => Promise<string | null>): void => {
    changelogUpdatedAtImpl = fn;
  },
  resetChangelogUpdatedAt: (): void => {
    changelogUpdatedAtImpl = defaultChangelogUpdatedAt;
  },
  getIsrSnapshotFloor: (): Date => ISR_SNAPSHOT_FLOOR_DATE,
};

/**
 * Enumerated matcher — covers the union of routes both concerns touch and
 * nothing else. Static assets (`/_next/...`, `/favicon.ico`, `/icon.png`,
 * `/feed.xml`, `/sitemap.xml`, `/robots.txt`) and Payload's `/api/...`
 * routes are not matched. The runtime regexes above further gate the
 * actual behavior so an unrelated path that happens to start with
 * `/posts/` still passes through with no header.
 */
export const config = {
  matcher: [
    "/posts",
    "/posts/:slug+",
    "/agentic-design-patterns",
    "/agentic-design-patterns/:slug+",
    "/agentic-design-patterns/changelog",
    "/about",
  ],
};
