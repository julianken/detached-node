import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Unified NextResponse mock — covers all three response shapes the proxy
// emits across its responsibilities:
//
//   - `NextResponse.next()`         → pass-through, with a real `Headers`
//     store so `.headers.set("Last-Modified", ...)` lands somewhere the
//     tests can inspect.
//   - `NextResponse.redirect(url)`  → trailing-punctuation 301 hop.
//   - `new NextResponse(body, init)` → the soft-404 response (status 404,
//     no-cache headers, minimal HTML body).
//
// The `kind` symbol on each shape lets tests distinguish branches without
// poking at the real `next/server` types.

const REDIRECT = Symbol("redirect");
const NEXT = Symbol("next");
const RESPONSE = Symbol("response");

type RedirectResult = {
  kind: typeof REDIRECT;
  url: string;
  status: number;
};

type NextResult = {
  kind: typeof NEXT;
  headers: Headers;
  status: number;
  body: string | null;
};

type ResponseResult = {
  kind: typeof RESPONSE;
  status: number;
  cacheControl: string | undefined;
  contentType: string | undefined;
  body: string;
  headers: Headers;
};

function buildNextResult(): NextResult {
  return {
    kind: NEXT,
    headers: new Headers(),
    status: 200,
    body: null,
  };
}

vi.mock("next/server", () => ({
  NextResponse: class {
    static redirect(url: URL, status?: number): RedirectResult {
      return {
        kind: REDIRECT,
        url: url.toString(),
        status: status ?? 307,
      };
    }
    static next(): NextResult {
      return buildNextResult();
    }
    constructor(body: BodyInit | null, init?: ResponseInit) {
      const headers = new Headers(init?.headers);
      return {
        kind: RESPONSE,
        status: init?.status ?? 200,
        cacheControl: headers.get("cache-control") ?? undefined,
        contentType: headers.get("content-type") ?? undefined,
        body: typeof body === "string" ? body : "",
        headers,
      } as unknown as ResponseResult;
    }
  },
}));

import { proxy, toHttpDate, __testing__ } from "@/proxy";

/**
 * Minimal NextRequest-shaped object — only the three fields the proxy
 * actually reads from. Avoids pulling the full NextRequest constructor
 * (which needs the Web `Request` polyfill and a request-context store).
 */
function makeRequest(pathname: string, search = ""): unknown {
  const base = "http://localhost:3000";
  const url = base + pathname + search;
  return {
    nextUrl: { pathname, search },
    url,
  };
}

const slugExistsMock = vi.fn();
const postUpdatedAtMock = vi.fn();
const patternUpdatedAtMock = vi.fn();
const aboutUpdatedAtMock = vi.fn();

beforeEach(() => {
  slugExistsMock.mockReset();
  postUpdatedAtMock.mockReset();
  patternUpdatedAtMock.mockReset();
  aboutUpdatedAtMock.mockReset();
  // Default: slug exists, all timestamp lookups return null (no header).
  // Tests override per-case as needed.
  slugExistsMock.mockResolvedValue(true);
  postUpdatedAtMock.mockResolvedValue(null);
  patternUpdatedAtMock.mockResolvedValue(null);
  aboutUpdatedAtMock.mockResolvedValue(null);
  __testing__.setPostSlugExists(slugExistsMock);
  __testing__.setPostUpdatedAt(postUpdatedAtMock);
  __testing__.setPatternUpdatedAt(patternUpdatedAtMock);
  __testing__.setAboutUpdatedAt(aboutUpdatedAtMock);
});

afterEach(() => {
  __testing__.resetPostSlugExists();
  __testing__.resetPostUpdatedAt();
  __testing__.resetPatternUpdatedAt();
  __testing__.resetAboutUpdatedAt();
});

// A real, parseable ISO date the lookups can return.
const FAKE_UPDATED_AT = "2026-05-12T10:30:00.000Z";
const FAKE_UPDATED_AT_HTTP = new Date(FAKE_UPDATED_AT).toUTCString();

// ── PR #421: trailing-punctuation redirect ────────────────────────────────

