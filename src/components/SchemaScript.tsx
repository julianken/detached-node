// src/components/SchemaScript.tsx
//
// React server component that renders a <script type="application/ld+json"> tag.
// No 'use client' directive: this component runs exclusively on the server.
// Zero JavaScript is shipped to the browser for this component.
//
// Usage:
//   import { SchemaScript } from '@/components/SchemaScript';
//   <SchemaScript schema={generateBlogPostingSchema(post)} />
//
// Multiple schemas on one page use multiple SchemaScript calls:
//   <SchemaScript schema={generateBlogPostingSchema(post)} />
//   <SchemaScript schema={generateBreadcrumbSchema(post.slug, post.title)} />
//
// Placement: render anywhere in the page JSX tree. Google reads JSON-LD from
// <head> and <body> equally. Adjacent to the page content is preferred for
// debuggability over injection via the metadata API.
//
// Security rationale for the innerHTML assignment:
//   1. Input is always a TypeScript object from schema generators in src/lib/schema/
//   2. Schema generators accept typed Payload CMS objects and map specific fields
//      to schema properties -- no raw user input or unescaped CMS content reaches
//      this call
//   3. JSON.stringify produces valid JSON, not HTML -- no injection vector can
//      survive the type="application/ld+json" parsing context
//   4. This is the documented Next.js pattern for JSON-LD injection:
//      https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld

interface SchemaScriptProps {
  // Accept any JSON-serializable object or array of objects.
  // Using 'object' rather than Record<string, unknown> so that typed schema
  // interfaces (PersonSchema, BlogPostingSchema, etc.) are assignable without
  // requiring index signatures. JSON.stringify handles any plain object safely.
  schema: object | object[];
}

export function SchemaScript({ schema }: SchemaScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
