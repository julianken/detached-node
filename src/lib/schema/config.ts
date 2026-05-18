// src/lib/schema/config.ts
//
// Author entity configuration and site constants for JSON-LD schema generation.
//
// Tier C identity migration complete: real name lives in AUTHOR_CONFIG.name,
// the brand "detached-node" is retained as siteName, and AUTHOR_CONFIG.alternateName
// bridges the two so search and LLM citation pipelines can resolve the alias.
// All schema generators reference AUTHOR_CONFIG; updates here propagate automatically.

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
  // alternateName bridges the visible byline "Julian (detached-node)" to a
  // machine-readable alias so search and LLM citation pipelines can resolve
  // the brand to this Person entity.
  alternateName: "detached-node",
  url: `${siteUrl}/about`,
  id: `${siteUrl}/#author`,
  sameAs: [
    "https://github.com/julianken",
    "https://www.linkedin.com/in/julian-k-ba6b5897",
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
