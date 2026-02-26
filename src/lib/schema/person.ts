// src/lib/schema/person.ts
//
// Generates Person schema for the author entity.
// No arguments: all values come from AUTHOR_CONFIG.
//
// Inject on the homepage (establishes author presence) and on the about page
// (canonical author entity declaration). The about page is the semantic owner.
//
// Usage:
//   import { generatePersonSchema } from '@/lib/schema';
//   <SchemaScript schema={generatePersonSchema()} />

import { AUTHOR_CONFIG } from "./config";
import type { PersonSchema } from "./types";

export function generatePersonSchema(): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    // @id must match AUTHOR_CONFIG.id exactly — this is the entity identifier
    // that BlogPosting.author, BlogPosting.publisher, and WebSite.creator
    // all reference. Mismatch here breaks the entity graph.
    "@id": AUTHOR_CONFIG.id,
    name: AUTHOR_CONFIG.name,
    url: AUTHOR_CONFIG.url,
    // Spread to avoid mutating the const array
    sameAs: [...AUTHOR_CONFIG.sameAs],
    description: AUTHOR_CONFIG.description,
  };
}
