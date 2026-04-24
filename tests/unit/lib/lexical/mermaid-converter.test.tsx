import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

// Mock MermaidDiagram so the test doesn't need the real mermaid runtime.
vi.mock("@/components/MermaidDiagram", () => ({
  MermaidDiagram: ({ source }: { source: string }) => (
    <div data-testid="mermaid-diagram" data-source={source}>
      mocked-diagram
    </div>
  ),
}));

// Mock next-themes (MermaidDiagram import still pulls it in transitively)
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

import { RichText } from "@payloadcms/richtext-lexical/react";
import { mermaidConverters } from "@/lib/lexical/mermaid-converter";

// ---------------------------------------------------------------------------
// Helpers to build minimal SerializedEditorState fixtures
// ---------------------------------------------------------------------------

function makeMermaidState(code: string): SerializedEditorState {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "block",
          format: "",
          version: 2,
          fields: {
            id: "block-1",
            blockName: "",
            blockType: "mermaid",
            code,
          },
        } as unknown as SerializedEditorState["root"]["children"][number],
      ],
    },
  } as unknown as SerializedEditorState;
}

function makeParagraphState(text: string): SerializedEditorState {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          textStyle: "",
          textFormat: 0,
          children: [
            {
              type: "text",
              version: 1,
              text,
              format: 0,
              style: "",
              mode: "normal",
              detail: 0,
            },
          ],
        },
      ],
    },
  } as unknown as SerializedEditorState;
}

// ---------------------------------------------------------------------------

describe("mermaidConverters", () => {
  it("renders <MermaidDiagram> for a mermaid block node", () => {
    const source = "graph LR; A-->B";
    render(
      <RichText data={makeMermaidState(source)} converters={mermaidConverters} />,
    );

    const diagram = screen.getByTestId("mermaid-diagram");
    expect(diagram).toBeInTheDocument();
    expect(diagram).toHaveAttribute("data-source", source);
  });

  it("passes through non-mermaid nodes (paragraph renders as <p>)", () => {
    render(
      <RichText
        data={makeParagraphState("Hello world")}
        converters={mermaidConverters}
      />,
    );

    const p = screen.getByText("Hello world");
    expect(p.tagName).toBe("P");
    expect(screen.queryByTestId("mermaid-diagram")).toBeNull();
  });
});
