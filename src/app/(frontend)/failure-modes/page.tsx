// Pillar page: Failure Modes of AI-Assisted Development
//
// Groups planned articles under three thematic clusters (Isolation, Signal,
// Architecture). Articles are listed statically until the content pipeline
// delivers them as Posts with a `theme` field.

import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { SchemaScript } from "@/components/SchemaScript";
import { PageHeader } from "@/components/PageHeader";
import { PageLayout } from "@/components/PageLayout";
import { AUTHOR_CONFIG, SITE_CONFIG } from "@/lib/schema/config";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

const PAGE_URL = `${siteUrl}/failure-modes`;
const PAGE_TITLE = "Failure Modes of AI-Assisted Development";
const PAGE_DESCRIPTION =
  "A field guide to the ways agentic AI systems break down: isolation failures, signal degradation, and architectural collapse.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  },
};

// Article schema for this pillar page.
// Uses schema.org Article (not BlogPosting) — pillar pages are hub documents,
// not individual posts. Author and publisher reference the Person entity via @id.
const articleSchema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${PAGE_URL}#article`,
  headline: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: PAGE_URL,
  author: { "@id": AUTHOR_CONFIG.id },
  publisher: { "@id": AUTHOR_CONFIG.id },
  isPartOf: { "@id": SITE_CONFIG.websiteId },
};

// BreadcrumbList schema: Home > Failure Modes
const breadcrumbSchema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_CONFIG.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: PAGE_TITLE,
      item: PAGE_URL,
    },
  ],
};

// Cluster definitions — each maps to a theme value in the Posts collection.
const clusters = [
  {
    theme: "isolation" as const,
    label: "Isolation",
    heading: "Context Isolation Failures",
    description:
      "When agents lose track of state, operate with stale context, or fail to communicate across boundaries. The system does the right thing in the wrong environment.",
    articles: [
      {
        title: "The Stale Context Problem",
        summary:
          "How agents degrade when operating on cached or partial world-state.",
        slug: null,
      },
      {
        title: "Boundary Failures in Multi-Agent Systems",
        summary:
          "What happens when context does not survive handoffs between agents.",
        slug: null,
      },
      {
        title: "Memory Without Grounding",
        summary:
          "Long-term memory systems that accumulate drift rather than knowledge.",
        slug: null,
      },
    ],
  },
  {
    theme: "signal" as const,
    label: "Signal",
    heading: "Signal Degradation",
    description:
      "When the feedback loop between action and observation degrades. The agent cannot tell whether its outputs are correct, useful, or received.",
    articles: [
      {
        title: "Silent Failures in Tool Use",
        summary:
          "When tools return success codes but produce wrong results.",
        slug: null,
      },
      {
        title: "Reward Hacking in Agentic Loops",
        summary:
          "Optimizing for the metric rather than the intent.",
        slug: null,
      },
      {
        title: "The Evaluation Gap",
        summary:
          "Why agentic systems are hard to evaluate and what that means for deployment.",
        slug: null,
      },
    ],
  },
  {
    theme: "architecture" as const,
    label: "Architecture",
    heading: "Architectural Collapse",
    description:
      "When the system design itself produces failure modes. Coupling, coordination overhead, and brittleness that emerges at the seams between components.",
    articles: [
      {
        title: "Orchestrator-Executor Coupling",
        summary:
          "Why tight coupling between planning and execution layers amplifies errors.",
        slug: null,
      },
      {
        title: "The Retry Cascade",
        summary:
          "How error recovery strategies create their own failure modes at scale.",
        slug: null,
      },
      {
        title: "Prompt as Contract",
        summary:
          "Treating prompts as stable interfaces and the fragility that follows.",
        slug: null,
      },
    ],
  },
];

export default function FailureModesPage() {
  return (
    <PageLayout>
      <SchemaScript schema={[articleSchema, breadcrumbSchema]} />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
      />

      <div className="flex flex-col gap-12">
        {clusters.map((cluster) => (
          <section key={cluster.theme}>
            <div className="mb-6 border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
                Cluster &mdash; {cluster.label}
              </p>
              <h2 className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {cluster.heading}
              </h2>
              <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {cluster.description}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {cluster.articles.map((article) => (
                <div
                  key={article.title}
                  className="rounded-sm border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {article.slug ? (
                    <Link
                      href={`/posts/${article.slug}`}
                      className="font-mono text-base font-semibold text-zinc-900 hover:text-accent transition-colors focus-ring dark:text-zinc-100"
                    >
                      {article.title}
                    </Link>
                  ) : (
                    <p className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {article.title}
                      <span className="ml-2 font-mono text-xs font-normal uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500">
                        forthcoming
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-sm border border-dashed border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
            Navigation
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Browse individual posts in the archive, or return to the home page.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/posts"
              className="font-mono text-sm text-zinc-900 hover:text-accent transition-colors focus-ring dark:text-zinc-100"
            >
              Browse all posts &rarr;
            </Link>
            <Link
              href="/"
              className="font-mono text-sm text-zinc-500 hover:text-accent transition-colors focus-ring dark:text-zinc-400"
            >
              Home
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
