import type { CSSProperties } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { formatDate } from "@/lib/formatting";
import { Link } from "next-view-transitions";
import { PageLayout } from "@/components/PageLayout";
import { ThemeAwareHero } from "@/components/ThemeAwareHero";
import { TextGlitch } from "@/components/TextGlitch";
import { SchemaScript } from "@/components/SchemaScript";
import {
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateTechArticleSchema,
} from "@/lib/schema";
import type { Post } from "@/payload-types";
import { logWarning } from "@/lib/logging";
import { ErrorIds } from "@/lib/error-ids";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries/posts";
import { isValidSlug } from "@/lib/types/branded";
import { isMediaObject } from "@/lib/types/media";
import { FadeReveal } from "@/components/FadeReveal";
import { siteUrl, ogDefaultImage } from "@/lib/site-config";
import { postBodyConverters } from "@/lib/lexical/post-body-converters";
import { PostReferencesSection } from "@/components/PostReferencesSection";
import { RelatedPosts } from "@/components/RelatedPosts";

// ISR: Revalidate every hour - post content changes infrequently
export const revalidate = 3600;

// Allow dynamic rendering of posts not pre-rendered at build time.
//
// Soft-404 trap (issue #414): with ISR (`revalidate`) + `dynamicParams=true`,
// Next.js prerenders and caches the `notFound()` render as a 200 with
// the page-level `s-maxage=3600` (known framework limitation —
// vercel/next.js#43831, #79497). The result was every missing-slug URL
// being indexable as a valid page. The fix lives in `src/proxy.ts`:
// for `/posts/<slug>` requests, the proxy does a fast existence check
// against the posts table BEFORE the ISR-cached page route is entered.
// Missing slugs short-circuit at the proxy layer with a proper 404 +
// `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`;
// valid slugs pass through to this page, which keeps its
// `revalidate = 3600` ISR cache headers. The
// `agentic-design-patterns/[slug]` route avoids the same trap via
// `dynamicParams=false` (its slug list is statically known); that's not
// viable here because Payload CMS adds posts at runtime.
export const dynamicParams = true;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Pre-render top 10 posts at build time for better performance
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();

    return posts.slice(0, 10).map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    logWarning('Failed to generate static params for posts', { error });
    return [];
  }
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return {
      title: "Post Not Found",
    };
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    logWarning(
      'Post not found during metadata generation',
      { slug },
      ErrorIds.POST_NOT_FOUND
    );
    return {
      title: "Post Not Found",
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.summary;

  const ogImages = isMediaObject(post.featuredImageLight) && post.featuredImageLight.url
    ? [
        {
          url: post.featuredImageLight.url,
          width: post.featuredImageLight.width || 1200,
          height: post.featuredImageLight.height || 630,
          alt: post.featuredImageLight.alt || post.title,
        },
      ]
    : [{ url: ogDefaultImage, width: 1200, height: 630, alt: post.title }];

  return {
    title,
    description,
    alternates: {
      canonical: siteUrl + "/posts/" + post.slug,
    },
    openGraph: {
      title,
      description,
      images: ogImages,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Replace strategy (per issue #416): when schemaType is HowTo or
  // TechArticle, emit ONLY that schema as the per-post primary @type —
  // BlogPosting is not co-emitted. Default schemaType "BlogPosting"
  // preserves existing behavior for every existing and un-tagged post.
  //
  // HowTo additionally requires a populated `steps` array (enforced at the
  // Payload validation layer). If an editor tags a post HowTo but the
  // generator returns null (mis-tagging slip), fall back to BlogPosting so
  // the page still ships a grounded schema.
  const primarySchema = selectPrimarySchema(post);

  return (
    <FadeReveal>
    <SchemaScript schema={[primarySchema, generateBreadcrumbSchema(post.slug, post.title)]} />
    <article>
      <PageLayout maxWidth="prose">
        <Link
          href="/posts"
          className="text-sm text-text-tertiary hover:text-accent transition-colors focus-ring"
        >
          ← Back to Posts
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-mono text-3xl font-semibold tracking-tight text-text-primary">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="text-sm tracking-[0.03em] text-text-tertiary">{formatDate(post.publishedAt)}</p>
          )}
          <p className="text-sm text-text-tertiary">
            by{" "}
            <Link
              href="/about"
              rel="author"
              className="hover:text-accent transition-colors"
            >
              Julian (detached-node)
            </Link>
          </p>
        </header>

        {post.summary && (
          <p className="text-lg leading-relaxed text-text-secondary">{post.summary}</p>
        )}

        {isMediaObject(post.featuredImageLight) && isMediaObject(post.featuredImageDark) && (
          <div
            className="hero-filter overflow-hidden rounded-2xl"
            style={{
              "--hero-glow-light": post.featuredImageLight.preview?.color || "var(--accent)",
              "--hero-glow-dark": post.featuredImageDark.preview?.color || "var(--accent)",
            } as CSSProperties}
          >
            <ThemeAwareHero
              light={post.featuredImageLight}
              dark={post.featuredImageDark}
              alt={post.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 720px, 768px"
              focalPoint={post.focalPoint ?? undefined}
              aspectRatio="21 / 9"
            />
          </div>
        )}

        <TextGlitch>
          <section className="prose dark:prose-invert max-w-none">
            <RichText
              data={post.body as SerializedEditorState}
              converters={postBodyConverters}
            />
          </section>
        </TextGlitch>

        <PostReferencesSection references={post.references ?? []} />

        <RelatedPosts post={post} />
      </PageLayout>
    </article>
    </FadeReveal>
  );
}

// Selects the single primary schema for this post per the replace strategy
// committed to in issue #416. Default falls through to BlogPosting so any
// existing or un-tagged post keeps its current schema unchanged.
function selectPrimarySchema(post: Post) {
  if (post.schemaType === "TechArticle") {
    return generateTechArticleSchema(post);
  }
  if (post.schemaType === "HowTo") {
    const howto = generateHowToSchema(post);
    // Mis-tagging guard: HowTo without steps falls back to BlogPosting so
    // the page never ships a non-grounding HowTo (no `step` array).
    if (howto) return howto;
    logWarning(
      "Post tagged HowTo but missing steps; falling back to BlogPosting",
      { slug: post.slug },
      ErrorIds.SCHEMA_HOWTO_MISTAGGED,
    );
  }
  return generateBlogPostingSchema(post);
}
