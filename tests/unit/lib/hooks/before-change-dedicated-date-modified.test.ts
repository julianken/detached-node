import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { beforeChangeDedicatedDateModified } from "@/lib/hooks/before-change-dedicated-date-modified";
import type { CollectionBeforeChangeHook } from "payload";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type HookArgs = Parameters<CollectionBeforeChangeHook>[0];

/**
 * Build a minimal fake Payload beforeChange args object. `data` and
 * `originalDoc` are passed through unchanged; `operation` defaults to
 * "update" because that is the path with real branching logic.
 */
function makeArgs(overrides: {
  data?: Record<string, unknown>;
  originalDoc?: Record<string, unknown>;
  operation?: HookArgs["operation"];
}): HookArgs {
  return {
    data: overrides.data ?? {},
    originalDoc: overrides.originalDoc,
    operation: overrides.operation ?? "update",
    req: {} as HookArgs["req"],
    collection: {} as HookArgs["collection"],
    context: {},
  } as unknown as HookArgs;
}

/**
 * Convenience caller: the hook is sync, but `CollectionBeforeChangeHook`'s
 * return type is unioned with a Promise so callers must unwrap. Cast away
 * because all branches in this hook are synchronous.
 */
function runHook(args: HookArgs): Record<string, unknown> {
  return beforeChangeDedicatedDateModified(args) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Fixed-clock fixtures
// ---------------------------------------------------------------------------

const FIRST_STAMP_DATE = new Date("2026-05-17T10:00:00.000Z");
const SECOND_STAMP_DATE = new Date("2026-06-01T12:34:56.000Z");
const PRIOR_STAMP_ISO = "2026-05-10T08:00:00.000Z";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("beforeChangeDedicatedDateModified", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("create operation passes data through unchanged (does not stamp)", () => {
    vi.setSystemTime(FIRST_STAMP_DATE);
    const data = { title: "New post", body: { root: {} }, summary: "s" };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: undefined,
        operation: "create",
      }),
    );
    expect(result).toBe(data);
    expect(result.dedicatedDateModified).toBeUndefined();
  });

  it("first stamp: body changed, field not in partial, originalDoc has no prior value → stamps current ISO", () => {
    vi.setSystemTime(FIRST_STAMP_DATE);
    const data = { body: { root: { children: [] } } };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: {
          id: 1,
          title: "Old title",
          dedicatedDateModified: null,
        },
      }),
    );
    expect(result.dedicatedDateModified).toBe(FIRST_STAMP_DATE.toISOString());
  });

  it("second stamp on subsequent body change: re-stamps even when originalDoc already has a prior ISO (regression for partial-data bug)", () => {
    vi.setSystemTime(SECOND_STAMP_DATE);
    const data = { body: { root: { children: [{ text: "edited again" }] } } };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: {
          id: 1,
          title: "Title",
          dedicatedDateModified: PRIOR_STAMP_ISO,
        },
      }),
    );
    expect(result.dedicatedDateModified).toBe(SECOND_STAMP_DATE.toISOString());
    expect(result.dedicatedDateModified).not.toBe(PRIOR_STAMP_ISO);
  });

  it("editor manual override: dedicatedDateModified IS in the partial → preserves the editor value, does not overwrite", () => {
    vi.setSystemTime(SECOND_STAMP_DATE);
    const editorValue = "2026-04-01T00:00:00.000Z";
    const data = {
      body: { root: { children: [{ text: "also edited body" }] } },
      dedicatedDateModified: editorValue,
    };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: {
          id: 1,
          dedicatedDateModified: PRIOR_STAMP_ISO,
        },
      }),
    );
    expect(result.dedicatedDateModified).toBe(editorValue);
  });

  it("editor manual override with explicit null: null IS in the partial → preserves null, does not stamp", () => {
    vi.setSystemTime(SECOND_STAMP_DATE);
    const data = {
      body: { root: { children: [{ text: "edited" }] } },
      dedicatedDateModified: null,
    };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: {
          id: 1,
          dedicatedDateModified: PRIOR_STAMP_ISO,
        },
      }),
    );
    expect(result.dedicatedDateModified).toBeNull();
  });

  it("no-op for non-content field change: partial has only featured: true → does NOT stamp", () => {
    vi.setSystemTime(SECOND_STAMP_DATE);
    const data = { featured: true };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: {
          id: 1,
          title: "Title",
          dedicatedDateModified: PRIOR_STAMP_ISO,
        },
      }),
    );
    expect(result.dedicatedDateModified).toBeUndefined();
    expect(result.featured).toBe(true);
  });

  it("title-only change stamps (title is a meaningful content field)", () => {
    vi.setSystemTime(FIRST_STAMP_DATE);
    const data = { title: "Renamed" };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: { id: 1, title: "Old", dedicatedDateModified: null },
      }),
    );
    expect(result.dedicatedDateModified).toBe(FIRST_STAMP_DATE.toISOString());
  });

  it("summary-only change stamps (summary is a meaningful content field)", () => {
    vi.setSystemTime(FIRST_STAMP_DATE);
    const data = { summary: "New summary" };
    const result = runHook(
      makeArgs({
        data,
        originalDoc: { id: 1, summary: "Old", dedicatedDateModified: null },
      }),
    );
    expect(result.dedicatedDateModified).toBe(FIRST_STAMP_DATE.toISOString());
  });
});
