import { describe, it, expect, vi } from "vitest";

// Mock site config so generateTechArticleSchema doesn't pull in
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

import { generateTechArticleSchema } from "@/lib/schema/tech-article";
import type { Post } from "@/payload-types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseBody = {
  root: {
    type: "root",
    children: [],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  },
};

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 1,
    title: "Rethinking systems in the agentic age",
    slug: "rethinking-systems-in-the-agentic-age",
    type: "essay",
    summary:
      "A technical analysis of how agentic primitives reshape the boundaries of systems we used to call services.",
    featuredImageLight: 1,
    featuredImageDark: 2,
    body: baseBody,
    status: "published",
    publishedAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-15T00:00:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
    schemaType: "TechArticle",
    ...overrides,
  } as Post;
}

// ---------------------------------------------------------------------------
// Required fields and identity
// ---------------------------------------------------------------------------

describe("generateTechArticleSchema — required fields", () => {
  it("emits @context and @type TechArticle", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("TechArticle");
  });

  it("@id uses the canonical post URL with #article suffix", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema["@id"]).toBe(
      "https://detached-node.dev/posts/rethinking-systems-in-the-agentic-age#article",
    );
  });

  it("headline copies post.title verbatim", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema.headline).toBe("Rethinking systems in the agentic age");
  });

  it("url is the canonical post URL (no fragment)", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema.url).toBe(
      "https://detached-node.dev/posts/rethinking-systems-in-the-agentic-age",
    );
  });

  it("author and publisher both reference AUTHOR_CONFIG.id by @id", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema.author).toEqual({ "@id": "https://detached-node.dev/#author" });
    expect(schema.publisher).toEqual({ "@id": "https://detached-node.dev/#author" });
  });

  it("isPartOf references the WebSite @id", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema.isPartOf).toEqual({ "@id": "https://detached-node.dev/#website" });
  });
});

// ---------------------------------------------------------------------------
// Optional fields
// ---------------------------------------------------------------------------

describe("generateTechArticleSchema — optional fields", () => {
  it("description copies post.summary when present", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(schema.description).toBe(
      "A technical analysis of how agentic primitives reshape the boundaries of systems we used to call services.",
    );
  });

  it("datePublished and dateModified come from post fields", () => {
    const post = makePost({
      publishedAt: "2026-03-01T00:00:00.000Z",
      dedicatedDateModified: "2026-03-20T00:00:00.000Z",
    });
    const schema = generateTechArticleSchema(post);
    expect(schema.datePublished).toBe("2026-03-01T00:00:00.000Z");
    expect(schema.dateModified).toBe("2026-03-20T00:00:00.000Z");
  });

  it("dateModified falls back to updatedAt when dedicatedDateModified is absent", () => {
    const post = makePost({
      updatedAt: "2026-03-15T00:00:00.000Z",
    });
    const schema = generateTechArticleSchema(post);
    expect(schema.dateModified).toBe("2026-03-15T00:00:00.000Z");
  });

  it("articleSection copies post.type (TechArticle inherits from Article)", () => {
    const post = makePost({ type: "decoder" });
    const schema = generateTechArticleSchema(post);
    expect(schema.articleSection).toBe("decoder");
  });

  it("omits image when featuredImageLight is not a populated Media object", () => {
    const post = makePost({ featuredImageLight: 99 });
    const schema = generateTechArticleSchema(post);
    expect(schema.image).toBeUndefined();
  });

  it("emits image when featuredImageLight is a populated Media object with a url", () => {
    const post = makePost({
      featuredImageLight: {
        id: 1,
        url: "https://detached-node.dev/media/hero.png",
        width: 1920,
        height: 1080,
        alt: "Hero",
        mimeType: "image/png",
        filename: "hero.png",
        filesize: 12345,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      } as unknown as Post["featuredImageLight"],
    });
    const schema = generateTechArticleSchema(post);
    expect(schema.image).toEqual({
      "@type": "ImageObject",
      url: "https://detached-node.dev/media/hero.png",
      width: 1920,
      height: 1080,
      description: "Hero",
    });
  });
});

// ---------------------------------------------------------------------------
// Replace-strategy contract
// ---------------------------------------------------------------------------

describe("generateTechArticleSchema — replace-strategy contract", () => {
  // The post detail page emits ONLY this schema when schemaType is
  // TechArticle (no co-emitted BlogPosting). This test pins the contract
  // that the generator's @type is the single primary type a crawler reads.
  it("@type is exactly the string 'TechArticle' (not an array)", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect(typeof schema["@type"]).toBe("string");
    expect(schema["@type"]).toBe("TechArticle");
  });

  it("does NOT include a `step` field (HowTo-only)", () => {
    const post = makePost({});
    const schema = generateTechArticleSchema(post);
    expect((schema as unknown as { step?: unknown }).step).toBeUndefined();
  });
});
