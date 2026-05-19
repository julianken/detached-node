import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy handler for `/posts/<slug>` routes (issue #414).
 *
 * Two concerns:
 *   1. Trailing-punctuation redirect — AI-generated markdown links and
 *      search-index crawlers produce URLs with stray trailing punctuation
 *      (e.g. `/posts/some-slug'`, `/posts/some-slug)`). Strip the
 *      punctuation and 301 to the canonical URL.
 *   2. Soft-404 short-circuit — Next.js ISR caches the `notFound()`
 *      render as a successful 200 with the page's normal `s-maxage`
 *      headers (vercel/next.js#43831, #79497). To keep `revalidate = 3600`
 *      on valid posts but avoid soft-404s on missing ones, we do a
 *      fast slug-existence check here (BEFORE the page enters the ISR
 *      cache envelope) and emit a proper 404 with no-cache headers when
 *      the slug doesn't resolve to a published post.
 *
 * Implementation notes:
 *   - Slugs follow `isValidSlug` (lowercase alphanumeric + hyphens).
 *     Format-invalid slugs are short-circuited synchronously — no DB
 *     hop needed.
 *   - The existence check delegates to `postSlugExists`, a
 *     field-projected query (`select: { slug: true }`, depth 0, no
 *     joins) — it answers existence without pulling the post's Lexical
 *     body, references, or joined media. The proxy lookup is separate
 *     from the page handler's `getPostBySlug` — React `cache()` is
 *     per-request and is NOT shared between `proxy.ts` and the page
 *     render in Next.js 16 (they are distinct execution contexts). The
 *     cost is one extra projected query in the proxy.
 *   - Errors during the existence check fail OPEN (pass through to the
 *     page). A transient DB outage shouldn't paint the entire site 404.
 *
 * Next 16 naming: this file is `proxy.ts` rather than `middleware.ts`
 * because `proxy.ts` runs on the Node.js runtime (per the Next 16
 * upgrade guide), and the existence check imports Payload which is
 * Node-only. The issue spec uses the `middleware` term but the
 * mechanism it specifies — a per-request handler that runs before the
 * route — is exactly what `proxy.ts` provides in Next 16. The legacy
 * `middleware.ts` file convention defaults to the Edge runtime, which
 * cannot import Payload's transitive deps (`url`, `fs`, `sharp`).
 */

// Trailing-punctuation characters are case-invariant, and the downstream
// slug pattern + `isFormatValidSlug` are case-sensitive (lowercase only).
// Using `/i` here would 301 `/posts/Foo'` to `/posts/Foo` which would
// then 404 — an extra hop. Drop the `/i` and let mixed-case slugs fall
// through; they'd 404 anyway since they don't match the slug format.
const TRAILING_PUNCT_PATTERN = /^(\/posts\/[a-z0-9-]+?)['")\].,;:!?]+$/;
const POSTS_SLUG_PATTERN = /^\/posts\/([a-z0-9-]+)$/;

// Synchronous slug-format check — mirrors `isValidSlug` from
// `src/lib/types/branded.ts`. Inlined here so the proxy bundle doesn't
// need to pull the branded-types module's transitive imports.
const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 200;

function isFormatValidSlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_FORMAT.test(slug)
  );
}

/**
 * Existence-check delegate, broken out so unit tests can swap it via
 * `__testing__.setPostSlugExists` without booting Payload. The
 * production binding (below) defers the Payload import so proxy module
 * load doesn't pull the CMS into the cold-start path; the cost is only
 * paid on actual `/posts/<slug>` requests.
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

// Mutable binding so tests can override. Production code never
// reassigns this.
// eslint-disable-next-line prefer-const
let postSlugExistsImpl: (slug: string) => Promise<boolean | null> =
  defaultPostSlugExists;

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Trailing-punctuation redirect — runs first so the canonical URL
  // is what the existence check below evaluates on the next hop.
  const puncMatch = pathname.match(TRAILING_PUNCT_PATTERN);
  if (puncMatch) {
    const canonicalPath = puncMatch[1];
    const redirectUrl = new URL(canonicalPath, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 2. Soft-404 short-circuit — only fires on canonical `/posts/<slug>`
  // shapes (after the redirect above has cleaned trailing chars).
  const slugMatch = pathname.match(POSTS_SLUG_PATTERN);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (!isFormatValidSlug(slug)) {
      return notFoundResponse();
    }
    const exists = await postSlugExistsImpl(slug);
    if (exists === false) {
      return notFoundResponse();
    }
    // `null` (DB unavailable) → fall through to page, fail-open.
  }

  return NextResponse.next();
}

/**
 * Test-only: swap the existence-check delegate so unit tests don't
 * boot Payload. Reset via `resetPostSlugExists` in `afterEach`.
 */
export const __testing__ = {
  setPostSlugExists: (fn: (slug: string) => Promise<boolean | null>): void => {
    postSlugExistsImpl = fn;
  },
  resetPostSlugExists: (): void => {
    postSlugExistsImpl = defaultPostSlugExists;
  },
};

/**
 * Narrow the matcher to `/posts/<slug>` paths only — never the `/posts`
 * listing, never any other route. The handler regexes still gate the
 * actual behavior at runtime.
 */
export const config = {
  matcher: ["/posts/:slug+"],
};
