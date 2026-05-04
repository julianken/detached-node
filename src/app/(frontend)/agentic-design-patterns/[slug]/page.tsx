// Satellite page: individual agentic design pattern (D1 spec-sheet layout)
//
// Two-column on lg+: sticky meta rail (left, 14rem) + content article (right).
// Below lg the rail collapses to a non-sticky horizontal block above the
// content. PageLayout uses `content` (max-w-5xl, 1024px) to give the rail
// room without crushing the prose column.
//
// Routing:
//   - generateStaticParams emits the full set of non-archived slugs
//   - dynamicParams: false — Next 16 returns 404 BEFORE invoking this page
//
// Schema: generatePatternArticleSchema (#155) and generateHubChildBreadcrumb
// (3-level Home > Patterns > Pattern).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { SchemaScript } from "@/components/SchemaScript";
import { PageLayout } from "@/components/PageLayout";
import { PatternHeader } from "@/components/agentic-patterns/PatternHeader";
import { PatternStickyRail } from "@/components/agentic-patterns/PatternStickyRail";
import { PatternBody } from "@/components/agentic-patterns/PatternBody";
import { ReferencesSection } from "@/components/agentic-patterns/ReferencesSection";
import { DisclosureSection } from "@/components/agentic-patterns/DisclosureSection";
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

  const overviewLead = pattern.bodySummary[0];
  const backgroundParagraphs = pattern.bodySummary.slice(1);

  return (
    <>
      <SchemaScript
        schema={[
          generatePatternArticleSchema(pattern, siteUrl),
          generateHubChildBreadcrumb(pattern.slug, pattern.name),
        ]}
      />
      <PageLayout maxWidth="content">
        <Link
          href="/agentic-design-patterns"
          className="text-sm text-text-tertiary hover:text-accent transition-colors focus-ring"
        >
          ← Back to Agentic Design Patterns
        </Link>
        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
          <PatternStickyRail pattern={pattern} />
          <article className="flex flex-col gap-10">
            <PatternHeader pattern={pattern} />
            <PatternBody pattern={pattern} />
            <ReferencesSection pattern={pattern} />
            {overviewLead && (
              <DisclosureSection
                id="overview-discussion"
                label="Overview · 1-paragraph mechanism"
                defaultOpen
              >
                <p className="text-base leading-7 text-text-secondary [text-wrap:pretty]">
                  {overviewLead}
                </p>
              </DisclosureSection>
            )}
            {backgroundParagraphs.length > 0 && (
              <DisclosureSection
                id="background-discussion"
                label="Background · context and trade-offs"
              >
                <div className="flex flex-col gap-4">
                  {backgroundParagraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-base leading-7 text-text-secondary [text-wrap:pretty]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </DisclosureSection>
            )}
          </article>
        </div>
        <PrevNextNav pattern={pattern} />
      </PageLayout>
    </>
  );
}
