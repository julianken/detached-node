import { getPayload } from "payload";
import config from "@payload-config";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";

// Force dynamic rendering - database may not have tables during build
export const dynamic = "force-dynamic";

export default async function PostsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any[] = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      where: {
        status: { equals: "published" },
      },
      sort: "-publishedAt",
    });
    posts = result.docs;
  } catch {
    // Database tables may not exist yet - show empty state
  }

  return (
    <div className="flex flex-col gap-8">
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
              date={
                post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : undefined
              }
              summary={post.summary}
              href={`/posts/${post.slug}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
