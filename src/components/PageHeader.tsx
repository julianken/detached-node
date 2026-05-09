interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header>
      <h1 className="font-mono text-page-h1 font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-prose text-body leading-relaxed text-text-secondary">
          {subtitle}
        </p>
      )}
    </header>
  );
}
