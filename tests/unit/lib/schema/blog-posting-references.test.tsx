import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock site config so generateBlogPostingSchema doesn't pull in
// NEXT_PUBLIC_SERVER_URL at import time.
vi.mock("@/lib/schema/config", () => ({
  SITE_CONFIG: {
    url: "https://detached-node.dev",
    name: "detached-node",
    description: "Test description",
    websiteId: "https://detached-node.dev/#website",
  },
  AUTHOR_CONFIG: {
    name: "Julian",
    url: "https://detached-node.dev/about",
    id: "https://detached-node.dev/#author",
    sameAs: ["https://github.com/julianken"],
    description: "Writing on agentic AI workflows.",
  },
}));

import { generateBlogPostingSchema } from "@/lib/schema/blog-posting";
import { PostReferencesSection } from "@/components/PostReferencesSection";
import type { Post } from "@/payload-types";
import type { ReferenceInput } from "@/lib/schema/citation";

// ---------------------------------------------------------------------------
// Dual-consumer test
// ---------------------------------------------------------------------------
// The Post.references array drives TWO surfaces from a single source:
//
//   1. JSON-LD BlogPosting.citation (generateBlogPostingSchema → mapReferenceToCitation)
//   2. The visible bottom-of-post references list (PostReferencesSection)
//
// This test exists to fail loudly if a future refactor decouples those two
// surfaces — e.g. by introducing a separate "visible-references" field, or
// by changing the shape of one consumer but not the other. Asserting only
// one half (just the JSON-LD snapshot, or just the rendered DOM) would
// silently let the two diverge.
// ---------------------------------------------------------------------------

const sharedReferences: ReferenceInput[] = [
  {
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    author: "Vaswani et al.",
    publication: "NeurIPS",
    date: "2017-06-12",
  },
  {
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    url: "https://arxiv.org/abs/2210.03629",
    author: "Yao et al.",
    publication: "ICLR",
    date: "2023-03-10",
  },
];

const mockPost: Post = {
  id: 1,
  title: "Test post for dual-consumer reference contract",
  slug: "dual-consumer-references",
  type: "essay",
  summary:
    "A fixture-shaped post used to verify that references drive both JSON-LD and visible rendering from one source.",
  featuredImageLight: 1,
  featuredImageDark: 2,
  body: {
    root: {
      type: "root",
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  },
  references: sharedReferences,
  status: "published",
  publishedAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
  createdAt: "2026-01-15T00:00:00.000Z",
} as Post;

describe("Post references dual-consumer contract", () => {
  it("BlogPosting.citation matches the references array length", () => {
    const schema = generateBlogPostingSchema(mockPost);
    expect(schema.citation).toBeDefined();
    expect(schema.citation).toHaveLength(sharedReferences.length);
  });

  it("BlogPosting.citation snapshot is stable", () => {
    const schema = generateBlogPostingSchema(mockPost);
    expect(schema.citation).toMatchInlineSnapshot(`
      [
        {
          "@type": "ScholarlyArticle",
          "author": {
            "@type": "Person",
            "name": "Vaswani et al.",
          },
          "datePublished": "2017-06-12",
          "isPartOf": {
            "@type": "Website",
            "name": "NeurIPS",
          },
          "name": "Attention Is All You Need",
          "url": "https://arxiv.org/abs/1706.03762",
        },
        {
          "@type": "ScholarlyArticle",
          "author": {
            "@type": "Person",
            "name": "Yao et al.",
          },
          "datePublished": "2023-03-10",
          "isPartOf": {
            "@type": "Website",
            "name": "ICLR",
          },
          "name": "ReAct: Synergizing Reasoning and Acting in Language Models",
          "url": "https://arxiv.org/abs/2210.03629",
        },
      ]
    `);
  });

  it("PostReferencesSection renders one <li> per reference, matching titles and urls", () => {
    render(
      <PostReferencesSection references={mockPost.references ?? []} />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(sharedReferences.length);

    for (const ref of sharedReferences) {
      const link = screen.getByRole("link", { name: new RegExp(ref.title.split(":")[0], "i") });
      expect(link).toHaveAttribute("href", ref.url);
    }
  });

  it("JSON-LD citation names and visible <cite> titles use the same source data", () => {
    // Single source of truth check: walk both surfaces and assert the same
    // titles appear in both. A schema-level rename or a component-level
    // hard-coded list would break this.
    const schema = generateBlogPostingSchema(mockPost);
    const jsonLdNames = (schema.citation ?? []).map((c) => c.name);

    const { container } = render(
      <PostReferencesSection references={mockPost.references ?? []} />,
    );
    const visibleTitles = Array.from(container.querySelectorAll("cite")).map(
      (el) => el.textContent ?? "",
    );

    expect(jsonLdNames).toEqual(sharedReferences.map((r) => r.title));
    expect(visibleTitles).toEqual(sharedReferences.map((r) => r.title));
    expect(jsonLdNames).toEqual(visibleTitles);
  });
});
