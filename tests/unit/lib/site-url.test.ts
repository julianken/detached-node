import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("site-url module", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("throws when NEXT_PUBLIC_SERVER_URL is unset", async () => {
    await expect(import("@/lib/site-url")).rejects.toThrow(
      /Missing required environment variables.*NEXT_PUBLIC_SERVER_URL/,
    );
  });

  it("exports siteUrl equal to NEXT_PUBLIC_SERVER_URL when the var is set", async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = "https://example.com";
    const { siteUrl } = await import("@/lib/site-url");
    expect(siteUrl).toBe("https://example.com");
  });

  // Regression tripwire: assertRequiredEnv currently accepts whitespace-only values.
  // This test documents that boundary so a future tightening of assertRequiredEnv
  // (a separate issue) would intentionally update it rather than silently pass.
  it("does not throw on whitespace-only NEXT_PUBLIC_SERVER_URL (documents current assertRequiredEnv boundary)", async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = "   ";
    const { siteUrl } = await import("@/lib/site-url");
    expect(siteUrl).toBe("   ");
  });
});
