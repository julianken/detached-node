import { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHeader } from "@/components/PageHeader";
import { PageLayout } from "@/components/PageLayout";
import { getPageBySlug } from "@/lib/queries/pages";

// Static generation - about page changes very rarely
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');

  if (!page) {
    return {
      title: "About",
      description: "What this project is, why it exists, and how to read it.",
    };
  }

  return {
    title: page.title,
    description: page.description ?? undefined,
  };
}

export default async function AboutPage() {
  const page = await getPageBySlug('about');

  if (!page) {
    return (
      <PageLayout>
        <PageHeader
          title="About"
          subtitle="What this is, why it exists, and how to read it."
        />
        <section className="prose dark:prose-invert max-w-none">
          <p>
            Detached Node explores the emerging world of agentic AI &mdash; autonomous
            systems that reason, plan, and act. Through essays and analysis, this site
            examines how AI agents work, how they&apos;re orchestrated, and what it means
            when machines begin to operate with increasing independence.
          </p>
          <p>
            The focus is practical and philosophical: understanding tool use patterns,
            workflow architectures, and the deeper questions raised by systems that can
            think and act on their behalf.
          </p>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader title={page.title} subtitle={page.description ?? undefined} />
      <section className="prose dark:prose-invert max-w-none">
        <RichText data={page.body} />
      </section>
    </PageLayout>
  );
}
