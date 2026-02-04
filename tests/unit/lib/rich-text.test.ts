import { describe, it, expect } from "vitest";
import { createRichText } from "@/lib/rich-text";
import type { LexicalEditorState } from "@/lib/rich-text";

describe("createRichText", () => {
  it("returns valid Lexical editor state structure", () => {
    const result = createRichText("Hello");

    expect(result).toHaveProperty("root");
    expect(result.root).toHaveProperty("type", "root");
    expect(result.root).toHaveProperty("children");
  });

  it("creates a single paragraph with the text", () => {
    const result = createRichText("Test content");

    expect(result.root.children).toHaveLength(1);
    expect(result.root.children[0].type).toBe("paragraph");
    expect(result.root.children[0].children[0].text).toBe("Test content");
  });

  it("sets correct text node properties", () => {
    const result = createRichText("Sample");
    const textNode = result.root.children[0].children[0];

    expect(textNode.mode).toBe("normal");
    expect(textNode.type).toBe("text");
    expect(textNode.style).toBe("");
    expect(textNode.detail).toBe(0);
    expect(textNode.format).toBe(0);
    expect(textNode.version).toBe(1);
  });

  it("sets correct paragraph node properties", () => {
    const result = createRichText("Sample");
    const paragraphNode = result.root.children[0];

    expect(paragraphNode.format).toBe("");
    expect(paragraphNode.indent).toBe(0);
    expect(paragraphNode.version).toBe(1);
    expect(paragraphNode.direction).toBe("ltr");
    expect(paragraphNode.textStyle).toBe("");
    expect(paragraphNode.textFormat).toBe(0);
  });

  it("sets correct root node properties", () => {
    const result = createRichText("Sample");

    expect(result.root.format).toBe("");
    expect(result.root.indent).toBe(0);
    expect(result.root.version).toBe(1);
    expect(result.root.direction).toBe("ltr");
  });

  it("handles empty string input", () => {
    const result = createRichText("");

    expect(result.root.children[0].children[0].text).toBe("");
  });

  it("handles special characters in text", () => {
    const result = createRichText('Hello "World" & <Others>');

    expect(result.root.children[0].children[0].text).toBe(
      'Hello "World" & <Others>'
    );
  });

  it("handles multiline text as single text node", () => {
    const result = createRichText("Line 1\nLine 2\nLine 3");

    // The function creates a single text node with the newlines preserved
    expect(result.root.children[0].children[0].text).toBe(
      "Line 1\nLine 2\nLine 3"
    );
  });

  it("handles unicode characters", () => {
    const result = createRichText("Hello 你好 مرحبا");

    expect(result.root.children[0].children[0].text).toBe("Hello 你好 مرحبا");
  });

  it("matches expected Lexical structure for Payload CMS", () => {
    const result: LexicalEditorState = createRichText("Test");

    // Verify the structure matches what Payload's Lexical field expects
    expect(typeof result.root.type).toBe("string");
    expect(Array.isArray(result.root.children)).toBe(true);
    expect(typeof result.root.children[0].type).toBe("string");
    expect(Array.isArray(result.root.children[0].children)).toBe(true);
  });
});
