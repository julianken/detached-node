import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { getFeaturedPosts } from "@/lib/queries/posts";

// ISR: Revalidate every 30 minutes - featured posts change infrequently
export const revalidate = 1800;

export default async function Home() {
  const featuredPosts = await getFeaturedPosts(3);

  return (
    <div className="flex flex-col gap-16">
      <section className="hero-glow rounded-sm border border-border bg-surface p-8">
        <h1 className="font-mono text-4xl font-semibold tracking-tight text-text-primary [text-wrap:balance]">
          You are being controlled through your devices.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-text-secondary">
          You are being conditioned through the device in your hand.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button href="/posts" asChild>
            Browse the archive
          </Button>
          <Button href="/about" variant="secondary" asChild>
            About this project
          </Button>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-xl font-semibold tracking-tight text-text-primary">
          Recent transmissions
        </h2>
        <p className="mt-2 text-base leading-6 text-text-secondary">
          Field reports and analysis from the archive.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Card key={post.id} href={`/posts/${post.slug}`} label="FIELD REPORT">
                <h3 className="font-mono text-base font-semibold text-text-primary [text-wrap:balance]">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary [text-wrap:pretty]">
                  {post.summary}
                </p>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-sm border border-dashed border-border p-8 text-center">
              <p className="text-sm text-text-tertiary">
                No featured posts yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
