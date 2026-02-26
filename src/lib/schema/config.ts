// src/lib/schema/config.ts
//
// Author entity configuration and site constants for JSON-LD schema generation.
//
// AUTHOR IDENTITY DECISION POINT:
// The author name and sameAs values are set here. When identity is finalized,
// update:
//   1. AUTHOR_CONFIG.name  — real name or finalized pseudonym
//   2. AUTHOR_CONFIG.sameAs — add LinkedIn, Twitter, or other verifiable profiles
//   3. AUTHOR_CONFIG.description — update biography text
//
// These are the only changes needed for author identity migration. All schema
// generators reference AUTHOR_CONFIG and will pick up the update automatically.

const siteUrl =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://detached-node.dev";

const siteName = "Detached Node";

const siteDescription =
  "Exploring modern agentic AI workflows, autonomous systems, and the philosophy of machine intelligence.";

export { siteUrl };

export const SITE_CONFIG = {
  url: siteUrl,
  name: siteName,
  description: siteDescription,
  // Canonical WebSite entity identifier used across all schemas
  websiteId: `${siteUrl}/#website`,
} as const;

export const AUTHOR_CONFIG = {
  // Decision: Using pseudonym "detached-node" as the author identity.
  // Update name to real name or final pseudonym when identity is decided.
  name: "detached-node",
  // Canonical author page — the semantic owner of the Person schema
  url: `${siteUrl}/about`,
  // @id: canonical identifier referenced by WebSite, BlogPosting, and Person schemas.
  // Must be identical in every schema that references the author entity.
  id: `${siteUrl}/#author`,
  // sameAs: external verifiable profiles for entity disambiguation.
  // GitHub org is the one confirmed external reference at launch.
  // Add LinkedIn/Twitter/etc. when/if disclosed.
  sameAs: ["https://github.com/detached-node"] as string[],
  description:
    "Writing on agentic AI workflows, autonomous systems, and machine intelligence.",
} as const;
