// src/lib/schema/types.ts
//
// TypeScript interfaces for schema.org JSON-LD objects used by the
// Detached Node schema generator library.
//
// Design decisions:
// - All top-level schema objects extend SchemaBase (enforces @context presence)
// - Entity references use { '@id': string } — no inline expansion at reference sites
// - Optional fields use TypeScript optional (?) not union with undefined
// - ImageObjectSchema does not extend SchemaBase — it is always embedded, never top-level
// - CitationSchema does not extend SchemaBase — always embedded in BlogPosting.citation

export interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
}

// -------------------------------------------------------------------------
// ImageObject — embedded in BlogPosting.image, never standalone
// -------------------------------------------------------------------------

export interface ImageObjectSchema {
  "@type": "ImageObject";
  url: string;
  width?: number;
  height?: number;
  description?: string;
}

// -------------------------------------------------------------------------
// Citation — embedded in BlogPosting.citation array
// Canonical schema.org types used, ordered by semantic specificity:
//   ScholarlyArticle > Article > WebPage > CreativeWork
// The citation generator selects the strongest available type based on
// which fields are present in the references array entry.
// -------------------------------------------------------------------------

export interface CitationSchema {
  "@type": "ScholarlyArticle" | "Article" | "WebPage" | "CreativeWork";
  name: string;
  url?: string;
  author?: {
    "@type": "Person";
    name: string;
  };
  isPartOf?: {
    "@type": "Periodical" | "Website";
    name: string;
  };
  datePublished?: string;
}

// -------------------------------------------------------------------------
// Person — top-level schema for author identity
// @id is required: it is the canonical reference point that all other
// schemas use to link back to this entity.
// -------------------------------------------------------------------------

export interface PersonSchema extends SchemaBase {
  "@type": "Person";
  "@id": string;
  name: string;
  url: string;
  sameAs?: string[];
  description?: string;
}

// -------------------------------------------------------------------------
// WebSite — top-level schema for site identity
// creator links to author via @id reference, not inline expansion.
// SearchAction is intentionally absent until /search route exists.
// -------------------------------------------------------------------------

export interface WebSiteSchema extends SchemaBase {
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  description?: string;
  creator: { "@id": string };
}

// -------------------------------------------------------------------------
// BlogPosting — top-level schema for individual post pages
// author and publisher are @id references to the Person entity.
// isPartOf is an @id reference to the WebSite entity.
// -------------------------------------------------------------------------

export interface BlogPostingSchema extends SchemaBase {
  "@type": "BlogPosting";
  "@id": string;
  headline: string;
  description?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author: { "@id": string };
  publisher: { "@id": string };
  image?: ImageObjectSchema;
  articleSection?: string;
  keywords?: string[];
  citation?: CitationSchema[];
  isPartOf: { "@id": string };
}

// -------------------------------------------------------------------------
// BreadcrumbList — navigation schema for post detail pages
// No @id: breadcrumbs are positional, not entities that other schemas
// reference. Each ListItem has position (1-indexed), name, and item (URL).
// -------------------------------------------------------------------------

export interface BreadcrumbListSchema extends SchemaBase {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

// -------------------------------------------------------------------------
// CollectionPage — top-level schema for the /posts archive listing
// isPartOf links to WebSite via @id.
// -------------------------------------------------------------------------

export interface CollectionPageSchema extends SchemaBase {
  "@type": "CollectionPage";
  "@id": string;
  name: string;
  description?: string;
  url: string;
  isPartOf: { "@id": string };
}

// -------------------------------------------------------------------------
// PatternCitationSchema — embedded citation shape for agentic pattern pages.
// Diverges from CitationSchema intentionally: the Reference type in
// agentic-design-patterns/types.ts is structured (explicit 'type' field)
// so we branch on that, not on field presence.
//
// Schema.org types used:
//   ScholarlyArticle — research papers (with DOI identifier)
//   Book             — book references
//   WebPage          — specs, docs, essays (online references without a
//                      canonical academic or book identity)
// -------------------------------------------------------------------------

export interface PatternCitationSchema {
  "@type": "ScholarlyArticle" | "Book" | "WebPage";
  name: string;
  url: string;
  author?: { "@type": "Person"; name: string };
  datePublished?: string;
  identifier?: {
    "@type": "PropertyValue";
    propertyID: "DOI";
    value: string;
  };
}

// -------------------------------------------------------------------------
// ArticleSchema — top-level schema for agentic pattern satellite pages.
// Uses @id suffix #pattern-article to avoid future collision with the
// BlogPosting @id pattern (${url}#article).
// author is an @id reference to the canonical Person entity (not inline).
// -------------------------------------------------------------------------

export interface ArticleSchema extends SchemaBase {
  "@type": "Article";
  "@id": string;
  headline: string;
  description?: string;
  url: string;
  dateModified?: string;
  author: { "@id": string };
  citation?: PatternCitationSchema[];
}
