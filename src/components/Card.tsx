import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function Card({ children, href, className = "" }: CardProps) {
  const baseStyles =
    "rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 transition hover:border-zinc-400 dark:hover:border-zinc-500";
  const combinedStyles = `${baseStyles} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return <div className={combinedStyles}>{children}</div>;
}
