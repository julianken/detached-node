// src/lib/schema/breadcrumb.ts
//
// Generates BreadcrumbList schema for navigation breadcrumbs.
//
// Three variants:
//   generateBreadcrumbSchema(slug, title)         — blog posts: Home > Posts > [Post Title]
//   generatePageBreadcrumbSchema(path, title)     — static pages: Home > [Page Title]
//   generateHubChildBreadcrumb(slug, name)        — pattern satellites: Home > Agentic Design Patterns > [Pattern Name]
//
// BreadcrumbList does not have an @id because breadcrumbs are positional
// navigation metadata, not entities that other schemas reference back to.
//
// Usage:
//   import { generateBreadcrumbSchema, generatePageBreadcrumbSchema, generateHubChildBreadcrumb } from '@/lib/schema';
//   <SchemaScript schema={generateBreadcrumbSchema(post.slug, post.title)} />
//   <SchemaScript schema={generatePageBreadcrumbSchema("about", "About")} />
//   <SchemaScript schema={generateHubChildBreadcrumb(pattern.slug, pattern.name)} />

import { SITE_CONFIG } from "./config";
import type { BreadcrumbListSchema } from "./types";

export function generateBreadcrumbSchema(
  slug: string,
  title: string
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Posts",
        item: `${SITE_CONFIG.url}/posts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_CONFIG.url}/posts/${slug}`,
      },
    ],
  };
}

export function generatePageBreadcrumbSchema(
  path: string,
  title: string
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `${SITE_CONFIG.url}/${path}`,
      },
    ],
  };
}

/**
 * Generates a 3-level BreadcrumbList for agentic design pattern satellite pages.
 * Breadcrumb path: Home > Agentic Design Patterns > [Pattern Name]
 *
 * Parameter order: slug first, then name — matches callsite in issue #157.
 *
 * @param slug  - The pattern's kebab-case slug (e.g. "prompt-chaining")
 * @param name  - The pattern's display name (e.g. "Prompt Chaining")
 */
export function generateHubChildBreadcrumb(
  slug: string,
  name: string
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Agentic Design Patterns",
        item: `${SITE_CONFIG.url}/agentic-design-patterns`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: `${SITE_CONFIG.url}/agentic-design-patterns/${slug}`,
      },
    ],
  };
}
