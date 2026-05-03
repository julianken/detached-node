import { describe, it, expect, vi } from "vitest";

// Mock the schema config module to avoid the NEXT_PUBLIC_SERVER_URL env check
// that fires at import time in src/lib/site-url.ts.
vi.mock("@/lib/schema/config", () => ({
  SITE_CONFIG: {
    url: "https://detached-node.com",
    name: "detached-node",
    description: "Test description",
    websiteId: "https://detached-node.com/#website",
  },
  AUTHOR_CONFIG: {
    name: "detached-node",
    url: "https://detached-node.com/about",
    id: "https://detached-node.com/#author",
    sameAs: ["https://github.com/detached-node"],
    description: "Writing on agentic AI workflows.",
  },
}));

import { generateHubChildBreadcrumb } from "@/lib/schema/breadcrumb";
import { SITE_CONFIG } from "@/lib/schema/config";

// ---------------------------------------------------------------------------
// generateHubChildBreadcrumb
// ---------------------------------------------------------------------------

describe("generateHubChildBreadcrumb", () => {
  const slug = "prompt-chaining";
  const name = "Prompt Chaining";

  it("returns @context and @type BreadcrumbList", () => {
    const schema = generateHubChildBreadcrumb(slug, name);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
  });

  it("returns exactly 3 itemListElement entries", () => {
    const schema = generateHubChildBreadcrumb(slug, name);
    expect(schema.itemListElement).toHaveLength(3);
  });

  it("first item is Home at SITE_CONFIG.url", () => {
    const schema = generateHubChildBreadcrumb(slug, name);
    const item = schema.itemListElement[0];
    expect(item["@type"]).toBe("ListItem");
    expect(item.position).toBe(1);
    expect(item.name).toBe("Home");
    expect(item.item).toBe(SITE_CONFIG.url);
  });

  it("second item is the hub (Agentic Design Patterns)", () => {
    const schema = generateHubChildBreadcrumb(slug, name);
    const item = schema.itemListElement[1];
    expect(item["@type"]).toBe("ListItem");
    expect(item.position).toBe(2);
    expect(item.name).toBe("Agentic Design Patterns");
    expect(item.item).toBe(`${SITE_CONFIG.url}/agentic-design-patterns`);
  });

  it("third item is the pattern satellite page", () => {
    const schema = generateHubChildBreadcrumb(slug, name);
    const item = schema.itemListElement[2];
    expect(item["@type"]).toBe("ListItem");
    expect(item.position).toBe(3);
    expect(item.name).toBe(name);
    expect(item.item).toBe(
      `${SITE_CONFIG.url}/agentic-design-patterns/${slug}`
    );
  });

  it("positions are 1-indexed and sequential", () => {
    const schema = generateHubChildBreadcrumb(slug, name);
    const positions = schema.itemListElement.map((i) => i.position);
    expect(positions).toEqual([1, 2, 3]);
  });

  it("uses the passed slug in the satellite URL (not hardcoded)", () => {
    const schema = generateHubChildBreadcrumb("multi-agent-debate", "Multi-Agent Debate");
    expect(schema.itemListElement[2].item).toContain("multi-agent-debate");
    expect(schema.itemListElement[2].name).toBe("Multi-Agent Debate");
  });

  it("parameter order is (slug, name) — slug drives URL, name drives label", () => {
    const schema = generateHubChildBreadcrumb("my-slug", "My Name");
    const leaf = schema.itemListElement[2];
    expect(leaf.item).toContain("my-slug");
    expect(leaf.name).toBe("My Name");
  });
});
