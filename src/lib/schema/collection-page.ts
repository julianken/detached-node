// src/lib/schema/collection-page.ts
//
// Generates CollectionPage schema for the /posts archive listing.
// No arguments: the collection page is a static route with static metadata.
//
// CollectionPage does not produce an Article rich result card in SERPs.
// Its primary value is signaling site structure to Google and demonstrating
// topical authority through the presence of a curated archive.
//
// Note: If the post listing is extended to pass post data (e.g., for
// hasPart references to individual posts), update the function signature
// to accept posts: Post[] and add hasPart entries. Phase 3 enhancement.
//
// Usage:
//   import { generateCollectionPageSchema } from '@/lib/schema';
//   <SchemaScript schema={generateCollectionPageSchema()} />

import { SITE_CONFIG } from "./config";
import type { CollectionPageSchema } from "./types";

export function generateCollectionPageSchema(): CollectionPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    // @id uses #collection fragment to distinguish this entity from
    // the bare /posts URL which is just a navigation path
    "@id": `${SITE_CONFIG.url}/posts#collection`,
    name: "Posts — detached-node",
    description:
      "Writing on agentic AI workflows, autonomous systems, and machine intelligence.",
    url: `${SITE_CONFIG.url}/posts`,
    // Links archive to the WebSite entity
    isPartOf: { "@id": SITE_CONFIG.websiteId },
  };
}
