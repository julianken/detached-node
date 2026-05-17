import { describe, it, expect, vi } from "vitest";

// Mock the schema config module to avoid the NEXT_PUBLIC_SERVER_URL env check
// that fires at import time in src/lib/site-url.ts. Mocks reflect post-Tier-C
// AUTHOR_CONFIG shape (real name + jobTitle + knowsAbout).
vi.mock("@/lib/schema/config", () => ({
  SITE_CONFIG: {
    url: "https://detached-node.com",
    name: "detached-node",
    description: "Test description",
    websiteId: "https://detached-node.com/#website",
  },
  AUTHOR_CONFIG: {
    name: "Julian Kennon",
    alternateName: "detached-node",
    url: "https://detached-node.com/about",
    id: "https://detached-node.com/#author",
    sameAs: [
      "https://github.com/julianken",
      "https://www.linkedin.com/in/julian-kennon",
    ],
    description: "Software engineer focused on agentic AI workflows.",
    jobTitle: "Software Engineer",
    knowsAbout: [
      "Agentic AI design patterns",
      "Distributed systems",
      "TypeScript",
    ],
  },
}));

import { generateProfilePageSchema } from "@/lib/schema/profile-page";
import { SITE_CONFIG, AUTHOR_CONFIG } from "@/lib/schema/config";

// ---------------------------------------------------------------------------
// generateProfilePageSchema
// ---------------------------------------------------------------------------

describe("generateProfilePageSchema", () => {
  it("returns top-level @context and @type ProfilePage", () => {
    const schema = generateProfilePageSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("ProfilePage");
  });

  it("@id is the canonical ProfilePage identifier (about#profile-page)", () => {
    const schema = generateProfilePageSchema();
    expect(schema["@id"]).toBe(`${SITE_CONFIG.url}/about#profile-page`);
  });

  it("url points at /about", () => {
    const schema = generateProfilePageSchema();
    expect(schema.url).toBe(`${SITE_CONFIG.url}/about`);
  });

  it("name embeds author display name and site name", () => {
    const schema = generateProfilePageSchema();
    expect(schema.name).toBe(
      `About ${AUTHOR_CONFIG.name} — ${SITE_CONFIG.name}`
    );
  });

  it("isPartOf links to the canonical WebSite via @id", () => {
    const schema = generateProfilePageSchema();
    expect(schema.isPartOf).toEqual({ "@id": SITE_CONFIG.websiteId });
  });

  it("embeds Person as mainEntity with @type and @id, but NOT @context (matches Google's example)", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity["@type"]).toBe("Person");
    expect(schema.mainEntity["@id"]).toBe(AUTHOR_CONFIG.id);
    // Embedded Person must not carry @context — it lives on the top-level
    // ProfilePage only.
    expect("@context" in schema.mainEntity).toBe(false);
  });

  it("mainEntity.name matches AUTHOR_CONFIG.name (real name, not pseudonym)", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity.name).toBe(AUTHOR_CONFIG.name);
    expect(schema.mainEntity.name).toBe("Julian Kennon");
  });

  it("mainEntity.alternateName is the brand alias 'detached-node'", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity.alternateName).toBe(AUTHOR_CONFIG.alternateName);
    expect(schema.mainEntity.alternateName).toBe("detached-node");
  });

  it("mainEntity.url points at /about (canonical author page)", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity.url).toBe(AUTHOR_CONFIG.url);
  });

  it("mainEntity.sameAs is a fresh array, not the same reference as AUTHOR_CONFIG.sameAs", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity.sameAs).toEqual([...AUTHOR_CONFIG.sameAs]);
    // Mutation of the schema array must not affect the const config array.
    expect(schema.mainEntity.sameAs).not.toBe(AUTHOR_CONFIG.sameAs);
  });

  it("mainEntity carries description, jobTitle, knowsAbout from config", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity.description).toBe(AUTHOR_CONFIG.description);
    expect(schema.mainEntity.jobTitle).toBe(AUTHOR_CONFIG.jobTitle);
    expect(schema.mainEntity.knowsAbout).toEqual([...AUTHOR_CONFIG.knowsAbout]);
  });

  it("mainEntity.knowsAbout is a fresh array, not the same reference as AUTHOR_CONFIG.knowsAbout", () => {
    const schema = generateProfilePageSchema();
    expect(schema.mainEntity.knowsAbout).not.toBe(AUTHOR_CONFIG.knowsAbout);
  });
});
