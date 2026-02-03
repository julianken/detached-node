import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Map post type values to display labels
const typeLabels: Record<string, string> = {
  essay: "Essay",
  decoder: "Decoder",
  index: "Index",
  "field-report": "Field Report",
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  const payload = await getPayload({ config });

  const { docs: posts } = await payload.find({
    collection: "posts",
    where: {
      status: { equals: "published" },
    },
    limit: 1000,
    select: {
      slug: true,
    },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
      status: { equals: "published" },
    },
    limit: 1,
  });

  const post = docs[0];

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
      status: { equals: "published" },
    },
    limit: 1,
  });

  const post = docs[0];

  if (!post) {
    notFound();
  }

  const typeLabel = typeLabels[post.type] || post.type;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {typeLabel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {post.title}
        </h1>
        {post.publishedAt && (
          <p className="text-sm text-zinc-500">{formatDate(post.publishedAt)}</p>
        )}
      </header>

      {post.summary && (
        <p className="text-lg leading-relaxed text-zinc-600">{post.summary}</p>
      )}

      <section className="prose prose-zinc max-w-none">
        <RichText data={post.body as SerializedEditorState} />
      </section>
    </article>
  );
}