describe("proxy: trailing-punctuation redirect for /posts/<slug>", () => {
  it("strips a trailing apostrophe and 301s to the canonical slug", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await proxy(makeRequest("/posts/agentic-patterns'") as any);
    expect(result).toMatchObject({
      kind: REDIRECT,
      url: "http://localhost:3000/posts/agentic-patterns",
      status: 301,
    });
    // Redirect path must NOT trigger an existence check — the redirect
    // is the only network hop the proxy should issue here.
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("strips multiple trailing punctuation characters in one redirect", async () => {
    const result = await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/my-post')") as any,
    );
    expect(result).toMatchObject({
      kind: REDIRECT,
      url: "http://localhost:3000/posts/my-post",
      status: 301,
    });
  });

  it("strips a mix of trailing characters (period, comma, semicolon, etc.)", async () => {
    const cases: [string, string][] = [
      ["/posts/foo.", "/posts/foo"],
      ["/posts/foo,", "/posts/foo"],
      ['/posts/foo"', "/posts/foo"],
      ["/posts/foo)", "/posts/foo"],
      ["/posts/foo]", "/posts/foo"],
      ["/posts/foo;", "/posts/foo"],
      ["/posts/foo:", "/posts/foo"],
      ["/posts/foo!", "/posts/foo"],
      ["/posts/foo?", "/posts/foo"],
    ];
    for (const [input, expectedPath] of cases) {
      const result = (await proxy(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        makeRequest(input) as any,
      )) as unknown as RedirectResult;
      expect(result.kind, `input=${input}`).toBe(REDIRECT);
      expect(result.url, `input=${input}`).toBe(
        "http://localhost:3000" + expectedPath,
      );
      expect(result.status, `input=${input}`).toBe(301);
    }
  });

  it("preserves the query string on redirect", async () => {
    const result = await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/foo'", "?ref=bing") as any,
    );
    expect(result).toMatchObject({
      kind: REDIRECT,
      url: "http://localhost:3000/posts/foo?ref=bing",
      status: 301,
    });
  });

  it("does NOT redirect mixed-case slugs (case-sensitive — avoids 301→404 hop)", async () => {
    // The trailing-punctuation regex was previously `/i`, which would
    // match `/posts/Foo'` and 301 to `/posts/Foo` — only to 404 at the
    // next hop because the downstream slug pattern + `isFormatValidSlug`
    // are case-sensitive (lowercase only). Dropping `/i` lets mixed-case
    // paths fall through unchanged (the format-invalid slug check then
    // 404s them directly, no extra hop).
    slugExistsMock.mockResolvedValue(false);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/Foo'") as any,
    )) as unknown as ResponseResult | NextResult;
    // Either a 404 (matcher hit + format check fails) or a pass-through
    // (`NextResponse.next()`) — what must NOT happen is a 301 to
    // `/posts/Foo`.
    expect(result.kind).not.toBe(REDIRECT);
    // Existence check never runs for format-invalid slugs.
    expect(slugExistsMock).not.toHaveBeenCalled();
  });
});

// ── PR #421: soft-404 short-circuit ───────────────────────────────────────

describe("proxy: soft-404 short-circuit", () => {
  it("passes a clean /posts/<slug> path through when the post exists", async () => {
    slugExistsMock.mockResolvedValue(true);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/agentic-patterns") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
    expect(slugExistsMock).toHaveBeenCalledTimes(1);
    expect(slugExistsMock).toHaveBeenCalledWith("agentic-patterns");
  });

  it("returns 404 with no-cache headers when the post does NOT exist", async () => {
    slugExistsMock.mockResolvedValue(false);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/does-not-exist-12345") as any,
    )) as unknown as ResponseResult;
    expect(result.kind).toBe(RESPONSE);
    expect(result.status).toBe(404);
    expect(result.cacheControl).toMatch(/no-store/);
    expect(result.cacheControl).toMatch(/must-revalidate/);
    // Sanity: the body includes the not-found UI text we serve.
    expect(result.body).toMatch(/Post not found/i);
    // 404 path must not run the Last-Modified lookup.
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
  });

  it("returns 404 synchronously for format-invalid slugs (no DB hop)", async () => {
    // Slugs longer than SLUG_MAX_LENGTH (200) fail format validation
    // before the existence check.
    const longSlug = "a".repeat(201);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/" + longSlug) as any,
    )) as unknown as ResponseResult;
    expect(result.kind).toBe(RESPONSE);
    expect(result.status).toBe(404);
    expect(slugExistsMock).not.toHaveBeenCalled();
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
  });

  it("falls open (passes through) when the existence check returns null", async () => {
    // null = DB unavailable / fail-open path. The page handler will
    // still try and call notFound() — we don't want a transient DB
    // outage to paint the entire post route 404.
    slugExistsMock.mockResolvedValue(null);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/some-slug") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
  });

  it("uses the field-projected postSlugExists contract (single-arg slug)", async () => {
    // Documents the lookup contract that proxy.ts depends on: a single
    // string argument, returns boolean | null. Guards against future
    // changes to the query shape that would silently break the proxy's
    // existence check.
    slugExistsMock.mockResolvedValue(true);
    await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/some-slug") as any,
    );
    expect(slugExistsMock).toHaveBeenCalledTimes(1);
    expect(slugExistsMock.mock.calls[0]).toHaveLength(1);
    expect(typeof slugExistsMock.mock.calls[0][0]).toBe("string");
  });
});

