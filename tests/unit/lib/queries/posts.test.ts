import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Unit tests for `postSlugExists` (issue #414 follow-up).
 *
 * The proxy at `src/proxy.ts` calls this query on every uncached
 * `/posts/<slug>` request — the whole point of swapping it in for
 * `getPostBySlug` is to avoid pulling the full Post document (Lexical
 * body, references, joined media) just to answer existence. These tests
 * pin the contract that makes that saving real:
 *
 *   - select is { slug: true } only (no other field requested)
 *   - depth is 0 (no relationship joins)
 *   - limit is 1 (Payload knows existence is the only question)
 *   - filter is { slug equals, status equals 'published' } (matches the
 *     published-post contract enforced elsewhere)
 *
 * The full-doc loader `getPostBySlug` lives downstream in the page
 * handler; nothing here should accidentally start pulling that payload.
 */

const findMock = vi.fn();

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({
    find: findMock,
  })),
}));

vi.mock("@payload-config", () => ({
  default: {},
}));

vi.mock("@/lib/logging", () => ({
  logError: vi.fn(),
}));

import { postSlugExists } from "@/lib/queries/posts";

beforeEach(() => {
  findMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("postSlugExists", () => {
  it("returns true when a published post with the slug exists", async () => {
    findMock.mockResolvedValue({ docs: [{ id: "1", slug: "real-slug" }] });

    const result = await postSlugExists("real-slug");

    expect(result).toBe(true);
  });

  it("returns false when no matching published post exists", async () => {
    findMock.mockResolvedValue({ docs: [] });

    const result = await postSlugExists("does-not-exist");

    expect(result).toBe(false);
  });

  it("uses field projection (select: { slug: true } only) — no full doc load", async () => {
    findMock.mockResolvedValue({ docs: [] });

    await postSlugExists("any-slug");

    expect(findMock).toHaveBeenCalledTimes(1);
    const callArgs = findMock.mock.calls[0][0];
    // The whole point of this query: select narrows to slug ONLY.
    // No body, no references, no featured-image relationships.
    expect(callArgs.select).toEqual({ slug: true });
  });

  it("passes depth: 0 (no relationship joins) and limit: 1", async () => {
    findMock.mockResolvedValue({ docs: [] });

    await postSlugExists("any-slug");

    const callArgs = findMock.mock.calls[0][0];
    expect(callArgs.depth).toBe(0);
    expect(callArgs.limit).toBe(1);
  });

  it("queries the posts collection filtered by slug + published status", async () => {
    findMock.mockResolvedValue({ docs: [] });

    await postSlugExists("agentic-patterns");

    const callArgs = findMock.mock.calls[0][0];
    expect(callArgs.collection).toBe("posts");
    expect(callArgs.where).toEqual({
      slug: { equals: "agentic-patterns" },
      status: { equals: "published" },
    });
  });

  it("returns false for format-invalid slugs without hitting the DB", async () => {
    // Mixed-case fails `isValidSlug` (lowercase + hyphens only).
    const result = await postSlugExists("Mixed-Case");

    expect(result).toBe(false);
    expect(findMock).not.toHaveBeenCalled();
  });

  it("returns false for empty-string slugs without hitting the DB", async () => {
    const result = await postSlugExists("");

    expect(result).toBe(false);
    expect(findMock).not.toHaveBeenCalled();
  });

  it("propagates DB errors so the proxy fail-open wrapper can translate them", async () => {
    findMock.mockRejectedValue(new Error("connection refused"));

    await expect(postSlugExists("any-slug")).rejects.toThrow(
      "connection refused",
    );
  });
});
