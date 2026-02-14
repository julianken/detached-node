import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageLayout } from "@/components/PageLayout";
import { PostCard } from "@/components/PostCard";
import { formatDate } from "@/lib/formatting";
import { getPublishedPosts } from "@/lib/queries/posts";
import type { Media } from "@/payload-types";

// Type guard for Media objects
function isMediaObject(media: number | Media | null | undefined): media is Media {
  return typeof media === 'object' && media !== null && 'url' in media;
}

// ISR: Revalidate every hour - post list changes with new publications
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Posts",
  description: "Essays and analysis on propaganda, conditioning, and the mechanics of mind control.",
};

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <PageLayout>
      <PageHeader
        title="Posts"
        subtitle="Essays and analysis on propaganda, conditioning, and the mechanics of mind control."
      />
      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No posts yet. Check back soon.
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              date={formatDate(post.publishedAt)}
              summary={post.summary}
              href={`/posts/${post.slug}`}
              featuredImage={isMediaObject(post.featuredImage) ? post.featuredImage : null}
            />
          ))
        )}
      </div>
    </PageLayout>
  );
}
