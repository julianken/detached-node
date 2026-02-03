export default function Home() {
  const highlights = [
    {
      title: "Featured Essay",
      summary:
        "A long-form entry with a strong hook, a clear thesis, and structured evidence.",
      href: "/posts/featured-essay",
    },
    {
      title: "Decoder",
      summary:
        "A quick, repeatable pattern for breaking down persuasion tactics.",
      href: "/posts/decoder-template",
    },
    {
      title: "Index",
      summary:
        "A source and citation area that ties essays back to references.",
      href: "/posts/index-template",
    },
  ];

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
          <a
            className="rounded-full border border-zinc-900 px-5 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
            href="/posts"
          >
            Browse posts
          </a>
          <a
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            href="/about"
          >
            About the project
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-zinc-900">
          Content blueprints
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Use these as placeholders while wiring up the content pipeline.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <a
              key={item.title}
              className="rounded-xl border border-zinc-200 p-5 transition hover:border-zinc-400"
              href={item.href}
            >
              <h3 className="text-base font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {item.summary}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
