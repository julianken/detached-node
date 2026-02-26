import { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHeader } from "@/components/PageHeader";
import { PageLayout } from "@/components/PageLayout";
import { SchemaScript } from "@/components/SchemaScript";
import { generatePersonSchema, generatePageBreadcrumbSchema } from "@/lib/schema";
import { getPageBySlug } from "@/lib/queries/pages";
import { siteUrl } from "@/lib/site-config";

// Static generation - about page changes very rarely
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');

  if (!page) {
    return {
      title: "About",
      description: "What this project is, why it exists, and how to read it.",
      alternates: {
        canonical: siteUrl + "/about",
      },
    };
  }

  return {
    title: page.title,
    description: page.description ?? undefined,
    alternates: {
      canonical: siteUrl + "/about",
    },
  };
}

export default async function AboutPage() {
  const page = await getPageBySlug('about');

  if (!page) {
    return (
      <PageLayout>
        <SchemaScript schema={[generatePersonSchema(), generatePageBreadcrumbSchema("about", "About")]} />
        <PageHeader
          title="About"
          subtitle="What this is, why it exists, and how to read it."
        />
        <section className="prose dark:prose-invert max-w-none">
          <p>
            detached-node is a pseudonymous practitioner writing about the failure modes
            of AI-assisted development &mdash; the gaps between what agentic systems promise
            and what they actually deliver under real-world conditions.
          </p>
          <p>
            The work focuses on autonomous systems: how they plan, how they use tools,
            where they break, and what those breakdowns reveal about the architecture of
            machine intelligence. Essays here are analytical, not promotional. The subject
            is interesting precisely because it is hard.
          </p>
          <p>
            This site is a record of that investigation. Posts are field reports from
            working systems, not theoretical surveys. When an agentic workflow fails in
            an instructive way, that failure earns its own entry.
          </p>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SchemaScript schema={[generatePersonSchema(), generatePageBreadcrumbSchema("about", "About")]} />
      <PageHeader title={page.title} subtitle={page.description ?? undefined} />
      <section className="prose dark:prose-invert max-w-none">
        <RichText data={page.body} />
      </section>
    </PageLayout>
  );
}
