// src/lib/schema/index.ts
//
// Public API barrel for the schema library.
// Page components import from '@/lib/schema' — not from individual modules.
//
// Import pattern in page components:
//   import { generateBlogPostingSchema, generateBreadcrumbSchema } from '@/lib/schema';

export { generateWebSiteSchema } from "./website";
export { generatePersonSchema } from "./person";
export { generateProfilePageSchema } from "./profile-page";
export { generateBlogPostingSchema } from "./blog-posting";
export { generateBreadcrumbSchema, generatePageBreadcrumbSchema, generateHubChildBreadcrumb } from "./breadcrumb";
export { generateCollectionPageSchema } from "./collection-page";
export { mapReferenceToCitation } from "./citation";
export { generatePatternArticleSchema, referenceToPatternCitation } from "./agentic-patterns";
export { generateFaqPageSchema } from "./faq-page";

// Type exports — available when page components need to type schema variables
export type {
  SchemaBase,
  PersonSchema,
  ProfilePageSchema,
  WebSiteSchema,
  BlogPostingSchema,
  BreadcrumbListSchema,
  CollectionPageSchema,
  CitationSchema,
  ImageObjectSchema,
  ArticleSchema,
  PatternCitationSchema,
  FaqPageSchema,
} from "./types";
