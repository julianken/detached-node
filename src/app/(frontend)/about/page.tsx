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
      description: "About this project",
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
          subtitle="This is a placeholder for the project overview, intent, and reading guide."
        />
        <section className="rounded-sm border border-border bg-surface p-6 text-sm leading-7 text-text-secondary">
          <p>
            Use this page for background, methodology, or a short manifesto. The
            layout is intentionally minimal so you can customize it later.
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
