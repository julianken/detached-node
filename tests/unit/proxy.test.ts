import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// NextResponse mock: capture redirect target + status for assertions,
// emit sentinels for `.next()` and bare 404 responses so we can assert
// each branch.
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
};

type ResponseResult = {
  kind: typeof RESPONSE;
  status: number;
  cacheControl: string | undefined;
  contentType: string | undefined;
  body: string;
};

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
      return { kind: NEXT };
    }
    constructor(body: BodyInit | null, init?: ResponseInit) {
      const headers = new Headers(init?.headers);
      return {
        kind: RESPONSE,
        status: init?.status ?? 200,
        cacheControl: headers.get("cache-control") ?? undefined,
        contentType: headers.get("content-type") ?? undefined,
        body: typeof body === "string" ? body : "",
      } as unknown as ResponseResult;
    }
  },
}));

import { proxy, __testing__ } from "@/proxy";

/**
 * Construct a minimal NextRequest-shaped object that the proxy
 * function actually reads from: `nextUrl.pathname`, `nextUrl.search`,
 * and `url`. Avoids pulling the full NextRequest constructor (which
 * needs the Web `Request` polyfill and a request-context store).
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

beforeEach(() => {
  slugExistsMock.mockReset();
  // Default: slug exists in DB (passes through). Tests that need a
  // missing or DB-failure path override per-test.
  slugExistsMock.mockResolvedValue(true);
  __testing__.setPostSlugExists(slugExistsMock);
});

afterEach(() => {
  __testing__.resetPostSlugExists();
});

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
});

describe("proxy: soft-404 short-circuit", () => {
  it("passes a clean /posts/<slug> path through when the post exists", async () => {
    slugExistsMock.mockResolvedValue(true);
    const result = await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/agentic-patterns") as any,
    );
    expect(result).toMatchObject({ kind: NEXT });
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
  });

  it("falls open (passes through) when the existence check returns null", async () => {
    // null = DB unavailable / fail-open path. The page handler will
    // still try and call notFound() — we don't want a transient DB
    // outage to paint the entire post route 404.
    slugExistsMock.mockResolvedValue(null);
    const result = await proxy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest("/posts/some-slug") as any,
    );
    expect(result).toMatchObject({ kind: NEXT });
  });
});

describe("proxy: scope discipline", () => {
  it("passes through the /posts listing (no slug) unchanged", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await proxy(makeRequest("/posts") as any);
    expect(result).toMatchObject({ kind: NEXT });
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("passes through /posts/ (trailing slash, no slug) unchanged", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await proxy(makeRequest("/posts/") as any);
    expect(result).toMatchObject({ kind: NEXT });
    expect(slugExistsMock).not.toHaveBeenCalled();
  });

  it("does not touch non-/posts/ paths even if they end in punctuation", async () => {
    const cases = [
      "/about'",
      "/agentic-design-patterns/reflexion'",
      "/posts-nested/foo'",
      "/api/health.",
    ];
    for (const path of cases) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await proxy(makeRequest(path) as any);
      expect(result, `input=${path}`).toMatchObject({ kind: NEXT });
    }
    expect(slugExistsMock).not.toHaveBeenCalled();
  });
});
