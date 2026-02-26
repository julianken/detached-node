import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { formatDate, getTypeLabel } from "@/lib/formatting";
import { Link } from "next-view-transitions";
import { PageLayout } from "@/components/PageLayout";
import { OptimizedImage } from "@/components/OptimizedImage";
import { TextGlitch } from "@/components/TextGlitch";
import { SchemaScript } from "@/components/SchemaScript";
import { generateBlogPostingSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { logWarning } from "@/lib/logging";
import { ErrorIds } from "@/lib/error-ids";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries/posts";
import { isValidSlug } from "@/lib/types/branded";
import { isMediaObject } from "@/lib/types/media";
import { FadeReveal } from "@/components/FadeReveal";
import { siteUrl, ogDefaultImage } from "@/lib/site-config";

// ISR: Revalidate every hour - post content changes infrequently
export const revalidate = 3600;

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

  const ogImages = isMediaObject(post.featuredImage) && post.featuredImage.url
    ? [
        {
          url: post.featuredImage.url,
          width: post.featuredImage.width || 1200,
          height: post.featuredImage.height || 630,
          alt: post.featuredImage.alt || post.title,
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

  const typeLabel = getTypeLabel(post.type);

  return (
    <FadeReveal>
    <SchemaScript schema={[generateBlogPostingSchema(post), generateBreadcrumbSchema(post.slug, post.title)]} />
    <article>
      <PageLayout maxWidth="prose">
        <Link
          href="/posts"
          className="text-sm text-text-tertiary hover:text-accent transition-colors focus-ring"
        >
          ← Back to Posts
        </Link>

        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
            {typeLabel}
          </p>
          <h1 className="font-mono text-3xl font-semibold tracking-tight text-text-primary">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="text-sm tracking-[0.03em] text-text-tertiary">{formatDate(post.publishedAt)}</p>
          )}
        </header>

        {isMediaObject(post.featuredImage) && post.featuredImage.url && (
          <div className="my-8 -mx-4 sm:-mx-8 overflow-hidden rounded-sm">
            <OptimizedImage
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              width={post.featuredImage.width || 1200}
              height={post.featuredImage.height || 630}
              priority
              className="w-full"
            />
          </div>
        )}

        {post.summary && (
          <p className="text-lg leading-relaxed text-text-secondary">{post.summary}</p>
        )}

        <TextGlitch>
          <section className="prose dark:prose-invert max-w-none">
            <RichText data={post.body as SerializedEditorState} />
          </section>
        </TextGlitch>
      </PageLayout>
    </article>
    </FadeReveal>
  );
}
