import { Card } from "@/components/Card";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

// Force dynamic rendering - database may not have tables during build
export const dynamic = "force-dynamic";

type FeaturedPost = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
};

export default async function Home() {
  let featuredPosts: FeaturedPost[] = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      where: {
        featured: { equals: true },
        status: { equals: "published" },
      },
      limit: 3,
    });
    featuredPosts = result.docs;
  } catch {
    // Database tables may not exist yet - show empty state
  }

  return (
    <div className="flex flex-col gap-14">
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Signal Feed
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900">
          A clean, repeatable structure for blog posts and analysis.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
          This is the Phase 1 shell. Navigation, layout, and placeholders are in
          place so you can plug in real content and iterate on the design
          system.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            className="rounded-full border border-zinc-900 px-5 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
            href="/posts"
          >
            Browse posts
          </Link>
          <Link
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            href="/about"
          >
            About the project
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-zinc-900">
          Featured posts
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Recent highlights from the archive.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Card key={post.id} href={`/posts/${post.slug}`}>
                <h3 className="text-base font-semibold text-zinc-900">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {post.summary}
                </p>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <p className="text-sm text-zinc-500">
                No featured posts yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
