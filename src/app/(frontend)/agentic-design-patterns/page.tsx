// Hub page: Agentic Design Patterns
//
// 5-layer reference catalog for agentic AI design patterns. Composes the
// living-catalog hero, the search/filter island, and the canonical layered
// grid (HubGrid) with topology sub-tiers.
//
// Rendering decision (see issue #157 CORE DECISION — Option A):
//   `force-static` is INCOMPATIBLE with reading `searchParams` (Next 16 docs:
//   reading searchParams opts a route into dynamic rendering). To honor the
//   spec § 337 promise that `?layer=...` returns server-filtered HTML, we use
//   ISR (revalidate = 3600) instead of force-static — matching the
//   /posts/[slug] precedent in this repo.
//
// Hub article schema uses `@id = ${PAGE_URL}#hub-article` (NOT `#article`)
// to avoid future collision with BlogPosting `#article` ids.

import type { Metadata } from "next";
import { SchemaScript } from "@/components/SchemaScript";
import { PageLayout } from "@/components/PageLayout";
import { HubHero } from "@/components/agentic-patterns/HubHero";
import { HubFilterableContent } from "@/components/agentic-patterns/HubFilterableContent";
import { generatePageBreadcrumbSchema } from "@/lib/schema";
import { AUTHOR_CONFIG, SITE_CONFIG } from "@/lib/schema/config";
import { siteUrl } from "@/lib/site-config";
import {
  PATTERNS,
  getPatternsByLayer,
} from "@/data/agentic-design-patterns/index";
import { LAYERS } from "@/data/agentic-design-patterns/layers";
import type { LayerId } from "@/data/agentic-design-patterns/types";

// ISR — content updates with deploys; an hour-long stale window is fine.
export const revalidate = 3600;

const PAGE_URL = `${siteUrl}/agentic-design-patterns`;
const PAGE_TITLE = "Agentic Design Patterns";
const PAGE_DESCRIPTION =
  "A field-aware reference covering patterns for building agentic AI systems — organized by the question each pattern answers, not by the year it was named.";

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

// Hub article schema. Uses #hub-article (NOT #article) to avoid future
// collision with BlogPosting schemas on /posts.
const articleSchema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${PAGE_URL}#hub-article`,
  headline: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: PAGE_URL,
  author: { "@id": AUTHOR_CONFIG.id },
  publisher: { "@id": AUTHOR_CONFIG.id },
  isPartOf: { "@id": SITE_CONFIG.websiteId },
};

const breadcrumbSchema = generatePageBreadcrumbSchema(
  "agentic-design-patterns",
  PAGE_TITLE,
);

const VALID_LAYER_IDS = new Set<LayerId>(LAYERS.map((l) => l.id));

function isLayerId(value: string): value is LayerId {
  return VALID_LAYER_IDS.has(value as LayerId);
}

type HubPageProps = {
  searchParams: Promise<{ layer?: string }>;
};

export default async function AgenticDesignPatternsHubPage({
  searchParams,
}: HubPageProps) {
  const { layer } = await searchParams;

  // Apply `?layer=` filter SSR-side. Unknown layer values fall through to
  // the full catalog (no 404; the URL is best-effort, not authoritative).
  const filteredLayerId = layer && isLayerId(layer) ? layer : null;
  const visiblePatterns = filteredLayerId ? getPatternsByLayer(filteredLayerId) : PATTERNS;

  return (
    <PageLayout maxWidth="full" gap="lg">
      <SchemaScript schema={[articleSchema, breadcrumbSchema]} />
      <HubHero />
      <HubFilterableContent patterns={visiblePatterns} layerFiltered={!!filteredLayerId} />
    </PageLayout>
  );
}
