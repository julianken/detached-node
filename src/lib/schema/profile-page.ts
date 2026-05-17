// src/lib/schema/profile-page.ts
//
// Generates ProfilePage schema for /about — the canonical author-entity page.
// ProfilePage embeds the Person schema as mainEntity. Google + AI citation
// pipelines use this combo as the authoritative author-identity declaration.
//
// Usage: import { generateProfilePageSchema } from '@/lib/schema'; emit via
// <SchemaScript schema={[generateProfilePageSchema(), ...]} />.

import { AUTHOR_CONFIG, SITE_CONFIG } from "./config";
import type { ProfilePageSchema } from "./types";

export function generateProfilePageSchema(): ProfilePageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_CONFIG.url}/about#profile-page`,
    url: `${SITE_CONFIG.url}/about`,
    name: `About ${AUTHOR_CONFIG.name} — ${SITE_CONFIG.name}`,
    isPartOf: { "@id": SITE_CONFIG.websiteId },
    mainEntity: {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": AUTHOR_CONFIG.id,
      name: AUTHOR_CONFIG.name,
      url: AUTHOR_CONFIG.url,
      sameAs: [...AUTHOR_CONFIG.sameAs],
      description: AUTHOR_CONFIG.description,
      jobTitle: AUTHOR_CONFIG.jobTitle,
      knowsAbout: [...AUTHOR_CONFIG.knowsAbout],
    },
  };
}
