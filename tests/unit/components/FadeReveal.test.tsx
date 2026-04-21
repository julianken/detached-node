import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { FadeReveal } from "@/components/FadeReveal";

/**
 * FadeReveal holds children at opacity:0 until every <img> inside has
 * resolved, then swaps to the `glitch-reveal` class. A hidden image
 * (display:none) with loading="lazy" will never fire a load event because
 * the browser skips the fetch — FadeReveal must treat those as already
 * resolved, otherwise it stalls until the 3s safety timeout and the page
 * feels broken.
 */
describe("FadeReveal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function getRevealClass(container: HTMLElement): Promise<string> {
    // Let the post-mount useEffect flush.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    return container.firstElementChild?.className ?? "";
  }

  it("reveals immediately when there are no images", async () => {
    const { container } = render(
      <FadeReveal>
        <p>content</p>
      </FadeReveal>,
    );

    const cls = await getRevealClass(container);
    expect(cls).toContain("glitch-reveal");
  });

  it("reveals immediately when every image is already complete", async () => {
    const { container } = render(
      <FadeReveal>
        <img alt="a" />
      </FadeReveal>,
    );

    // jsdom reports complete=true for <img> with no src by default
    const cls = await getRevealClass(container);
    expect(cls).toContain("glitch-reveal");
  });

  it("skips images hidden via display:none instead of waiting on them", async () => {
    // A `display:none` image with loading="lazy" never fires `load` — the
    // browser correctly skips the fetch. Before the fix, FadeReveal stalled
    // on this case until the 3s timeout. Regression test isolates the
    // hidden image alone; if it's not skipped, `ready` stays false.
    const { container } = render(
      <FadeReveal>
        <img
          alt="hidden"
          loading="lazy"
          style={{ display: "none" }}
          src="/never-fetched.png"
        />
      </FadeReveal>,
    );

    const cls = await getRevealClass(container);
    expect(cls).toContain("glitch-reveal");
  });

  it("renders children at opacity:0 initially", () => {
    const { container } = render(
      <FadeReveal>
        <div>content</div>
      </FadeReveal>,
    );

    // Inspect before any timers run.
    expect(container.firstElementChild?.className ?? "").toContain(
      "opacity-0",
    );
  });
});
