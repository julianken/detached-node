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
