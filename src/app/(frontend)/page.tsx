import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { FadeReveal } from "@/components/FadeReveal";
import { SchemaScript } from "@/components/SchemaScript";
import { generateWebSiteSchema, generatePersonSchema } from "@/lib/schema";
import { getFeaturedPosts } from "@/lib/queries/posts";
import { siteUrl } from "@/lib/site-config";

// ISR: Revalidate every 30 minutes - featured posts change infrequently
export const revalidate = 1800;

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
};

export default async function Home() {
  const featuredPosts = await getFeaturedPosts(3);

  return (
    <FadeReveal>
    <SchemaScript schema={[generateWebSiteSchema(), generatePersonSchema()]} />
    <div className="flex flex-col gap-16">
      <section>
        <h1 className="font-mono text-4xl font-semibold tracking-tight text-text-primary lowercase [text-wrap:balance]">
          detached<span className="text-accent">-</span>node
        </h1>
        <p className="mt-4 max-w-xl text-xl font-medium leading-8 text-text-secondary">
          a diagnostic analysis of AI-assisted software engineering
        </p>
      </section>

      <section>
        <h2 className="font-mono text-xl font-semibold tracking-tight text-text-primary">
          Latest posts
        </h2>
        <p className="mt-2 text-base leading-6 text-text-secondary">
          Recent writing on AI agents, workflows, and systems.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Card key={post.id} href={`/posts/${post.slug}`} label="FIELD REPORT">
                <h3 className="font-mono text-base font-semibold text-text-primary [text-wrap:balance]">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary [text-wrap:pretty]">
                  {post.summary}
                </p>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-sm border border-dashed border-border p-8 text-center">
              <p className="text-sm text-text-tertiary">
                No featured posts yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
    </FadeReveal>
  );
}
