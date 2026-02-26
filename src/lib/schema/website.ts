// src/lib/schema/website.ts
//
// Generates WebSite schema for the homepage.
// No arguments: all values come from SITE_CONFIG and AUTHOR_CONFIG.
//
// SearchAction is intentionally absent. It requires a working /search endpoint.
// Add potentialAction when search is implemented (Phase 3).
//
// Usage:
//   import { generateWebSiteSchema } from '@/lib/schema';
//   <SchemaScript schema={generateWebSiteSchema()} />

import { SITE_CONFIG, AUTHOR_CONFIG } from "./config";
import type { WebSiteSchema } from "./types";

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_CONFIG.websiteId,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    // creator links to the Person schema via @id reference.
    // Google uses this connection to associate site authority with the author entity.
    creator: { "@id": AUTHOR_CONFIG.id },
  };
}
