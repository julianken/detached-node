// src/lib/site-config.ts
//
// Centralized site constants for metadata, OG images, and schema generators.
// Import from this module — not from src/lib/schema/config — for page-level
// metadata and URL construction. The schema library also re-exports siteUrl
// from its own config for internal use; this module is the authoritative
// source for frontend page components.

export { siteUrl } from './site-url'

export const siteName = "detached-node";

export const siteDescription =
  "Exploring modern agentic AI workflows, autonomous systems, and the philosophy of machine intelligence.";

export const siteAuthor = "detached-node";

export const siteKeywords = [
  "agentic AI",
  "autonomous systems",
  "AI workflows",
  "machine intelligence",
  "failure modes",
];

export const ogDefaultImage = "/og-default.png";
