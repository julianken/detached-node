import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { getFeaturedPosts } from "@/lib/queries/posts";

// ISR: Revalidate every 30 minutes - featured posts change infrequently
export const revalidate = 1800;

export default async function Home() {
  const featuredPosts = await getFeaturedPosts(3);

  return (
    <div className="flex flex-col gap-16">
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          A clean, repeatable structure for blog posts and analysis.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          This is the Phase 1 shell. Navigation, layout, and placeholders are in
          place so you can plug in real content and iterate on the design
          system.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button href="/posts" asChild>
            Browse posts
          </Button>
          <Button href="/about" variant="secondary" asChild>
            About the project
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Featured posts
        </h2>
        <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
          Recent highlights from the archive.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Card key={post.id} href={`/posts/${post.slug}`}>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {post.summary}
                </p>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No featured posts yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
