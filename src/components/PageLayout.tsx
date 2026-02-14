import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  /**
   * Vertical spacing between major page sections
   * @default "lg" (gap-16, 4rem)
   */
  gap?: "md" | "lg";
  /**
   * Maximum content width constraint
   * @default "full" - no width constraint
   */
  maxWidth?: "full" | "prose" | "content";
}

const gapClasses = {
  md: "gap-12",
  lg: "gap-16",
} as const;

const maxWidthClasses = {
  full: "",
  prose: "max-w-3xl mx-auto",
  content: "max-w-5xl mx-auto",
} as const;

/**
 * Standard page layout container providing consistent vertical spacing.
 *
 * Handles page-level structure while allowing flexible content composition.
 * Use with PageHeader component for title/subtitle sections.
 *
 * This component provides ONLY layout structure - it does not render headers,
 * breadcrumbs, or other content. Compose those separately for maximum flexibility.
 *
 * @example
 * // Simple static page with header
 * <PageLayout>
 *   <PageHeader title="About" subtitle="..." />
 *   <section>Content</section>
 * </PageLayout>
 *
 * @example
 * // Post detail with breadcrumb and custom header
 * <PageLayout maxWidth="prose">
 *   <Link href="/posts">← Back to Posts</Link>
 *   <header>Custom header structure</header>
 *   <article>Content</article>
 * </PageLayout>
 */
export function PageLayout({
  children,
  gap = "lg",
  maxWidth = "full",
}: PageLayoutProps) {
  return (
    <div className={`flex flex-col ${gapClasses[gap]} ${maxWidthClasses[maxWidth]}`}>
      {children}
    </div>
  );
}
