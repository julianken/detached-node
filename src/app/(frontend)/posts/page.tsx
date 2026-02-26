import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageLayout } from "@/components/PageLayout";
import { PostCard } from "@/components/PostCard";
import { SchemaScript } from "@/components/SchemaScript";
import { generateCollectionPageSchema } from "@/lib/schema";
import { formatDate } from "@/lib/formatting";
import { getPublishedPosts } from "@/lib/queries/posts";
import { isMediaObject } from "@/lib/types/media";
import { siteUrl } from "@/lib/site-config";

// ISR: Revalidate every hour - post list changes with new publications
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Posts",
  description: "Writing on agentic AI workflows, autonomous systems, and machine intelligence.",
  alternates: {
    canonical: siteUrl + "/posts",
  },
};

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="glitch-reveal">
    <SchemaScript schema={generateCollectionPageSchema()} />
    <PageLayout>
      <PageHeader
        title="Posts"
        subtitle="Writing on agentic AI workflows, autonomous systems, and machine intelligence."
      />
      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-sm text-text-tertiary">
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
              label="ARCHIVE"
            />
          ))
        )}
      </div>
    </PageLayout>
    </div>
  );
}
