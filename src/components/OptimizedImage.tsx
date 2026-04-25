import Image from "next/image";
import type { CSSProperties } from "react";

interface CommonProps {
  src: string;
  alt: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  sizes?: string;
  style?: CSSProperties;
}

type OptimizedImageProps = CommonProps &
  (
    | { fill: true; width?: never; height?: never }
    | { fill?: false; width: number; height: number }
  );

/**
 * Optimized image component using Next.js Image
 *
 * Provides automatic optimization, responsive images, and lazy loading.
 * Use priority={true} for LCP images (hero images, featured post images).
 *
 * Performance benefits:
 * - Automatic WebP/AVIF conversion (30-50% smaller)
 * - Responsive srcset generation (correct size per device)
 * - Lazy loading (images load as user scrolls)
 * - Blur placeholder (prevents layout shift)
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/media/post-hero.png"
 *   alt="Article hero image"
 *   width={1200}
 *   height={630}
 *   priority
 * />
 * ```
 */
/**
 * Convert absolute URLs from our own server to relative paths.
 * Payload generates full URLs using NEXT_PUBLIC_SERVER_URL, but in dev
 * the images are served locally — relative paths let Next.js resolve them.
 */
function toRelativeSrc(src: string): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl && src.startsWith(serverUrl)) {
    return src.slice(serverUrl.length);
  }
  return src;
}

export function OptimizedImage(props: OptimizedImageProps) {
  const {
    src,
    alt,
    priority = false,
    fetchPriority,
    className = "",
    sizes,
    style,
  } = props;

  const dimensionProps = props.fill
    ? { fill: true as const }
    : { width: props.width, height: props.height };

  return (
    <Image
      src={toRelativeSrc(src)}
      alt={alt}
      {...dimensionProps}
      priority={priority}
      fetchPriority={fetchPriority}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      className={className}
      style={style}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    />
  );
}
