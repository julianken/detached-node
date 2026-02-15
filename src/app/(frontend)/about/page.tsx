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
            Most of what you believe was installed without your awareness. Not through
            conspiracy, but through structure &mdash; through the steady repetition of
            framing, the narrowing of acceptable discourse, and the quiet
            replacement of thought with reflex.
          </p>
          <p>
            This project exists to make that machinery visible.
          </p>
          <p>
            Mind-Controlled draws on the work of Jacques Ellul, Edward Bernays,
            Noam Chomsky, and others who studied propaganda not as an aberration
            but as a defining feature of modern life. The essays here examine
            how language is weaponized, how attention is harvested, and how
            consent is manufactured at industrial scale.
          </p>
          <h2>How to read this</h2>
          <p>
            Posts are categorized by type. <strong>Field reports</strong> are
            observations from the information environment &mdash; patterns noticed
            in real time. <strong>Analysis</strong> pieces break down specific
            techniques or systems. <strong>Archive</strong> entries collect primary
            sources and historical parallels.
          </p>
          <p>
            None of this is neutral. The act of naming a technique is itself a
            form of resistance to it. But the goal is clarity, not polemic.
            If the writing starts telling you what to think instead of showing
            you how thinking is shaped, it has failed.
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
