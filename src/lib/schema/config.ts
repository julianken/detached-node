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

import { siteUrl } from '../site-url'

const siteName = "detached-node";

const siteDescription =
  "A tech blog and reference catalog on agentic AI.";

export { siteUrl };

export const SITE_CONFIG = {
  url: siteUrl,
  name: siteName,
  description: siteDescription,
  // Canonical WebSite entity identifier used across all schemas
  websiteId: `${siteUrl}/#website`,
} as const;

export const AUTHOR_CONFIG = {
  // Tier C identity migration: real name in schema; brand "detached-node" stays as siteName.
  name: "Julian Kennon",
  url: `${siteUrl}/about`,
  id: `${siteUrl}/#author`,
  sameAs: [
    "https://github.com/julianken",
    "https://www.linkedin.com/in/julian-kennon",
  ] as string[],
  description:
    "Software engineer with a decade-plus of full-stack experience, focused on agentic AI workflows and autonomous system design. Author of the agentic design patterns reference catalog at detached-node.dev.",
  jobTitle: "Software Engineer",
  knowsAbout: [
    "Agentic AI design patterns",
    "Autonomous software systems",
    "Full-stack software engineering",
    "LLM orchestration",
    "Multi-agent systems",
    "Prompt engineering",
    "Model Context Protocol",
    "AI-assisted software development",
    "TypeScript",
    "Distributed systems",
  ],
} as const;
