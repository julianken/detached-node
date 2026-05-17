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
  "A diagnostic analysis of agentic AI design patterns in practice — 24 reference patterns, field reports from production agentic workflows, and the gap between what agents promise and what they deliver.";

export const siteAuthor = "detached-node";

export const CONTACT_EMAIL = "julian.kennon.d@gmail.com";

export const siteKeywords = [
  "agentic AI",
  "autonomous systems",
  "AI workflows",
  "machine intelligence",
  "failure modes",
  "agentic design patterns",
  "AI agent design patterns",
  "agent design patterns",
  "LLM agent reference",
];

export const ogDefaultImage = "/og-default.png";
