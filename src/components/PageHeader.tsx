interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header>
      <h1 className="font-mono text-3xl font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-prose text-base leading-6 text-text-secondary">
          {subtitle}
        </p>
      )}
    </header>
  );
}
