# Image Optimization Implementation (CON-104)

## Overview

Implementation of Next.js Image component for optimized media delivery with automatic WebP/AVIF conversion, responsive images, and lazy loading.

**Status:** ✅ Complete - Infrastructure ready for Phase 2 image usage

## Implementation Details

### 1. OptimizedImage Component

**Location:** `/src/components/OptimizedImage.tsx`

A reusable wrapper around Next.js `<Image>` with optimized defaults:

```typescript
<OptimizedImage
  src="/media/hero.png"
  alt="Article hero"
  width={1200}
  height={630}
  priority // For LCP images only
  className="rounded-xl"
/>
```

**Features:**
- Automatic format conversion (WebP/AVIF)
- Responsive srcset generation
- Lazy loading (unless `priority` is true)
- Blur placeholder to prevent layout shift (CLS improvement)
- Optimized sizes attribute for responsive breakpoints

### 2. Next.js Image Configuration

**Location:** `/next.config.ts`

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year for immutable images
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.public.blob.vercel-storage.com',
      pathname: '/**',
    },
  ],
}
```

**Configuration details:**
- **Formats:** AVIF first (best compression), fallback to WebP
- **Device sizes:** Optimized for common breakpoints (mobile to 4K)
- **Cache TTL:** 1 year for immutable content (aligns with CDN best practices)
- **Remote patterns:** Supports Vercel Blob storage URLs when configured

### 3. Integration with Posts

#### PostCard Component
**Location:** `/src/components/PostCard.tsx`

- Added `featuredImage` prop (optional)
- Displays image at top of card when present
- Hover effect (scale transition) for visual feedback
- Type-safe with Payload Media type

#### Post Detail Page
**Location:** `/src/app/(frontend)/posts/[slug]/page.tsx`

- Hero image display between header and summary
- Uses `priority={true}` for LCP optimization
- Added to Open Graph metadata for social sharing
- Responsive layout with negative margins for full-width display

#### Post Queries
**Location:** `/src/lib/queries/posts.ts`

- Added `depth: 1` to all queries to populate `featuredImage` relationship
- Queries now return full Media object instead of just ID reference

### 4. Type Safety

All components use proper type guards:

```typescript
// Check if featuredImage is a Media object (not ID reference)
const featuredImage = typeof post.featuredImage === 'object' &&
                      post.featuredImage !== null ?
                      post.featuredImage : null;

// Check for required url property before rendering
{featuredImage && featuredImage.url && (
  <OptimizedImage src={featuredImage.url} ... />
)}
```

## Performance Benefits

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Image file size | ~500KB PNG | ~150KB AVIF | 70% reduction |
| LCP (hero images) | ~2.5s | ~1.5s | 40% faster |
| CLS (layout shift) | 0.1-0.2 | <0.05 | Stable |
| Network requests | 1 per image | 1 per image | Same (but smaller) |

### Optimization Features

1. **Format conversion**
   - Automatic AVIF/WebP serving based on browser support
   - Up to 70% file size reduction vs PNG/JPEG

2. **Responsive images**
   - Correct image size per device (no wasted bandwidth)
   - Mobile users don't download desktop-sized images

3. **Lazy loading**
   - Images load only when scrolled into view
   - Reduces initial page load time
   - Exception: `priority={true}` for LCP images

4. **Layout stability**
   - Blur placeholder prevents layout shift
   - Explicit width/height prevents CLS issues

5. **Long-term caching**
   - 1-year cache TTL for immutable content
   - Next.js automatic cache busting via URL hashing

## Testing Instructions

### 1. Build Validation

```bash
npm run build
```

**Expected output:**
- ✅ TypeScript compilation passes
- ✅ No image optimization errors
- ✅ Static pages pre-rendered successfully

### 2. Runtime Testing (when images are added)

#### Add a test post with image:

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Create a new post with a featured image
4. View the post on frontend

#### Verify optimizations:

**Browser DevTools Network tab:**
- Check `Type` column shows `webp` or `avif` (not `png`)
- Check `Size` is smaller than original upload
- Verify `Cache-Control` header shows `immutable`

**Performance tab:**
- LCP should include hero image render time
- Verify no layout shift when image loads
- Check images below fold lazy load (deferred)

**Responsive testing:**
- Resize viewport - verify different image sizes load
- Check mobile viewport serves mobile-sized images
- Use DevTools device emulation for various sizes

### 3. Core Web Vitals Measurement

```bash
# Install Lighthouse CLI (if not already installed)
npm install -g lighthouse

# Run Lighthouse on a post with images
lighthouse http://localhost:3000/posts/your-post-slug \
  --only-categories=performance \
  --view
```

**Target metrics:**
- LCP: < 2.5s (Good)
- CLS: < 0.1 (Good)
- First Contentful Paint: < 1.8s (Good)

## Current State

**No images in database yet** - this is expected for Phase 1.

The infrastructure is ready for when images are added:

✅ OptimizedImage component created
✅ Next.js image config added
✅ PostCard supports featured images
✅ Post detail displays hero images
✅ Queries include image relationships
✅ Open Graph metadata includes images
✅ Type safety implemented
✅ Build validates successfully

## Usage Examples

### Adding an image to a post (via Payload CMS)

1. Upload image via Media collection
2. Add alt text (required for accessibility)
3. Select image as featuredImage in Post
4. Image automatically displays on:
   - Post listing page (PostCard)
   - Post detail page (hero image)
   - Social sharing (Open Graph)

### Manual image usage in content

```typescript
import { OptimizedImage } from '@/components/OptimizedImage';

// Hero image (priority loading)
<OptimizedImage
  src="/media/hero.png"
  alt="Article hero image"
  width={1200}
  height={630}
  priority
  className="rounded-xl"
/>

// In-content image (lazy loading)
<OptimizedImage
  src="/media/diagram.png"
  alt="System architecture diagram"
  width={800}
  height={600}
  className="my-8"
/>
```

## Next Steps (Phase 2)

1. **Add storage adapter for production**
   - Configure Vercel Blob storage
   - Update Media collection to use adapter
   - Test upload/optimization pipeline

2. **Image CDN optimization**
   - Verify images serve from Vercel Edge Network
   - Check cache headers in production
   - Measure real-world performance gains

3. **Content workflow**
   - Define image size guidelines for authors
   - Document optimal dimensions for different contexts
   - Create image optimization checklist

## Performance Monitoring

After images are added, monitor these metrics:

```bash
# Check build output for image optimization
npm run build | grep -A 10 "Image"

# Analyze bundle size
npm run build -- --profile

# Production performance
# Use Vercel Analytics or Web Vitals API
```

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Core Web Vitals](https://web.dev/vitals/)
- [AVIF vs WebP comparison](https://jakearchibald.com/2020/avif-has-landed/)
- [Payload Upload field](https://payloadcms.com/docs/upload/overview)
