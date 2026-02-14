import { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHeader } from "@/components/PageHeader";
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
  // This query is cached - React deduplicates with generateMetadata call
  const page = await getPageBySlug('about');

  if (!page) {
    return (
      <div className="flex flex-col gap-16">
        <PageHeader
          title="About"
          subtitle="This is a placeholder for the project overview, intent, and reading guide."
        />
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          <p>
            Use this page for background, methodology, or a short manifesto. The
            layout is intentionally minimal so you can customize it later.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      <PageHeader title={page.title} subtitle={page.description ?? undefined} />
      <section className="prose prose-zinc dark:prose-invert max-w-none">
        <RichText data={page.body} />
      </section>
    </div>
  );
}
