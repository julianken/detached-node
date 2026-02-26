// src/lib/schema/citation.ts
//
// Maps a Payload Post references array entry to a schema.org citation.
// Type selection is based on field completeness, using the strongest
// available schema.org type for each combination.
//
// Type selection logic:
//   ScholarlyArticle  — author + publication + date + URL (academic paper)
//   Article           — author + publication + URL (journalism, blog post)
//   WebPage           — URL present (generic web reference)
//   CreativeWork      — no URL (mention-only citation, book, offline source)
//
// Called internally by generateBlogPostingSchema.

import type { CitationSchema } from "./types";

// Input shape mirrors the references array entry from payload-types.ts Post interface
export type ReferenceInput = {
  title: string;
  url?: string | null;
  author?: string | null;
  publication?: string | null;
  date?: string | null;
  id?: string | null;
};

export function mapReferenceToCitation(ref: ReferenceInput): CitationSchema {
  const hasUrl = typeof ref.url === "string" && ref.url.length > 0;
  const hasAuthor = typeof ref.author === "string" && ref.author.length > 0;
  const hasPublication =
    typeof ref.publication === "string" && ref.publication.length > 0;
  const hasDate = typeof ref.date === "string" && ref.date.length > 0;

  // Select the strongest semantically accurate schema.org type
  let schemaType: CitationSchema["@type"];
  if (hasAuthor && hasPublication && hasDate && hasUrl) {
    schemaType = "ScholarlyArticle";
  } else if (hasAuthor && hasPublication && hasUrl) {
    schemaType = "Article";
  } else if (hasUrl) {
    schemaType = "WebPage";
  } else {
    schemaType = "CreativeWork";
  }

  const citation: CitationSchema = {
    "@type": schemaType,
    name: ref.title,
  };

  if (hasUrl) citation.url = ref.url!;
  if (hasAuthor) citation.author = { "@type": "Person", name: ref.author! };
  if (hasPublication) {
    // Use Website when we have a URL (online source), Periodical when offline
    citation.isPartOf = {
      "@type": hasUrl ? "Website" : "Periodical",
      name: ref.publication!,
    };
  }
  if (hasDate) citation.datePublished = ref.date!;

  return citation;
}
