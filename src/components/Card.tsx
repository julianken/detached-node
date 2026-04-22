import { Link } from "next-view-transitions";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  label?: string;
}

export function Card({ children, href, className = "", label }: CardProps) {
  const baseStyles =
    "relative block transition-colors hover:text-accent focus-ring";
  const combinedStyles = `${baseStyles} ${className}`.trim();

  const labelEl = label ? (
    <span className="frame-label" aria-hidden="true">
      {label}
    </span>
  ) : null;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {labelEl}
        {children}
      </Link>
    );
  }

  return (
    <div className={combinedStyles}>
      {labelEl}
      {children}
    </div>
  );
}
