// src/lib/schema/breadcrumb.ts
//
// Generates BreadcrumbList schema for navigation breadcrumbs.
//
// Two variants:
//   generateBreadcrumbSchema(slug, title) — for blog posts: Home > Posts > [Post Title]
//   generatePageBreadcrumbSchema(path, title) — for static pages: Home > [Page Title]
//
// BreadcrumbList does not have an @id because breadcrumbs are positional
// navigation metadata, not entities that other schemas reference back to.
//
// Usage:
//   import { generateBreadcrumbSchema, generatePageBreadcrumbSchema } from '@/lib/schema';
//   <SchemaScript schema={generateBreadcrumbSchema(post.slug, post.title)} />
//   <SchemaScript schema={generatePageBreadcrumbSchema("about", "About")} />

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
