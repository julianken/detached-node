import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { assertRequiredEnv } from "@/lib/env/required-env";

describe("assertRequiredEnv", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.FOO;
    delete process.env.BAR;
    delete process.env.NEXT_PHASE;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns the values when all required vars are present", () => {
    process.env.FOO = "x";
    process.env.BAR = "y";
    const result = assertRequiredEnv(["FOO", "BAR"] as const);
    expect(result).toEqual({ FOO: "x", BAR: "y" });
  });

  it("throws when a single required var is missing", () => {
    process.env.BAR = "y";
    expect(() => assertRequiredEnv(["FOO", "BAR"] as const)).toThrow(/FOO/);
  });

  it("reports all missing vars in a single throw (not just the first)", () => {
    let err: Error | undefined;
    try {
      assertRequiredEnv(["FOO", "BAR"] as const);
    } catch (e) {
      err = e as Error;
    }
    expect(err).toBeDefined();
    expect(err!.message).toMatch(/FOO/);
    expect(err!.message).toMatch(/BAR/);
  });

  it("treats empty string as missing", () => {
    process.env.FOO = "";
    process.env.BAR = "y";
    expect(() => assertRequiredEnv(["FOO", "BAR"] as const)).toThrow(/FOO/);
  });

  it("error message contains the literal 'Missing required environment variables' prefix", () => {
    expect(() => assertRequiredEnv(["FOO"] as const)).toThrow(
      /Missing required environment variables/
    );
  });

  it("includes the current phase in the error message", () => {
    process.env.NEXT_PHASE = "phase-production-build";
    expect(() => assertRequiredEnv(["FOO"] as const)).toThrow(
      /phase-production-build/
    );
  });

  it("restores process.env between tests (sanity)", () => {
    // FOO was deleted in beforeEach; this asserts no leak from earlier tests.
    expect(process.env.FOO).toBeUndefined();
    expect(process.env.BAR).toBeUndefined();
  });
});
