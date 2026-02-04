import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

// Force dynamic rendering - database may not have tables during build
export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  try {
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
      openGraph: {
        title: post.title,
        description: post.summary,
      },
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post = null;
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: {
        slug: { equals: slug },
        status: { equals: "published" },
      },
      limit: 1,
    });
    post = docs[0];
  } catch {
    // Database tables may not exist yet
  }

  if (!post) {
    notFound();
  }

  const typeLabel = typeLabels[post.type] || post.type;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {typeLabel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {post.title}
        </h1>
        {post.publishedAt && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatDate(post.publishedAt)}</p>
        )}
      </header>

      {post.summary && (
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{post.summary}</p>
      )}

      <section className="prose prose-zinc dark:prose-invert max-w-none">
        <RichText data={post.body as SerializedEditorState} />
      </section>
    </article>
  );
}
