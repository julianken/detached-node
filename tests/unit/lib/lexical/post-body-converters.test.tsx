import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

// Mock MermaidDiagram so we don't need the real runtime.
vi.mock("@/components/MermaidDiagram", () => ({
  MermaidDiagram: ({ source }: { source: string }) => (
    <div data-testid="mermaid-diagram" data-source={source}>
      mocked-diagram
    </div>
  ),
}));

// MermaidDiagram transitively pulls in next-themes; stub it.
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

import { RichText } from "@payloadcms/richtext-lexical/react";
import { postBodyConverters } from "@/lib/lexical/post-body-converters";

// ---------------------------------------------------------------------------
// Helpers — minimal SerializedEditorState fixtures
// ---------------------------------------------------------------------------

type AnyNode = SerializedEditorState["root"]["children"][number];

function makeText(text: string): AnyNode {
  return {
    type: "text",
    version: 1,
    text,
    format: 0,
    style: "",
    mode: "normal",
    detail: 0,
  } as unknown as AnyNode;
}

function makeLink(opts: {
  url: string;
  linkType?: "custom" | "internal";
  newTab?: boolean;
  childText: string;
}): AnyNode {
  return {
    type: "link",
    version: 1,
    format: "",
    indent: 0,
    direction: "ltr",
    fields: {
      linkType: opts.linkType ?? "custom",
      newTab: opts.newTab ?? false,
      url: opts.url,
    },
    children: [makeText(opts.childText)],
  } as unknown as AnyNode;
}

function makeParagraph(children: AnyNode[]): AnyNode {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    textStyle: "",
    textFormat: 0,
    children,
  } as unknown as AnyNode;
}

function makeRoot(children: AnyNode[]): SerializedEditorState {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children,
    },
  } as unknown as SerializedEditorState;
}

function renderWithLink(opts: Parameters<typeof makeLink>[0]) {
  return render(
    <RichText
      data={makeRoot([makeParagraph([makeLink(opts)])])}
      converters={postBodyConverters}
    />,
  );
}

// ---------------------------------------------------------------------------

describe("postBodyConverters", () => {
  describe("citation links (#ref-N)", () => {
    it("wraps a #ref-1 link in <sup>", () => {
      const { container } = renderWithLink({
        url: "#ref-1",
        childText: "[1]",
      });

      const sup = container.querySelector("sup");
      expect(sup).not.toBeNull();
      const anchor = sup?.querySelector("a");
      expect(anchor).not.toBeNull();
      expect(anchor).toHaveAttribute("href", "#ref-1");
      expect(anchor?.textContent).toBe("[1]");
    });

    it("wraps multi-digit #ref-123 in <sup>", () => {
      const { container } = renderWithLink({
        url: "#ref-123",
        childText: "[123]",
      });

      const sup = container.querySelector("sup");
      expect(sup).not.toBeNull();
      expect(sup?.querySelector("a")).toHaveAttribute("href", "#ref-123");
    });

    it("preserves whatever the author typed inside the link", () => {
      const { container } = renderWithLink({
        url: "#ref-2",
        childText: "see note 2",
      });

      const sup = container.querySelector("sup");
      expect(sup?.textContent).toBe("see note 2");
    });
  });

  describe("non-citation links (BLOCKER regression check)", () => {
    it("plain external link renders as a normal <a> — NOT wrapped in <sup>", () => {
      // This is the BLOCKER from the V1 spec: returning null for
      // non-citation links would silently delete the node entirely because
      // Payload's converter loop filters null with .filter(Boolean).
      const { container } = renderWithLink({
        url: "https://example.com",
        childText: "example",
      });

      const anchor = container.querySelector("a");
      expect(anchor).not.toBeNull();
      expect(anchor).toHaveAttribute("href", "https://example.com");
      expect(anchor?.textContent).toBe("example");
      // Critical: the anchor must NOT be wrapped in <sup>.
      expect(container.querySelector("sup")).toBeNull();
    });

    it("internal-doc link renders as the default internal-anchor render — NOT wrapped in <sup>", () => {
      const { container } = render(
        <RichText
          data={makeRoot([
            makeParagraph([
              makeLink({
                url: "",
                linkType: "internal",
                childText: "internal post",
              }),
            ]),
          ])}
          converters={postBodyConverters}
        />,
      );

      // Internal links resolve via internalDocToHref (we route to "#" so
      // they render as a real anchor element rather than being dropped).
      const anchor = container.querySelector("a");
      expect(anchor).not.toBeNull();
      expect(anchor?.textContent).toBe("internal post");
      expect(container.querySelector("sup")).toBeNull();
    });

    it("#ref- with no digit is NOT treated as a citation", () => {
      const { container } = renderWithLink({
        url: "#ref-",
        childText: "not a citation",
      });

      expect(container.querySelector("sup")).toBeNull();
      const anchor = container.querySelector("a");
      expect(anchor).toHaveAttribute("href", "#ref-");
      expect(anchor?.textContent).toBe("not a citation");
    });

    it("#ref-abc (non-numeric suffix) is NOT treated as a citation", () => {
      const { container } = renderWithLink({
        url: "#ref-abc",
        childText: "alpha",
      });

      expect(container.querySelector("sup")).toBeNull();
      const anchor = container.querySelector("a");
      expect(anchor).toHaveAttribute("href", "#ref-abc");
    });

    it("a custom-type link with empty url renders without crashing or null-deleting", () => {
      const { container } = renderWithLink({
        url: "",
        childText: "empty-url link",
      });

      // The anchor should still exist (the default link converter renders
      // <a href="">…</a>). What we are guarding against is the node being
      // silently filtered out.
      const anchor = container.querySelector("a");
      expect(anchor).not.toBeNull();
      expect(anchor?.textContent).toBe("empty-url link");
      expect(container.querySelector("sup")).toBeNull();
    });
  });

  describe("Mermaid composition", () => {
    it("still renders Mermaid blocks (composition with mermaidConverters preserved)", () => {
      const source = "graph LR; A-->B";
      const mermaidNode = {
        type: "block",
        format: "",
        version: 2,
        fields: {
          id: "block-1",
          blockName: "",
          blockType: "mermaid",
          code: source,
        },
      } as unknown as AnyNode;

      render(
        <RichText
          data={makeRoot([mermaidNode])}
          converters={postBodyConverters}
        />,
      );

      const diagram = screen.getByTestId("mermaid-diagram");
      expect(diagram).toBeInTheDocument();
      expect(diagram).toHaveAttribute("data-source", source);
    });
  });

  describe("passthrough", () => {
    it("paragraph with plain text still renders as <p>", () => {
      render(
        <RichText
          data={makeRoot([makeParagraph([makeText("hello world")])])}
          converters={postBodyConverters}
        />,
      );

      const p = screen.getByText("hello world");
      expect(p.tagName).toBe("P");
    });
  });
});
