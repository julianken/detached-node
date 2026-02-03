import { PageHeader } from "@/components/PageHeader";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="About"
        subtitle="This is a placeholder for the project overview, intent, and reading guide."
      />
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm leading-7 text-zinc-600">
        <p>
          Use this page for background, methodology, or a short manifesto. The
          layout is intentionally minimal so you can customize it later.
        </p>
      </section>
    </div>
  );
}
