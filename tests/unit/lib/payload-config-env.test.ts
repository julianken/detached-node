import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("payload.config env-preflight wiring", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.PAYLOAD_SECRET;
    delete process.env.DATABASE_URL;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("fails loudly naming all three required vars when none are set", async () => {
    let message = "";
    try {
      await import("@/payload.config");
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain("Missing required environment variables");
    expect(message).toContain("PAYLOAD_SECRET");
    expect(message).toContain("DATABASE_URL");
    expect(message).toContain("NEXT_PUBLIC_SERVER_URL");
  });
});

describe("required-env error docs pointer", () => {
  it("points at a heading that exists in docs/deployment.md", () => {
    const docs = readFileSync(
      join(process.cwd(), "docs/deployment.md"),
      "utf8"
    );
    // The H3 slug GitHub generates from this line is #preview-environment,
    // which the validator's error message hard-codes. A rename here rots the
    // error message silently — this test catches that.
    expect(docs).toMatch(/^### Preview Environment\s*$/m);
  });
});
