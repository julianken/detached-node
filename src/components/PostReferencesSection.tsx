// ---------------------------------------------------------------------------
// PostReferencesSection
// ---------------------------------------------------------------------------
// Renders the bottom-of-post references list for blog post detail pages.
// Companion to the inline-citation Lexical converter in
// `src/lib/lexical/post-body-converters.tsx`: authors insert `#ref-N` links
// in the body, which render as superscripts and jump down to the matching
// `<li id="ref-N">` rendered here.
//
// Single-source dataflow: the same `ReferenceInput[]` array drives both this
// visible list and the JSON-LD `BlogPosting.citation` field emitted by
// `generateBlogPostingSchema`. The shared `ReferenceInput` type (from
// `@/lib/schema/citation`) is the contract that keeps the two surfaces in
// sync — covered by the dual-consumer test.
//
// Server component. Returns null on empty array so the page does not render
// an empty <section>.
//
// Visual conventions intentionally match
// `src/components/agentic-patterns/ReferencesSection.tsx`; the Posts shape
// has no `type` field so there is no type-badge column here.

import type { ReferenceInput } from "@/lib/schema/citation";
import { formatDate } from "@/lib/formatting";

interface PostReferencesSectionProps {
  references: ReferenceInput[];
}

function ReferenceItem({
  reference,
  index,
}: {
  reference: ReferenceInput;
  index: number;
}) {
  const hasAuthor =
    typeof reference.author === "string" && reference.author.length > 0;
  const hasPublication =
    typeof reference.publication === "string" && reference.publication.length > 0;
  const hasDate =
    typeof reference.date === "string" && reference.date.length > 0;
  const hasUrl = typeof reference.url === "string" && reference.url.length > 0;
  const hasMeta = hasAuthor || hasPublication || hasDate;

  // Build meta segments so we can drop the `·` separator around any empty
  // slot without leaving an orphan dot floating in the markup.
  const metaParts: Array<{ key: string; node: React.ReactNode }> = [];
  if (hasAuthor) {
    metaParts.push({ key: "author", node: <span>{reference.author}</span> });
  }
  if (hasPublication) {
    metaParts.push({
      key: "publication",
      node: <span className="italic">{reference.publication}</span>,
    });
  }
  if (hasDate) {
    metaParts.push({
      key: "date",
      node: (
        <time dateTime={reference.date!}>{formatDate(reference.date)}</time>
      ),
    });
  }

  // Reference number — 1-indexed for matching `#ref-N` anchors authored
  // inline. Drift between array order and inline markers is acceptable at
  // current scale (3-4 refs/post); see issue #401 risk note.
  const refNumber = index + 1;

  const titleContent = (
    <cite className="not-italic">{reference.title}</cite>
  );

  return (
    <li
      id={`ref-${refNumber}`}
      className="flex flex-col gap-1.5 border-b border-border-subtle py-3 last:border-b-0 scroll-mt-24"
    >
      <div className="flex flex-wrap items-baseline gap-2">
        {hasUrl ? (
          <a
            href={reference.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body font-medium text-accent underline underline-offset-4 hover:text-accent-muted"
          >
            {titleContent}
          </a>
        ) : (
          // No URL → render the title as plain text inside <cite>. Mirrors
          // the schema.org/CreativeWork fallback in mapReferenceToCitation.
          <span className="text-body font-medium text-text-primary">
            {titleContent}
          </span>
        )}
      </div>
      {hasMeta && (
        <div className="font-mono text-meta text-text-secondary">
          {metaParts.map((part, i) => (
            <span key={part.key}>
              {i > 0 && (
                <span className="mx-1.5 text-text-tertiary">·</span>
              )}
              {part.node}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

export function PostReferencesSection({
  references,
}: PostReferencesSectionProps) {
  if (references.length === 0) {
    return null;
  }

  return (
    <section
      id="references"
      aria-labelledby="references-heading"
      className="scroll-mt-24"
    >
      <h2
        id="references-heading"
        className="text-2xl font-semibold tracking-tight text-text-primary"
      >
        References
      </h2>
      <ol className="mt-4 list-none">
        {references.map((reference, idx) => (
          <ReferenceItem
            key={reference.id ?? `${reference.title}-${idx}`}
            reference={reference}
            index={idx}
          />
        ))}
      </ol>
    </section>
  );
}
