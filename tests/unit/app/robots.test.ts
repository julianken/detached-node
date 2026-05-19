import { describe, it, expect } from "vitest";

// `siteUrl` calls `assertRequiredEnv` at module load (see
// `src/lib/site-url.ts`). Stub the env before importing the route
// module under jsdom — matches the pattern in
// `tests/unit/app/posts-slug-page.test.ts`.
process.env.NEXT_PUBLIC_SERVER_URL ||= "http://localhost:3000";

/**
 * Issue #417: the robots route handler must emit explicit named blocks
 * for AI + search crawlers plus the existing wildcard fallback, and
 * preserve the sitemap pointer.
 *
 * The structured snapshot lives in
 * `tests/unit/lib/robots-config.test.ts`; this suite covers the wiring
 * between the route handler and the config module (sitemap URL, shape
 * of the returned `MetadataRoute.Robots` object).
 */

describe("robots route handler", () => {
  it("returns a MetadataRoute.Robots object with rules + sitemap", async () => {
    const { default: robots } = await import("@/app/robots");
    const result = robots();
    expect(result).toHaveProperty("rules");
    expect(Array.isArray(result.rules)).toBe(true);
    expect(result).toHaveProperty("sitemap");
  });

  it("points the sitemap at <siteUrl>/sitemap.xml", async () => {
    const { default: robots } = await import("@/app/robots");
    const { siteUrl } = await import("@/lib/site-config");
    const result = robots();
    expect(result.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });

  it("delegates rule construction to buildRobotsRules()", async () => {
    const { default: robots } = await import("@/app/robots");
    const { buildRobotsRules } = await import("@/lib/robots-config");
    expect(robots().rules).toEqual(buildRobotsRules());
  });
});
