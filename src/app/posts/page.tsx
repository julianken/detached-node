import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";

const posts = [
  {
    title: "Sample post title",
    date: "Jan 22, 2025",
    summary: "A short summary that mirrors the tone of the real articles.",
    href: "/posts/sample-post-title",
  },
  {
    title: "Another post placeholder",
    date: "Jan 21, 2025",
    summary: "Keep the structure simple while the content pipeline evolves.",
    href: "/posts/another-post-placeholder",
  },
  {
    title: "Third post example",
    date: "Jan 20, 2025",
    summary: "Use this space to preview how summaries will read.",
    href: "/posts/third-post-example",
  },
];

export default function PostsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Posts"
        subtitle="A simple listing layout you can replace with dynamic content later."
      />
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.title}
            title={post.title}
            date={post.date}
            summary={post.summary}
            href={post.href}
          />
        ))}
      </div>
    </div>
  );
}
