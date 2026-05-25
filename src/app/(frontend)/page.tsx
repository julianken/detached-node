import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { FadeReveal } from "@/components/FadeReveal";
import { PostCard } from "@/components/PostCard";
import { SchemaScript } from "@/components/SchemaScript";
import { formatDate } from "@/lib/formatting";
import { getFeaturedPosts } from "@/lib/queries/posts";
import { generateWebSiteSchema, generatePersonSchema } from "@/lib/schema";
import { siteUrl } from "@/lib/site-config";
import { isMediaObject } from "@/lib/types/media";

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
          <h1 className="font-mono text-5xl font-semibold tracking-tight text-text-primary lowercase [text-wrap:balance] sm:text-6xl">
            detached<span className="text-accent">-</span>node
          </h1>
          <div className="mt-4 h-px w-12 bg-accent" aria-hidden="true" />
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary [text-wrap:pretty] sm:text-xl">
            a diagnostic analysis of AI-assisted software engineering
          </p>
        </section>

        <section id="latest" className="scroll-mt-24">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-xl font-semibold tracking-tight text-text-primary">
              Latest
            </h2>
            <Link
              href="/posts"
              className="text-meta font-mono tracking-[0.04em] text-text-secondary hover:text-text-primary focus-ring transition-colors"
            >
              All posts →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.length > 0 ? (
              featuredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  title={post.title}
                  date={formatDate(post.publishedAt)}
                  summary={post.summary}
                  href={`/posts/${post.slug}`}
                  featuredImageLight={
                    isMediaObject(post.featuredImageLight) ? post.featuredImageLight : null
                  }
                  featuredImageDark={
                    isMediaObject(post.featuredImageDark) ? post.featuredImageDark : null
                  }
                  focalPoint={post.focalPoint ?? undefined}
                  imageAspectRatio="16 / 9"
                  dateLayout="stacked"
                />
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

        <section>
          <h2 className="font-mono text-xl font-semibold tracking-tight text-text-primary">
            Explore
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Link
              href="/agentic-design-patterns"
              className="group flex flex-col gap-2 rounded-sm border border-border bg-surface p-6 transition-colors hover:border-border-hover hover:bg-hover-bg focus-ring"
            >
              <h3 className="font-mono text-card-title font-semibold tracking-tight text-text-primary">
                Agentic design patterns
              </h3>
              <p className="text-card-summary leading-relaxed text-text-secondary">
                A reference for designing agentic systems.
              </p>
              <p className="mt-1 text-meta font-medium text-accent group-hover:text-accent-muted transition-colors">
                Browse the catalog →
              </p>
            </Link>
            <Link
              href="/about"
              className="group flex flex-col gap-2 rounded-sm border border-border bg-surface p-6 transition-colors hover:border-border-hover hover:bg-hover-bg focus-ring"
            >
              <h3 className="font-mono text-card-title font-semibold tracking-tight text-text-primary">
                About this site
              </h3>
              <p className="text-card-summary leading-relaxed text-text-secondary">
                What this site is and why it exists.
              </p>
              <p className="mt-1 text-meta font-medium text-accent group-hover:text-accent-muted transition-colors">
                Read more →
              </p>
            </Link>
          </div>
        </section>
      </div>
    </FadeReveal>
  );
}
