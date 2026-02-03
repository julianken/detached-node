interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          {subtitle}
        </p>
      )}
    </header>
  );
}