// ── PR #418: toHttpDate ──────────────────────────────────────────────────

describe("toHttpDate", () => {
  it("formats an ISO string as RFC 7231 / 1123", () => {
    const out = toHttpDate("2026-05-12T10:30:00.000Z");
    // Sun, 12 May 2026 10:30:00 GMT (year falls on a known weekday — we
    // assert against `new Date(...).toUTCString()` to avoid baking weekday
    // assumptions that could drift across leap-year handling).
    expect(out).toBe(new Date("2026-05-12T10:30:00.000Z").toUTCString());
    expect(out).toMatch(/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
  });

  it("formats a Date instance as RFC 7231", () => {
    const date = new Date("2026-01-01T00:00:00.000Z");
    expect(toHttpDate(date)).toBe(date.toUTCString());
  });

  it("returns null for null input", () => {
    expect(toHttpDate(null)).toBeNull();
  });

  it("returns null for un-parseable strings", () => {
    expect(toHttpDate("not-a-date")).toBeNull();
  });

  it("returns null for NaN-yielding Date objects", () => {
    expect(toHttpDate(new Date("garbage"))).toBeNull();
  });
});

// ── PR #418: post detail route ───────────────────────────────────────────

describe("proxy: /posts/<slug> emits Last-Modified from Payload updatedAt", () => {
  it("sets Last-Modified to the looked-up updatedAt in HTTP-date form", async () => {
    slugExistsMock.mockResolvedValue(true);
    postUpdatedAtMock.mockResolvedValue(FAKE_UPDATED_AT);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/agentic-patterns") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBe(FAKE_UPDATED_AT_HTTP);
    expect(postUpdatedAtMock).toHaveBeenCalledTimes(1);
    expect(postUpdatedAtMock).toHaveBeenCalledWith("agentic-patterns");
  });

  it("omits Last-Modified when the post timestamp lookup returns null", async () => {
    // Existence check passes (post is in DB) but the timestamp lookup
    // returns null — header is just omitted. The request still succeeds.
    slugExistsMock.mockResolvedValue(true);
    postUpdatedAtMock.mockResolvedValue(null);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/some-slug") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
    expect(result.headers.get("Last-Modified")).toBeNull();
  });

  it("omits Last-Modified and skips the timestamp DB hop for format-invalid slugs", async () => {
    // Format-invalid slugs are 404'd before either lookup runs.
    const longSlug = "a".repeat(201);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/" + longSlug) as any,
    )) as unknown as ResponseResult;
    expect(result.kind).toBe(RESPONSE);
    expect(result.status).toBe(404);
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
  });

  it("omits Last-Modified when updatedAt is unparseable garbage", async () => {
    slugExistsMock.mockResolvedValue(true);
    postUpdatedAtMock.mockResolvedValue("not-a-date");
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/foo") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
    expect(result.headers.get("Last-Modified")).toBeNull();
  });

  it("does not consult pattern or about lookups for post-detail routes", async () => {
    slugExistsMock.mockResolvedValue(true);
    postUpdatedAtMock.mockResolvedValue(FAKE_UPDATED_AT);
    await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/some-post") as any,
    );
    expect(patternUpdatedAtMock).not.toHaveBeenCalled();
    expect(aboutUpdatedAtMock).not.toHaveBeenCalled();
  });

  it("falls through with no header when the DB existence check returns null", async () => {
    // fail-open from existence check should still let the request reach
    // the page (NEXT), and the Last-Modified lookup should NOT run — we
    // don't want to compound a DB hiccup by issuing a second query.
    slugExistsMock.mockResolvedValue(null);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/some-slug") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
    expect(result.headers.get("Last-Modified")).toBeNull();
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
  });
});

// ── PR #418: pattern detail route ────────────────────────────────────────

describe("proxy: /agentic-design-patterns/<slug> emits Last-Modified from pattern dateModified", () => {
  it("sets Last-Modified to the pattern's dateModified in HTTP-date form", async () => {
    patternUpdatedAtMock.mockResolvedValue(FAKE_UPDATED_AT);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/agentic-design-patterns/reflexion") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBe(FAKE_UPDATED_AT_HTTP);
    expect(patternUpdatedAtMock).toHaveBeenCalledTimes(1);
    expect(patternUpdatedAtMock).toHaveBeenCalledWith("reflexion");
  });

  it("accepts a date-only ISO string (catalog convention)", async () => {
    // The pattern catalog stores `dateModified: '2026-05-15'`. Make sure
    // the proxy can still produce a valid HTTP-date from that shape.
    patternUpdatedAtMock.mockResolvedValue("2026-05-15");
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/agentic-design-patterns/reflexion") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBe(
      new Date("2026-05-15").toUTCString(),
    );
  });

  it("omits Last-Modified when the pattern slug is not in the catalog", async () => {
    patternUpdatedAtMock.mockResolvedValue(null);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/agentic-design-patterns/unknown-pattern") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBeNull();
  });
});

