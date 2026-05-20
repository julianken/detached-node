import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
//
// `logWarning` is the only side-channel; assert it on the failure path.
// `NEXT_PUBLIC_SERVER_URL` is read directly via `process.env` in the
// helper (see comment in src/lib/indexnow.ts:readSiteUrl) so we set it
// per-test rather than mocking `@/lib/site-config`.

const logWarningMock = vi.fn();

vi.mock("@/lib/logging", () => ({
  logWarning: logWarningMock,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("notifyIndexNow", () => {
  const ORIGINAL_ENV = process.env;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_SERVER_URL: "https://detached-node.dev" };
    logWarningMock.mockReset();
    fetchSpy = vi.fn();
    // Stub global fetch — every test asserts on it directly.
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("POSTs the expected body shape to the fan-out endpoint", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    const { notifyIndexNow, INDEXNOW_KEY } = await import("@/lib/indexnow");

    await notifyIndexNow([
      "https://detached-node.dev/posts/some-post",
      "https://detached-node.dev/about",
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.indexnow.org/IndexNow");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });

    const parsed = JSON.parse(init.body as string);
    expect(parsed).toEqual({
      host: "detached-node.dev",
      key: INDEXNOW_KEY,
      keyLocation: `https://detached-node.dev/${INDEXNOW_KEY}.txt`,
      urlList: [
        "https://detached-node.dev/posts/some-post",
        "https://detached-node.dev/about",
      ],
    });

    // Success path must not log a warning.
    expect(logWarningMock).not.toHaveBeenCalled();
  });

  it("is a no-op (no fetch, no warning) when given an empty URL list", async () => {
    const { notifyIndexNow } = await import("@/lib/indexnow");

    await notifyIndexNow([]);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(logWarningMock).not.toHaveBeenCalled();
  });

  it("does not throw when fetch rejects; logs INDEXNOW_NOTIFY_FAILED warning", async () => {
    fetchSpy.mockRejectedValue(new Error("ECONNREFUSED"));

    const { notifyIndexNow } = await import("@/lib/indexnow");

    // The assertion that matters: resolves successfully despite network throw.
    await expect(
      notifyIndexNow(["https://detached-node.dev/posts/x"]),
    ).resolves.toBeUndefined();

    expect(logWarningMock).toHaveBeenCalledTimes(1);
    const [message, context, errorId] = logWarningMock.mock.calls[0];
    expect(message).toMatch(/IndexNow notify request threw/i);
    expect(errorId).toBe("INDEXNOW_NOTIFY_FAILED");
    expect(context).toMatchObject({
      error: "ECONNREFUSED",
      urls: ["https://detached-node.dev/posts/x"],
      host: "detached-node.dev",
    });
  });

  it("does not throw on a non-2xx response; logs INDEXNOW_NOTIFY_FAILED warning with status", async () => {
    fetchSpy.mockResolvedValue(
      new Response("rate limited", { status: 429, statusText: "Too Many Requests" }),
    );

    const { notifyIndexNow } = await import("@/lib/indexnow");

    await expect(
      notifyIndexNow(["https://detached-node.dev/posts/y"]),
    ).resolves.toBeUndefined();

    expect(logWarningMock).toHaveBeenCalledTimes(1);
    const [message, context, errorId] = logWarningMock.mock.calls[0];
    expect(message).toMatch(/non-2xx \(429\)/);
    expect(errorId).toBe("INDEXNOW_NOTIFY_FAILED");
    expect(context).toMatchObject({
      status: 429,
      statusText: "Too Many Requests",
      urls: ["https://detached-node.dev/posts/y"],
      host: "detached-node.dev",
    });
  });

  it("treats a 204 No Content as a successful submission (no warning)", async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

    const { notifyIndexNow } = await import("@/lib/indexnow");

    await notifyIndexNow(["https://detached-node.dev/posts/z"]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(logWarningMock).not.toHaveBeenCalled();
  });
});
