import { describe, it, expect, vi, beforeEach } from "vitest";

// The page module transitively reads `NEXT_PUBLIC_SERVER_URL` via
// `siteUrl` (which calls `assertRequiredEnv` at module load). Stub it
// before the dynamic import so the page module loads cleanly under
// jsdom without requiring a real env file.
process.env.NEXT_PUBLIC_SERVER_URL ||= "http://localhost:3000";

/**
 * Issue #414 regression test: the post page route must call `notFound()`
 * for any slug that doesn't resolve to a published post.
 *
 * Status-code assertion is intentionally NOT done here — `notFound()`
 * throws `NEXT_NOT_FOUND` (a framework-internal sentinel), and the HTTP
 * 404 emission is the framework's job once that throw is caught.
 * Importantly, ISR + `dynamicParams=true` causes Next.js to cache the
 * `notFound()` render as a successful 200 with the page's `s-maxage`
 * headers — the soft-404 trap fixed by this issue (vercel/next.js#43831).
 * That status-code path is short-circuited *before* this page handler
 * runs by `src/proxy.ts`, which does the existence check at the proxy
 * layer (outside the ISR cache envelope) and emits the real 404 with
 * `no-cache` headers.
 *
 * This unit test covers the page's contract on the slow-path (proxy
 * fail-open: DB unavailable). The HTTP-status verification on the
 * fast-path lives in the Playwright E2E `unknown post slug returns 404`
 * spec and in the post-deploy curl verification documented in the issue
 * body.
 */

// Capture the notFound() invocation
const notFoundSpy = vi.fn(() => {
  // Real notFound() throws NEXT_NOT_FOUND. Mirror the throw so callers
  // short-circuit and downstream code that assumes "control does not
  // return from notFound()" still holds.
  const err = new Error("NEXT_NOT_FOUND");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (err as any).digest = "NEXT_NOT_FOUND";
  throw err;
});

// Override the global setup mock for next/navigation
vi.mock("next/navigation", () => ({
  notFound: notFoundSpy,
}));

// Mock the data layer — the page's only external dependency for the
// pre-render check we care about. Default: slug not found.
const getPostBySlugMock = vi.fn();
vi.mock("@/lib/queries/posts", () => ({
  getPostBySlug: getPostBySlugMock,
  getPublishedPosts: vi.fn(() => Promise.resolve([])),
}));

// Stub the Payload config + client so the page's transitive deps (e.g.
// `@/components/RelatedPosts` → `@/lib/queries/related-posts`) don't pull
// `@payload-config` at module load — that file calls `assertRequiredEnv`
// for `PAYLOAD_SECRET` + `DATABASE_URL` at import time and would throw
// under the CI unit-test job (which doesn't provision those env vars).
// Matches the pattern in `tests/unit/lib/queries/posts.test.ts`.
vi.mock("@payload-config", () => ({
  default: {},
}));
vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({
    find: vi.fn(async () => ({ docs: [] })),
  })),
}));
vi.mock("@/lib/queries/related-posts", () => ({
  getRelatedPosts: vi.fn(() => Promise.resolve([])),
}));

// Mock logging to avoid noisy stderr during tests.
vi.mock("@/lib/logging", () => ({
  logWarning: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Pull the page module AFTER mocks are installed.
async function loadPage() {
  return await import("@/app/(frontend)/posts/[slug]/page");
}

describe("posts/[slug]/page: soft-404 fix (issue #414)", () => {
  beforeEach(() => {
    notFoundSpy.mockClear();
    getPostBySlugMock.mockReset();
  });

  it("calls notFound() when the slug is not a valid format", async () => {
    const { default: PostPage } = await loadPage();
    await expect(
      // Uppercase + spaces => isValidSlug() returns false
      PostPage({ params: Promise.resolve({ slug: "Not A Valid Slug" }) }),
    ).rejects.toThrow(/NEXT_NOT_FOUND/);
    expect(notFoundSpy).toHaveBeenCalledTimes(1);
    // getPostBySlug should NOT be hit when format validation fails first.
    expect(getPostBySlugMock).not.toHaveBeenCalled();
  });

  it("calls notFound() when getPostBySlug returns null (slug not in DB)", async () => {
    getPostBySlugMock.mockResolvedValue(null);
    const { default: PostPage } = await loadPage();
    await expect(
      PostPage({
        params: Promise.resolve({ slug: "does-not-exist-12345" }),
      }),
    ).rejects.toThrow(/NEXT_NOT_FOUND/);
    expect(notFoundSpy).toHaveBeenCalledTimes(1);
    expect(getPostBySlugMock).toHaveBeenCalledWith("does-not-exist-12345");
  });

  it("does NOT call notFound() when the post resolves successfully", async () => {
    // Minimal Post shape the page renders without throwing. The point
    // of this test is to confirm that the early-return short-circuits
    // notFound() — full render fidelity isn't required.
    const fakePost = {
      id: "00000000-0000-4000-8000-000000000000",
      slug: "real-post",
      title: "Real Post",
      summary: "summary",
      publishedAt: "2026-01-01T00:00:00.000Z",
      body: { root: { children: [], direction: null, format: "", indent: 0, type: "root", version: 1 } },
      references: [],
      featuredImageLight: null,
      featuredImageDark: null,
      focalPoint: null,
      status: "published",
    };
    getPostBySlugMock.mockResolvedValue(fakePost);
    const { default: PostPage } = await loadPage();
    // The component returns JSX; we only care that notFound was NOT called.
    // We swallow downstream rendering errors that come from the JSX
    // referencing components/styles we haven't mocked — those don't bear
    // on the soft-404 contract.
    try {
      await PostPage({
        params: Promise.resolve({ slug: "real-post" }),
      });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.message === "NEXT_NOT_FOUND") {
        throw err; // Genuine failure mode for this test
      }
      // Any other render-time error is acceptable here.
    }
    expect(notFoundSpy).not.toHaveBeenCalled();
  });
});
