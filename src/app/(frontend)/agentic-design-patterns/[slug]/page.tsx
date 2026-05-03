// Satellite page: individual agentic design pattern
//
// One page per pattern slug. Composes PatternHeader → PatternBody →
// RelatedPatternsRow → ReferencesSection → PrevNextNav.
//
// Routing rules:
//   - generateStaticParams emits the full set of non-archived slugs
//   - dynamicParams: false — Next 16 will return 404 BEFORE invoking this
//     page for any slug not in generateStaticParams (extra defense in depth
//     beyond the explicit notFound() call)
//
// Schema: uses generatePatternArticleSchema from T2-B (#155) which sets
// `@id = ...#pattern-article`, plus generateHubChildBreadcrumb for the
// 3-level breadcrumb (Home > Agentic Design Patterns > Pattern).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { SchemaScript } from "@/components/SchemaScript";
import { PageLayout } from "@/components/PageLayout";
import { PatternHeader } from "@/components/agentic-patterns/PatternHeader";
import { PatternBody } from "@/components/agentic-patterns/PatternBody";
import { RelatedPatternsRow } from "@/components/agentic-patterns/RelatedPatternsRow";
import { ReferencesSection } from "@/components/agentic-patterns/ReferencesSection";
import { PrevNextNav } from "@/components/agentic-patterns/PrevNextNav";
import {
  generateHubChildBreadcrumb,
  generatePatternArticleSchema,
} from "@/lib/schema";
import { siteUrl } from "@/lib/site-config";
import {
  getPattern,
  getPatternSlugs,
} from "@/data/agentic-design-patterns/index";

// Pre-render every non-archived pattern at build time and refuse anything else.
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getPatternSlugs().map((slug) => ({ slug }));
}

type SatellitePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SatellitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPattern(slug);

  if (!pattern) {
    return { title: "Pattern Not Found" };
  }

  const url = `${siteUrl}/agentic-design-patterns/${pattern.slug}`;
  const title = pattern.name;
  const description =
    pattern.oneLineSummary || `${pattern.name} — agentic design pattern reference.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function PatternSatellitePage({
  params,
}: SatellitePageProps) {
  const { slug } = await params;
  const pattern = getPattern(slug);

  if (!pattern) {
    notFound();
  }

  return (
    <>
      <SchemaScript
        schema={[
          generatePatternArticleSchema(pattern, siteUrl),
          generateHubChildBreadcrumb(pattern.slug, pattern.name),
        ]}
      />
      <PageLayout maxWidth="prose">
        <Link
          href="/agentic-design-patterns"
          className="text-sm text-text-tertiary hover:text-accent transition-colors focus-ring"
        >
          ← Back to Agentic Design Patterns
        </Link>
        <article className="flex flex-col gap-12">
          <PatternHeader pattern={pattern} />
          <PatternBody pattern={pattern} />
          <RelatedPatternsRow pattern={pattern} />
          <ReferencesSection pattern={pattern} />
        </article>
        <PrevNextNav pattern={pattern} />
      </PageLayout>
    </>
  );
}
