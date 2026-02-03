import { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHeader } from "@/components/PageHeader";

// Force dynamic rendering - database may not have tables during build
export const dynamic = "force-dynamic";

type PageData = {
  title: string;
  description?: string | null;
  body: unknown;
};

async function getAboutPage(): Promise<PageData | null> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "pages",
      where: {
        slug: { equals: "about" },
        status: { equals: "published" },
      },
      limit: 1,
    });
    return docs[0] ?? null;
  } catch {
    // Database tables may not exist yet
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();

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
  const page = await getAboutPage();

  if (!page) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="About"
          subtitle="This is a placeholder for the project overview, intent, and reading guide."
        />
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm leading-7 text-zinc-600">
          <p>
            Use this page for background, methodology, or a short manifesto. The
            layout is intentionally minimal so you can customize it later.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={page.title} subtitle={page.description ?? undefined} />
      <section className="prose prose-zinc max-w-none">
        <RichText data={page.body} />
      </section>
    </div>
  );
}
