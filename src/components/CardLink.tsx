'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface CardLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function CardLink({ href, className = '', children }: CardLinkProps) {
  const router = useRouter();

  return (
    <a
      href={href}
      className={`card-press ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('is-navigating');
        router.push(href);
      }}
    >
      <div className="card-content">
        {children}
      </div>
      <div className="card-spinner" aria-hidden="true">
        <div className="nav-spinner" />
      </div>
    </a>
  );
}
