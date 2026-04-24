import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { FadeReveal } from "@/components/FadeReveal";

describe("FadeReveal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function getRevealClass(container: HTMLElement): Promise<string> {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    return container.firstElementChild?.className ?? "";
  }

  it("reveals on mount without waiting for images", async () => {
    const { container } = render(
      <FadeReveal>
        <img alt="a" src="/slow.png" />
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

    expect(container.firstElementChild?.className ?? "").toContain(
      "opacity-0",
    );
  });
});
