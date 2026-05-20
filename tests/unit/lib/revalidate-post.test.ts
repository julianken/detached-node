import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
//
// `revalidatePath` is mocked to a no-op spy (we don't care what paths
// were revalidated here; that's covered indirectly by the existing app
// behaviour and the hook structure is unchanged). The interesting
// assertion is the IndexNow URL list.
//
// The hook reads NEXT_PUBLIC_SERVER_URL directly via `process.env`
// (see src/lib/revalidate-post.ts:getSiteOrigin) — we set it per-test.

const revalidatePathMock = vi.fn();
const notifyIndexNowMock = vi.fn<(urls: string[]) => Promise<void>>(async () => undefined);

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/indexnow", () => ({
  notifyIndexNow: notifyIndexNowMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ChangeArgs = Parameters<CollectionAfterChangeHook>[0];
type DeleteArgs = Parameters<CollectionAfterDeleteHook>[0];

function makeChangeArgs(overrides: {
  doc: Record<string, unknown>;
  previousDoc?: Record<string, unknown>;
  operation?: ChangeArgs["operation"];
}): ChangeArgs {
  return {
    doc: overrides.doc,
    previousDoc: overrides.previousDoc ?? {},
    operation: overrides.operation ?? "update",
    req: {} as ChangeArgs["req"],
    collection: {} as ChangeArgs["collection"],
    context: {},
  } as unknown as ChangeArgs;
}

function makeDeleteArgs(doc: Record<string, unknown>): DeleteArgs {
  return {
    doc,
    id: (doc.id as string | number | undefined) ?? "test-id",
    req: {} as DeleteArgs["req"],
    collection: {} as DeleteArgs["collection"],
    context: {},
  } as unknown as DeleteArgs;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("revalidate-post hooks: IndexNow integration", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_SERVER_URL: "https://detached-node.dev" };
    revalidatePathMock.mockReset();
    notifyIndexNowMock.mockReset();
    notifyIndexNowMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.clearAllMocks();
  });

  it("revalidateAfterChange notifies IndexNow with the full post URL", async () => {
    const { revalidateAfterChange } = await import("@/lib/revalidate-post");

    revalidateAfterChange(
      makeChangeArgs({
        doc: { id: 1, slug: "my-new-post" },
        previousDoc: { id: 1, slug: "my-new-post" },
      }),
    );

    expect(notifyIndexNowMock).toHaveBeenCalledTimes(1);
    expect(notifyIndexNowMock.mock.calls[0][0]).toEqual([
      "https://detached-node.dev/posts/my-new-post",
    ]);
  });

  it("revalidateAfterChange on slug rename notifies both the new and old post URLs", async () => {
    const { revalidateAfterChange } = await import("@/lib/revalidate-post");

    revalidateAfterChange(
      makeChangeArgs({
        doc: { id: 1, slug: "new-slug" },
        previousDoc: { id: 1, slug: "old-slug" },
      }),
    );

    expect(notifyIndexNowMock).toHaveBeenCalledTimes(1);
    expect(notifyIndexNowMock.mock.calls[0][0]).toEqual([
      "https://detached-node.dev/posts/new-slug",
      "https://detached-node.dev/posts/old-slug",
    ]);
  });

  it("revalidateAfterChange does not call notify when doc has no slug", async () => {
    const { revalidateAfterChange } = await import("@/lib/revalidate-post");

    revalidateAfterChange(makeChangeArgs({ doc: { id: 1 } }));

    expect(notifyIndexNowMock).not.toHaveBeenCalled();
  });

  it("revalidateAfterDelete notifies IndexNow with the deleted post URL", async () => {
    const { revalidateAfterDelete } = await import("@/lib/revalidate-post");

    revalidateAfterDelete(makeDeleteArgs({ id: 1, slug: "removed-post" }));

    expect(notifyIndexNowMock).toHaveBeenCalledTimes(1);
    expect(notifyIndexNowMock.mock.calls[0][0]).toEqual([
      "https://detached-node.dev/posts/removed-post",
    ]);
  });

  it("does not throw when notifyIndexNow rejects (fire-and-forget guarantee)", async () => {
    notifyIndexNowMock.mockRejectedValueOnce(new Error("network down"));

    const { revalidateAfterChange } = await import("@/lib/revalidate-post");

    // The hook itself is synchronous; the rejection happens in a
    // detached promise. We assert the hook returns without throwing.
    expect(() =>
      revalidateAfterChange(
        makeChangeArgs({
          doc: { id: 1, slug: "x" },
          previousDoc: { id: 1, slug: "x" },
        }),
      ),
    ).not.toThrow();

    // Give the rejected promise a tick to settle so we don't leave an
    // unhandled rejection on the loop.
    await new Promise((r) => setTimeout(r, 0));
  });
});
