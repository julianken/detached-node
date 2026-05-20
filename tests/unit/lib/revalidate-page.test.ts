import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
//
// The hook reads NEXT_PUBLIC_SERVER_URL directly via `process.env`
// (see src/lib/revalidate-page.ts:getSiteOrigin) — we set it per-test.

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
}): ChangeArgs {
  return {
    doc: overrides.doc,
    previousDoc: overrides.previousDoc ?? {},
    operation: "update",
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

describe("revalidate-page hooks: IndexNow integration", () => {
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

  it("revalidateAfterChange notifies IndexNow with the full page URL (root-relative slug)", async () => {
    const { revalidateAfterChange } = await import("@/lib/revalidate-page");

    revalidateAfterChange(
      makeChangeArgs({
        doc: { id: 1, slug: "about" },
        previousDoc: { id: 1, slug: "about" },
      }),
    );

    expect(notifyIndexNowMock).toHaveBeenCalledTimes(1);
    expect(notifyIndexNowMock.mock.calls[0][0]).toEqual([
      "https://detached-node.dev/about",
    ]);
  });

  it("revalidateAfterChange on slug rename notifies both new and old page URLs", async () => {
    const { revalidateAfterChange } = await import("@/lib/revalidate-page");

    revalidateAfterChange(
      makeChangeArgs({
        doc: { id: 1, slug: "method" },
        previousDoc: { id: 1, slug: "about" },
      }),
    );

    expect(notifyIndexNowMock).toHaveBeenCalledTimes(1);
    expect(notifyIndexNowMock.mock.calls[0][0]).toEqual([
      "https://detached-node.dev/method",
      "https://detached-node.dev/about",
    ]);
  });

  it("revalidateAfterChange does not call notify when doc has no slug", async () => {
    const { revalidateAfterChange } = await import("@/lib/revalidate-page");

    revalidateAfterChange(makeChangeArgs({ doc: { id: 1 } }));

    expect(notifyIndexNowMock).not.toHaveBeenCalled();
  });

  it("revalidateAfterDelete notifies IndexNow with the deleted page URL", async () => {
    const { revalidateAfterDelete } = await import("@/lib/revalidate-page");

    revalidateAfterDelete(makeDeleteArgs({ id: 1, slug: "deprecated-page" }));

    expect(notifyIndexNowMock).toHaveBeenCalledTimes(1);
    expect(notifyIndexNowMock.mock.calls[0][0]).toEqual([
      "https://detached-node.dev/deprecated-page",
    ]);
  });
});
