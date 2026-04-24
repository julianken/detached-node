/**
 * Rich text utilities for Lexical editor content
 */

/**
 * Lexical text node structure
 */
export interface LexicalTextNode {
  mode: "normal";
  text: string;
  type: "text";
  style: string;
  detail: number;
  format: number;
  version: number;
}

/**
 * Lexical paragraph node structure
 */
export interface LexicalParagraphNode {
  type: "paragraph";
  format: string;
  indent: number;
  version: number;
  children: LexicalTextNode[];
  direction: "ltr" | "rtl";
  textStyle: string;
  textFormat: number;
}

/**
 * Lexical root node structure
 */
export interface LexicalRootNode {
  type: "root";
  format: string;
  indent: number;
  version: number;
  children: LexicalParagraphNode[];
  direction: "ltr" | "rtl";
}

/**
 * Complete Lexical editor state structure
 */
export interface LexicalEditorState {
  root: LexicalRootNode;
}

/**
 * Create a simple Lexical rich text structure with a single paragraph
 * Useful for seeding test data or programmatic content creation
 */
export function createRichText(text: string): LexicalEditorState {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              mode: "normal",
              text,
              type: "text",
              style: "",
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: "ltr",
          textStyle: "",
          textFormat: 0,
        },
      ],
      direction: "ltr",
    },
  };
}

/**
 * Lexical block node structure (for Payload CMS blocks feature)
 */
export interface LexicalBlockNode {
  type: "block";
  format: string;
  version: number;
  fields: {
    id: string;
    blockType: string;
    blockName: string;
    [key: string]: unknown;
  };
}

/**
 * Create a Lexical editor state containing a single mermaid block node.
 * The block is wrapped with a leading and trailing paragraph so prose
 * rendering has context around the diagram.
 *
 * @param mermaidSource - Raw mermaid diagram source (e.g. sequenceDiagram …)
 * @param blockId - Stable UUID for the block (must be unique per post; caller
 *   supplies it so seeds remain deterministic across runs)
 */
export function createRichTextWithMermaid(
  mermaidSource: string,
  blockId: string,
): LexicalEditorState {
  const mermaidNode: LexicalBlockNode = {
    type: "block",
    format: "",
    version: 1,
    fields: {
      id: blockId,
      blockType: "mermaid",
      blockName: "",
      code: mermaidSource,
    },
  };

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      // LexicalRootNode.children is typed as LexicalParagraphNode[], but at
      // runtime Payload accepts any valid Lexical node in the children array.
      // The cast is intentional here for seeding purposes only.
      children: [mermaidNode] as unknown as LexicalParagraphNode[],
      direction: "ltr",
    },
  };
}

/**
 * Create a Lexical rich text structure with multiple paragraphs
 * Each string in the array becomes a separate paragraph
 */
export function createRichTextMulti(paragraphs: string[]): LexicalEditorState {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: paragraphs.map(
        (text): LexicalParagraphNode => ({
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              mode: "normal",
              text,
              type: "text",
              style: "",
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: "ltr",
          textStyle: "",
          textFormat: 0,
        })
      ),
      direction: "ltr",
    },
  };
}
