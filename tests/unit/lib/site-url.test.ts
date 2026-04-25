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
    let message = "";
    try {
      await import("@/lib/site-url");
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain("Missing required environment variables");
    expect(message).toContain("NEXT_PUBLIC_SERVER_URL");
  });

  it("exports siteUrl equal to NEXT_PUBLIC_SERVER_URL when the var is set", async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = "https://example.com";
    const { siteUrl } = await import("@/lib/site-url");
    expect(siteUrl).toBe("https://example.com");
  });
});
