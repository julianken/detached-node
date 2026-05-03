// Changelog page: Agentic Design Patterns
//
// Append-only audit trail of catalog edits. Static rendering — the changelog
// data lives in code (`src/data/agentic-design-patterns/changelog.ts`) and
// changes only via deploys. ISR isn't needed; force-static is fine here
// because this route reads NO searchParams.
//
// Static-segment routing note: `/agentic-design-patterns/changelog` resolves
// to THIS file rather than the [slug] dynamic route because Next.js static
// segments win over dynamic segments at the same level. A pattern named
// 'changelog' in PATTERNS would silently shadow this page — guarded by the
// reserved-slug unit test in tests/unit/data/agentic-design-patterns/.

import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { SchemaScript } from "@/components/SchemaScript";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { generateHubChildBreadcrumb } from "@/lib/schema";
import { siteUrl } from "@/lib/site-config";
import { CHANGELOG } from "@/data/agentic-design-patterns/changelog";
import { getPattern } from "@/data/agentic-design-patterns/index";
import type { ChangelogEntry, ChangelogEntryType } from "@/data/agentic-design-patterns/types";

export const dynamic = "force-static";

const PAGE_URL = `${siteUrl}/agentic-design-patterns/changelog`;
const PAGE_TITLE = "Changelog — Agentic Design Patterns";
const PAGE_DESCRIPTION =
  "Append-only audit trail of additions, edits, and retirements in the agentic design patterns catalog.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_URL },
};

const breadcrumbSchema = generateHubChildBreadcrumb("changelog", "Changelog");

const TYPE_LABELS: Record<ChangelogEntryType, string> = {
  added: "ADDED",
  edited: "EDITED",
  retired: "RETIRED",
};

function ChangelogRow({ entry }: { entry: ChangelogEntry }) {
  const pattern = getPattern(entry.slug);
  return (
    <li className="flex flex-col gap-2 border-b border-border-subtle py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6">
      <time
        dateTime={entry.date}
        className="font-mono text-sm text-text-tertiary tabular-nums sm:w-28 sm:shrink-0"
      >
        {entry.date}
      </time>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className="inline-flex items-center rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary"
            aria-label={`Change type: ${entry.type}`}
          >
            {TYPE_LABELS[entry.type]}
          </span>
          {pattern ? (
            <Link
              href={`/agentic-design-patterns/${entry.slug}`}
              className="font-mono text-base font-medium text-accent underline underline-offset-4 hover:text-accent-muted"
            >
              {pattern.name}
            </Link>
          ) : (
            <span className="font-mono text-base text-text-secondary">{entry.slug}</span>
          )}
        </div>
        <p className="text-base text-text-secondary [text-wrap:pretty]">{entry.note}</p>
        <p className="text-xs text-text-tertiary">
          <span className="font-mono">@{entry.author}</span>
          {entry.prUrl && (
            <>
              {" · "}
              <a
                href={entry.prUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent underline underline-offset-2 hover:text-accent-muted"
              >
                PR
              </a>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

export default function AgenticDesignPatternsChangelogPage() {
  return (
    <PageLayout maxWidth="prose">
      <SchemaScript schema={breadcrumbSchema} />
      <Link
        href="/agentic-design-patterns"
        className="text-sm text-text-tertiary hover:text-accent transition-colors focus-ring"
      >
        ← Back to Agentic Design Patterns
      </Link>
      <PageHeader
        title="Changelog"
        subtitle={PAGE_DESCRIPTION}
      />
      {CHANGELOG.length === 0 ? (
        <p className="text-base text-text-secondary">No entries yet.</p>
      ) : (
        <ol className="list-none">
          {CHANGELOG.map((entry, idx) => (
            <ChangelogRow key={`${entry.date}-${entry.slug}-${idx}`} entry={entry} />
          ))}
        </ol>
      )}
    </PageLayout>
  );
}
