/**
 * Issue #426 regression test: the frontend layout must only emit the
 * Microsoft Clarity <Script> tag when `NEXT_PUBLIC_CLARITY_PROJECT_ID`
 * is set, and the emitted script body must contain the localhost runtime
 * guard plus the project ID interpolated via `JSON.stringify`.
 *
 * Three properties are asserted:
 *
 *   1. Env var unset (or empty)  -> NO Clarity <Script> tag.
 *   2. Env var set                -> Clarity <Script> tag is emitted, AND
 *      its body contains (a) the localhost/127.0.0.1/::1 hostname guard,
 *      (b) the project ID wrapped in JSON-quoted form (so a value with
 *      embedded quotes or backslashes would not break the script).
 *
 * The layout module imports a lot of components that are not relevant to
 * the Clarity gate — fonts, providers, nav, etc. We mock all of them down
 * to inert primitives so the render is fast and so we don't have to
 * provision a DB / fonts / next-themes wiring in the unit-test env. The
 * mocks are intentionally minimal: we only need the rendered HTML to
 * include the Clarity <Script> output when (and only when) the env var
 * is set.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Module-load-time env stub so site-config doesn't throw via
// `assertRequiredEnv` on `NEXT_PUBLIC_SERVER_URL`.
process.env.NEXT_PUBLIC_SERVER_URL ||= "http://localhost:3000";

// Capture the original env value (if any) so we can restore it after the
// test suite. Different tests in this file mutate the var; restoring at
// teardown prevents leakage into unrelated tests in the same vitest run.
const ORIGINAL_CLARITY = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

// next/font/google is a build-time codegen helper; under jsdom it
// just needs to return something with .variable so the className
// interpolation in the layout doesn't choke.
vi.mock("next/font/google", () => ({
  Crimson_Pro: () => ({ variable: "--font-crimson" }),
  JetBrains_Mono: () => ({ variable: "--font-jetbrains" }),
}));

// next/script renders a <script id="..."> with the children as inner text
// in our usage. The real component does the same on SSR, but it pulls in
// next/head and other deps we don't want at unit-test time. The mock below
// is enough to make `expect(html).toContain("microsoft-clarity")` and
// inner-body assertions work.
vi.mock("next/script", () => ({
  default: ({
    id,
    children,
  }: {
    id?: string;
    children?: React.ReactNode;
    strategy?: string;
  }) =>
    React.createElement(
      "script",
      { id, "data-testid": "script-" + id },
      children,
    ),
}));

// next-view-transitions: render Link as a plain <a> and ViewTransitions
// as a pass-through wrapper. Mirrors `tests/unit/setup.ts` for next/link.
vi.mock("next-view-transitions", () => ({
  Link: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [k: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
  ViewTransitions: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Each of these client components owns hooks that don't behave under
// renderToStaticMarkup (useSyncExternalStore, usePathname with the real
// router context, next-themes provider plumbing, etc.). Inert stubs let
// us assert on the layout-level structure without dragging the whole
// frontend into the test.
vi.mock("@/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
vi.mock("@/components/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/MobileNav", () => ({ MobileNav: () => null }));
vi.mock("@/components/ScrollPillNav", () => ({ ScrollPillNav: () => null }));
vi.mock("@/components/NavLink", () => ({
  NavLink: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href }, children),
}));
vi.mock("@/components/GitHubLink", () => ({ GitHubLink: () => null }));
vi.mock("@/components/StatusBar", () => ({ StatusBar: () => null }));
vi.mock("@/components/ScrollToTop", () => ({ ScrollToTop: () => null }));
vi.mock("@/components/TextureOverlay", () => ({ TextureOverlay: () => null }));
vi.mock("@/components/WebVitalsReporter", () => ({
  WebVitalsReporter: () => null,
}));

// Load the layout module AFTER mocks are installed and AFTER the env var
// has been mutated by the test. Importing it once at the top would freeze
// `clarityProjectId` (which is read at module load) to whatever value the
// env had at first import — which would defeat the entire purpose of this
// test. `vi.resetModules()` in each test forces a fresh evaluation.
async function loadLayout() {
  vi.resetModules();
  const mod = await import("@/app/(frontend)/layout");
  return mod.default;
}

describe("FrontendLayout: Microsoft Clarity gate (issue #426)", () => {
  beforeEach(() => {
    // Each test sets the env explicitly. Start from a clean slate so a
    // previous test's value doesn't leak in.
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  });

  afterEach(() => {
    if (ORIGINAL_CLARITY === undefined) {
      delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    } else {
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = ORIGINAL_CLARITY;
    }
  });

  it("does NOT emit the Clarity <Script> tag when the env var is unset", async () => {
    // Defense A (build-time gate): with no project ID configured, the
    // layout must not emit the Clarity init script at all. This is the
    // case that protects dev, E2E, and any environment that forgets to
    // configure the var.
    expect(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID).toBeUndefined();
    const Layout = await loadLayout();
    const html = renderToStaticMarkup(
      React.createElement(Layout, null, React.createElement("div", null, "x")),
    );
    expect(html).not.toContain("microsoft-clarity");
    expect(html).not.toContain("clarity.ms");
  });

  it("does NOT emit the Clarity <Script> tag when the env var is empty", async () => {
    // Empty-string is the deploy-time accident we explicitly want to
    // protect against: if a CI step interpolates a missing repo Variable
    // as the empty string, we still don't want Clarity to load.
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "";
    const Layout = await loadLayout();
    const html = renderToStaticMarkup(
      React.createElement(Layout, null, React.createElement("div", null, "x")),
    );
    expect(html).not.toContain("microsoft-clarity");
    expect(html).not.toContain("clarity.ms");
  });

  it("emits the Clarity <Script> tag with the JSON-quoted project ID when the env var is set", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "wsu7mgk54v";
    const Layout = await loadLayout();
    const html = renderToStaticMarkup(
      React.createElement(Layout, null, React.createElement("div", null, "x")),
    );
    expect(html).toContain("microsoft-clarity");
    expect(html).toContain("clarity.ms");
    // JSON.stringify wraps the value in double quotes — the rendered
    // script body must contain `"wsu7mgk54v"` (quoted), not bare or
    // double-quoted. This is the Defense C interpolation-hygiene check.
    expect(html).toContain('"wsu7mgk54v"');
    // The exact 4-quote pattern `""wsu7mgk54v""` would mean someone
    // left the surrounding quotes in place around `${JSON.stringify(...)}`
    // (the bot's SUGGESTION #2 trap). If this appears, the inline script
    // is syntactically broken.
    expect(html).not.toContain('""wsu7mgk54v""');
  });

  it("emits the localhost runtime guard inside the inline Clarity script body", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "wsu7mgk54v";
    const Layout = await loadLayout();
    const html = renderToStaticMarkup(
      React.createElement(Layout, null, React.createElement("div", null, "x")),
    );
    // Defense B: the hostname guard short-circuits Clarity init before
    // any network request is made. All three minimum hostnames must be
    // present in the script body.
    expect(html).toContain('l.location.hostname === "localhost"');
    expect(html).toContain('l.location.hostname === "127.0.0.1"');
    expect(html).toContain('l.location.hostname === "::1"');
    // And the guard must be an early `return` — not a no-op log.
    expect(html).toMatch(/===\s*"::1"\)\s*return/);
  });

  it("survives a project ID containing characters that would break naive interpolation", async () => {
    // Hypothetical hostile / unusual env value. JSON.stringify must
    // escape the embedded double-quote so the resulting JavaScript is
    // still parseable.
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'evil"ID';
    const Layout = await loadLayout();
    const html = renderToStaticMarkup(
      React.createElement(Layout, null, React.createElement("div", null, "x")),
    );
    // JSON.stringify('evil"ID') === '"evil\\"ID"' — the inner `"` must
    // be backslash-escaped in the rendered output. React's HTML escaping
    // turns `"` into `&quot;` in attribute/text positions, so the
    // rendered HTML contains the escape via either `\"` or `\&quot;`.
    // The key invariant: the bare sequence `evil"ID"` (unescaped quote)
    // must NOT appear, which would prove JSON.stringify was skipped.
    expect(html).not.toMatch(/[^\\]evil"ID/);
  });
});
