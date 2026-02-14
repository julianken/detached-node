import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { formatDate, getTypeLabel } from "@/lib/formatting";
import Link from "next/link";
import { logWarning } from "@/lib/logging";
import { ErrorIds } from "@/lib/error-ids";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries/posts";

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

  // Validate slug format to prevent malformed inputs
  if (!slug || slug.length > 200 || !/^[a-z0-9-]+$/.test(slug)) {
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

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // Validate slug format to prevent malformed inputs
  if (!slug || slug.length > 200 || !/^[a-z0-9-]+$/.test(slug)) {
    notFound();
  }

  // This query is cached - React deduplicates with generateMetadata call
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const typeLabel = getTypeLabel(post.type);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-16">
      <Link
        href="/posts"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors focus-ring"
      >
        ← Back to Posts
      </Link>
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {typeLabel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {post.title}
        </h1>
        {post.publishedAt && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatDate(post.publishedAt)}</p>
        )}
      </header>

      {post.summary && (
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{post.summary}</p>
      )}

      <section className="prose prose-zinc dark:prose-invert max-w-none">
        <RichText data={post.body as SerializedEditorState} />
      </section>
    </article>
  );
}
