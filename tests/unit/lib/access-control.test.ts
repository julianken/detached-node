import { describe, it, expect } from "vitest";
import { publishedOrAuthenticated, publicRead } from "@/lib/access-control";

describe("publishedOrAuthenticated", () => {
  it("returns true when user is authenticated", () => {
    const result = publishedOrAuthenticated({
      req: { user: { id: "123", email: "test@example.com" } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(result).toBe(true);
  });

  it("returns published filter when user is null", () => {
    const result = publishedOrAuthenticated({
      req: { user: null },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(result).toEqual({ status: { equals: "published" } });
  });

  it("returns published filter when user is undefined", () => {
    const result = publishedOrAuthenticated({
      req: { user: undefined },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(result).toEqual({ status: { equals: "published" } });
  });

  it("allows any truthy user object", () => {
    const result = publishedOrAuthenticated({
      req: { user: { id: "any-user" } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(result).toBe(true);
  });
});

describe("publicRead", () => {
  it("always returns true", () => {
    expect(publicRead({} as never)).toBe(true);
  });

  it("returns true regardless of user status", () => {
    expect(
      publicRead({
        req: { user: null },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toBe(true);

    expect(
      publicRead({
        req: { user: { id: "123" } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toBe(true);
  });
});
