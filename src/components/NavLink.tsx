'use client';

import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

export function NavLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`${className} ${isActive ? 'text-accent' : 'hover:text-accent'} transition-colors focus-ring`}
    >
      {children}
    </Link>
  );
}
