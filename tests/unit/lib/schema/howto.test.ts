import { describe, it, expect, vi } from "vitest";

// Mock site config so generateHowToSchema doesn't pull in
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

import { generateHowToSchema } from "@/lib/schema/howto";
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
    title: "How to debug an agentic workflow",
    slug: "how-to-debug-agentic-workflow",
    type: "essay",
    summary:
      "A short procedural walkthrough for diagnosing failures in an agentic coding loop using trajectory logs.",
    featuredImageLight: 1,
    featuredImageDark: 2,
    body: baseBody,
    status: "published",
    publishedAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-15T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    schemaType: "HowTo",
    ...overrides,
  } as Post;
}

// ---------------------------------------------------------------------------
// Null-return cases (empty-steps fallback)
// ---------------------------------------------------------------------------

describe("generateHowToSchema — null-return cases", () => {
  it("returns null when post.steps is missing entirely", () => {
    const post = makePost({});
    expect(generateHowToSchema(post)).toBeNull();
  });

  it("returns null when post.steps is an empty array", () => {
    const post = makePost({ steps: [] });
    expect(generateHowToSchema(post)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Populated emission cases
// ---------------------------------------------------------------------------

describe("generateHowToSchema — populated cases", () => {
  const stepsFixture = [
    { name: "Capture the trajectory", text: "Save the agent's full message history to a JSON file." },
    { name: "Identify the divergence point", text: "Diff the trajectory against the last known-good run." },
    { name: "Replay with logging on", text: "Re-run the agent with verbose logging enabled and inspect the failing tool call." },
  ];

  it("emits @context and @type HowTo when steps are present", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema).not.toBeNull();
    expect(schema!["@context"]).toBe("https://schema.org");
    expect(schema!["@type"]).toBe("HowTo");
  });

  it("@id uses the canonical post URL with #article suffix", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema!["@id"]).toBe(
      "https://detached-node.dev/posts/how-to-debug-agentic-workflow#article",
    );
  });

  it("name field copies the post title verbatim", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema!.name).toBe("How to debug an agentic workflow");
  });

  it("description copies post.summary when present", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema!.description).toBe(
      "A short procedural walkthrough for diagnosing failures in an agentic coding loop using trajectory logs.",
    );
  });

  it("step array length matches steps fixture length", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema!.step).toHaveLength(stepsFixture.length);
  });

  it("each step has @type HowToStep and copies name + text verbatim", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    for (let i = 0; i < stepsFixture.length; i++) {
      expect(schema!.step[i]["@type"]).toBe("HowToStep");
      expect(schema!.step[i].name).toBe(stepsFixture[i].name);
      expect(schema!.step[i].text).toBe(stepsFixture[i].text);
    }
  });

  it("preserves step order from the source array", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    const names = schema!.step.map((s) => s.name);
    expect(names).toEqual([
      "Capture the trajectory",
      "Identify the divergence point",
      "Replay with logging on",
    ]);
  });

  it("author and publisher both reference AUTHOR_CONFIG.id by @id", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema!.author).toEqual({ "@id": "https://detached-node.dev/#author" });
    expect(schema!.publisher).toEqual({ "@id": "https://detached-node.dev/#author" });
  });

  it("isPartOf references the WebSite @id", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    expect(schema!.isPartOf).toEqual({ "@id": "https://detached-node.dev/#website" });
  });

  it("datePublished and dateModified come from post fields", () => {
    const post = makePost({
      steps: stepsFixture,
      publishedAt: "2026-04-01T00:00:00.000Z",
      dedicatedDateModified: "2026-04-20T00:00:00.000Z",
    });
    const schema = generateHowToSchema(post);
    expect(schema!.datePublished).toBe("2026-04-01T00:00:00.000Z");
    expect(schema!.dateModified).toBe("2026-04-20T00:00:00.000Z");
  });

  it("dateModified falls back to updatedAt when dedicatedDateModified is absent", () => {
    const post = makePost({
      steps: stepsFixture,
      updatedAt: "2026-04-15T00:00:00.000Z",
    });
    const schema = generateHowToSchema(post);
    expect(schema!.dateModified).toBe("2026-04-15T00:00:00.000Z");
  });

  it("omits image when featuredImageLight is not a populated Media object", () => {
    const post = makePost({ steps: stepsFixture, featuredImageLight: 99 });
    const schema = generateHowToSchema(post);
    expect(schema!.image).toBeUndefined();
  });

  it("emits image when featuredImageLight is a populated Media object with a url", () => {
    const post = makePost({
      steps: stepsFixture,
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
    const schema = generateHowToSchema(post);
    expect(schema!.image).toEqual({
      "@type": "ImageObject",
      url: "https://detached-node.dev/media/hero.png",
      width: 1920,
      height: 1080,
      description: "Hero",
    });
  });

  it("does NOT include articleSection (HowTo inherits from CreativeWork, not Article)", () => {
    const post = makePost({ steps: stepsFixture });
    const schema = generateHowToSchema(post);
    // HowTo doesn't carry articleSection in our generator; this guards
    // against a future refactor accidentally adding it via copy-paste from
    // BlogPosting or TechArticle.
    expect((schema as unknown as { articleSection?: string }).articleSection).toBeUndefined();
  });
});
