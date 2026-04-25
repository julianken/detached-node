import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";

// vi.mock is hoisted, so use vi.hoisted to share mutable state safely.
const mocks = vi.hoisted(() => {
  const initialize = vi.fn();
  // Default: successful render
  const render = vi.fn((_id: string, source: string) =>
    Promise.resolve({ svg: `<svg data-source="${source}">mocked</svg>` }),
  );

  return {
    initialize,
    render,
    resolvedTheme: "light" as string | undefined,
    mounted: true,
  };
});

vi.mock("mermaid", () => ({
  default: {
    initialize: (...args: unknown[]) => mocks.initialize(...args),
    render: (id: string, source: string) => mocks.render(id, source),
  },
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: mocks.resolvedTheme }),
}));

// useSyncExternalStore is the "mounted" gate. Server snapshot → false, client → true.
// We override it to allow simulating the not-yet-mounted (SSR) state.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof React>();
  return {
    ...actual,
    useSyncExternalStore: (
      _subscribe: () => () => void,
      getSnapshot: () => boolean,
      getServerSnapshot?: () => boolean,
    ) => {
      if (!mocks.mounted && getServerSnapshot) return getServerSnapshot();
      return getSnapshot();
    },
  };
});

import { MermaidDiagram } from "@/components/MermaidDiagram";

describe("MermaidDiagram", () => {
  beforeEach(() => {
    mocks.resolvedTheme = "light";
    mocks.mounted = true;
    mocks.initialize.mockClear();
    mocks.render.mockClear();
    mocks.render.mockImplementation((_id: string, source: string) =>
      Promise.resolve({ svg: `<svg data-source="${source}">mocked</svg>` }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading skeleton when not yet mounted (resolvedTheme undefined)", () => {
    mocks.mounted = false;
    mocks.resolvedTheme = undefined;

    const { container } = render(<MermaidDiagram source="graph LR; A-->B" />);

    const skeleton = container.querySelector('[aria-label="Loading diagram"]');
    expect(skeleton).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders SVG after mermaid.render resolves with light theme", async () => {
    mocks.resolvedTheme = "light";

    render(<MermaidDiagram source="graph LR; A-->B" />);

    const svgEl = await waitFor(() => {
      const el = document.querySelector('svg[data-source="graph LR; A-->B"]');
      if (!el) throw new Error("svg not yet rendered");
      return el;
    });

    expect(svgEl).toBeInTheDocument();
    expect(mocks.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "default" }),
    );
  });

  it("calls mermaid.initialize with theme:dark when resolvedTheme changes to dark", async () => {
    mocks.resolvedTheme = "light";

    const { rerender } = render(<MermaidDiagram source="graph TD; X-->Y" />);

    // Wait for the initial render to complete (svg in DOM)
    await waitFor(() => {
      if (!document.querySelector('svg[data-source="graph TD; X-->Y"]'))
        throw new Error("initial render pending");
    });

    const callsBefore = mocks.initialize.mock.calls.length;

    // Switch to dark theme — must trigger re-initialize
    mocks.resolvedTheme = "dark";
    await act(async () => {
      rerender(<MermaidDiagram source="graph TD; X-->Y" />);
    });

    await waitFor(() => {
      const darkCalls = mocks.initialize.mock.calls.filter(
        (call) => call[0]?.theme === "dark",
      );
      expect(darkCalls.length).toBeGreaterThan(0);
    });

    // initialize was called at least once more (with dark) after the theme change
    expect(mocks.initialize.mock.calls.length).toBeGreaterThan(callsBefore);
    // render was called at least twice total
    expect(mocks.render.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("renders an error fallback when mermaid.render rejects", async () => {
    mocks.render.mockImplementation(() =>
      Promise.reject(new Error("invalid syntax")),
    );

    render(<MermaidDiagram source="not valid mermaid" />);

    const alert = await waitFor(() => screen.getByRole("alert"));
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/failed to render/i);

    const pre = document.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toContain("not valid mermaid");
  });

  it("cancels the pending close timer when the trigger is clicked again mid-close (F1 race)", async () => {
    render(<MermaidDiagram source="graph LR; A-->B" />);

    // Wait for the SVG to render so the trigger button is visible (real timers).
    await waitFor(() => {
      if (!document.querySelector('svg[data-source="graph LR; A-->B"]'))
        throw new Error("svg not yet rendered");
    });

    const trigger = screen.getByRole("button", { name: /expand diagram/i });
    const dialog = document.querySelector("dialog") as HTMLDialogElement;

    // Mock showModal / close on the dialog (jsdom does not implement them).
    dialog.showModal = vi.fn();
    dialog.close = vi.fn();

    // Query the Close button directly; screen.getByRole skips elements
    // inside a dialog that jsdom treats as not yet open.
    const closeBtn = dialog.querySelector(
      'button[aria-label="Close"]',
    ) as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    // Switch to fake timers now that async setup is done. This lets us
    // precisely control the 600ms close animation delay without polling.
    vi.useFakeTimers();

    try {
      // 1. Open the lightbox.
      act(() => { trigger.click(); });
      expect(dialog.showModal).toHaveBeenCalledTimes(1);

      // 2. Click the close button — starts the 600ms animation timer.
      act(() => { closeBtn.click(); });

      // The timer is running but has NOT fired yet.
      expect(dialog.close).not.toHaveBeenCalled();

      // 3. Re-open before the timer fires (simulating rapid close→reopen).
      act(() => { trigger.click(); });
      expect(dialog.showModal).toHaveBeenCalledTimes(2);

      // 4. Advance past the original 600ms deadline.
      act(() => { vi.advanceTimersByTime(700); });

      // The dialog must NOT have been closed — the timer was cancelled.
      expect(dialog.close).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

});
