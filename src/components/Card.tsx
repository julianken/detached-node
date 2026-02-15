import { CardLink } from "./CardLink";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  label?: string;
}

export function Card({ children, href, className = "", label }: CardProps) {
  const baseStyles =
    "card-trace card-scanline relative rounded-sm border border-border bg-surface p-5 transition-colors hover:border-border-hover hover:bg-hover-bg hover:shadow-sm focus-ring";
  const combinedStyles = `${baseStyles} ${className}`.trim();

  const labelEl = label ? (
    <span className="frame-label" aria-hidden="true">
      {label}
    </span>
  ) : null;

  if (href) {
    return (
      <CardLink href={href} className={combinedStyles}>
        {labelEl}
        {children}
      </CardLink>
    );
  }

  return (
    <div className={combinedStyles}>
      {labelEl}
      {children}
    </div>
  );
}
