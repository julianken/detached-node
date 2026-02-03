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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Posts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          A simple listing layout you can replace with dynamic content later.
        </p>
      </header>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <a
            key={post.title}
            className="rounded-xl border border-zinc-200 p-6 transition hover:border-zinc-400"
            href={post.href}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                {post.title}
              </h2>
              <span className="text-xs text-zinc-500">{post.date}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {post.summary}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