// ── PR #418: listing routes ──────────────────────────────────────────────

describe("proxy: listing routes emit Last-Modified from the ISR snapshot floor", () => {
  it("sets Last-Modified to a parseable HTTP-date on /posts", async () => {
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts") as any,
    )) as unknown as NextResult;
    const header = result.headers.get("Last-Modified");
    expect(header).not.toBeNull();
    expect(header).toMatch(/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
    // The snapshot floor must round-trip to the same UTC string we
    // captured at module load.
    expect(header).toBe(__testing__.getIsrSnapshotFloor().toUTCString());
  });

  it("sets Last-Modified to the snapshot floor on /agentic-design-patterns", async () => {
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/agentic-design-patterns") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBe(
      __testing__.getIsrSnapshotFloor().toUTCString(),
    );
  });

  it("does not invoke any per-slug lookup on listing routes", async () => {
    await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts") as any,
    );
    await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/agentic-design-patterns") as any,
    );
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
    expect(patternUpdatedAtMock).not.toHaveBeenCalled();
    expect(aboutUpdatedAtMock).not.toHaveBeenCalled();
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("treats /posts/ (trailing slash) as the listing route, not a detail route", async () => {
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBe(
      __testing__.getIsrSnapshotFloor().toUTCString(),
    );
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
    expect(slugExistsMock).not.toHaveBeenCalled();
  });
});

// ── PR #418: about route ─────────────────────────────────────────────────

describe("proxy: /about emits Last-Modified from Pages collection doc updatedAt", () => {
  it("sets Last-Modified from the About page's updatedAt", async () => {
    aboutUpdatedAtMock.mockResolvedValue(FAKE_UPDATED_AT);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/about") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBe(FAKE_UPDATED_AT_HTTP);
    expect(aboutUpdatedAtMock).toHaveBeenCalledTimes(1);
  });

  it("omits Last-Modified when the About page lookup fails (null)", async () => {
    aboutUpdatedAtMock.mockResolvedValue(null);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/about") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBeNull();
  });
});

// ── Scope discipline (both PRs) ──────────────────────────────────────────

describe("proxy: scope discipline", () => {
  it("passes through the /posts listing (no slug) without invoking slug-existence", async () => {
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("passes through /posts/ (trailing slash, no slug) without invoking slug-existence", async () => {
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/") as any,
    )) as unknown as NextResult;
    expect(result.kind).toBe(NEXT);
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("does not redirect non-/posts/ paths even if they end in punctuation", async () => {
    // Trailing-punctuation redirect is scoped strictly to `/posts/<slug>`.
    const cases = [
      "/about'",
      "/agentic-design-patterns/reflexion'",
      "/posts-nested/foo'",
      "/api/health.",
    ];
    for (const path of cases) {
      const result = (await proxy(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        makeRequest(path) as any,
      )) as unknown as { kind: symbol };
      expect(result.kind, `input=${path}`).not.toBe(REDIRECT);
    }
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("does not set Last-Modified on the homepage", async () => {
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBeNull();
  });

  it("does not set Last-Modified on unrelated nested paths", async () => {
    const cases = [
      "/posts-nested/foo",
      "/api/health",
      "/admin",
      "/test-error",
    ];
    for (const path of cases) {
      const result = (await proxy(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        makeRequest(path) as any,
      )) as unknown as NextResult;
      expect(result.headers.get("Last-Modified"), `path=${path}`).toBeNull();
    }
    expect(postUpdatedAtMock).not.toHaveBeenCalled();
    expect(patternUpdatedAtMock).not.toHaveBeenCalled();
    expect(aboutUpdatedAtMock).not.toHaveBeenCalled();
  });

  it("treats /agentic-design-patterns/changelog as a slug-shape path that resolves to no pattern", async () => {
    // The URL `/agentic-design-patterns/changelog` matches the
    // `:slug` shape, so the proxy WILL invoke the pattern lookup. The
    // lookup returns null (no pattern with slug "changelog") and no
    // header is emitted. This is correct: the changelog page is its own
    // route under the app, and treating it as a non-pattern slug is
    // benign — one wasted lookup at request time, no incorrect header.
    patternUpdatedAtMock.mockResolvedValue(null);
    const result = (await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/agentic-design-patterns/changelog") as any,
    )) as unknown as NextResult;
    expect(result.headers.get("Last-Modified")).toBeNull();
    expect(patternUpdatedAtMock).toHaveBeenCalledWith("changelog");
  });
});
