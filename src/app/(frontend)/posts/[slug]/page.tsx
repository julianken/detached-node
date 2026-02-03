type PostPageProps = {
  params: {
    slug: string;
  };
};

export default function PostPage({ params }: PostPageProps) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Field Report
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {params.slug.replace(/-/g, " ")}
        </h1>
        <p className="text-sm text-zinc-500">January 2025</p>
      </header>
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm leading-7 text-zinc-600">
        <p>
          This is a placeholder for the post body. Replace it with your content
          pipeline once the authoring format is chosen.
        </p>
      </section>
    </article>
  );
}
