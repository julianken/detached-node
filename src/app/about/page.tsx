export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          About
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          This is a placeholder for the project overview, intent, and reading
          guide.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm leading-7 text-zinc-600">
        <p>
          Use this page for background, methodology, or a short manifesto. The
          layout is intentionally minimal so you can customize it later.
        </p>
      </section>
    </div>
  );
}
