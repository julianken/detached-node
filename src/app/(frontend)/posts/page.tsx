import { getPayload } from "payload";
import config from "@payload-config";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";

export default async function PostsPage() {
  const payload = await getPayload({ config });
  const { docs: posts } = await payload.find({
    collection: "posts",
    where: {
      status: { equals: "published" },
    },
    sort: "-publishedAt",
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Posts"
        subtitle="Essays and analysis on propaganda, conditioning, and the mechanics of mind control."
      />
      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">
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
