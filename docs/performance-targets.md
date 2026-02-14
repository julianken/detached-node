# Performance Targets

## Core Web Vitals (75th percentile)

### Largest Contentful Paint (LCP)
- **Target**: < 2.5s
- **Current baseline**: TBD (measure after deployment)
- **Key optimizations**:
  - ISR caching for post pages (60-second revalidation)
  - Next.js Image optimization with WebP/AVIF
  - Font optimization with `next/font`
  - Payload CMS image optimization

### First Input Delay (FID) / Interaction to Next Paint (INP)
- **Target**: < 100ms
- **Current baseline**: TBD
- **Key optimizations**:
  - React Compiler for automatic memoization
  - Minimal client-side JavaScript
  - Code splitting via dynamic imports
  - Server Components by default

### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- **Current baseline**: TBD
- **Key optimizations**:
  - Skeleton loaders for post cards
  - Fixed dimensions on images
  - Font optimization with font-display: swap
  - Reserved space for dynamic content

## Time to First Byte (TTFB)
- **Dynamic pages**: < 600ms (e.g., `/api/graphql`)
- **ISR pages**: < 100ms (e.g., `/posts/[slug]`)
- **Static pages**: < 50ms (e.g., `/about`)

## Bundle Size Budgets
- **First Load JS**: < 100KB (gzipped)
- **Total Page Weight**: < 1MB
- **Images**: WebP/AVIF format, < 200KB each
- **CSS**: Tailwind JIT compilation, minimal custom CSS

## Current Optimizations

### Implemented
- ✅ React 19 Compiler for automatic optimization
- ✅ ISR with 60-second revalidation on posts
- ✅ Server Components by default
- ✅ Vercel Speed Insights integration
- ✅ Vercel Analytics integration
- ✅ Package import optimization (@payloadcms/richtext-lexical)
- ✅ Next.js Image component for automatic optimization
- ✅ Security headers configuration

### Planned
- ⏳ Bundle size analysis in CI/CD
- ⏳ Performance budgets enforcement
- ⏳ Skeleton loaders for loading states
- ⏳ Dynamic imports for heavy components
- ⏳ Service Worker for offline support

## Monitoring

### Real User Monitoring (RUM)
- **Vercel Speed Insights**: Production-only Web Vitals tracking
  - Dashboard: https://vercel.com/[team]/mind-controlled/speed-insights
  - Metrics: LCP, FID/INP, CLS, TTFB
  - P75 percentile tracking
  - Geographic distribution

### Analytics
- **Vercel Analytics**: Page views and user behavior
  - Dashboard: https://vercel.com/[team]/mind-controlled/analytics
  - Traffic patterns
  - User flows
  - Referrer sources

### Build-time Monitoring
- Next.js build output shows First Load JS for each route
- Bundle analysis with `@next/bundle-analyzer` (install if needed)

## Action Thresholds

### Critical (P0)
- **LCP > 4.0s**: Immediate investigation required
- **INP > 500ms**: Critical interaction delay
- **CLS > 0.25**: Severe layout instability
- **TTFB > 1.0s**: Database or caching issue

### High Priority (P1)
- **LCP 2.5-4.0s**: Optimize images, reduce blocking resources
- **INP 100-500ms**: Reduce JavaScript execution time
- **CLS 0.1-0.25**: Add skeleton loaders, fix layout shifts
- **TTFB 600ms-1.0s**: Optimize database queries, check caching

### Medium Priority (P2)
- **LCP 2.0-2.5s**: Fine-tune optimizations
- **INP 50-100ms**: Monitor for trends
- **CLS 0.05-0.1**: Improve loading states
- **TTFB 400-600ms**: Review query patterns

## Optimization Strategies

### For LCP
1. Ensure hero images use priority loading
2. Preload critical fonts
3. Minimize render-blocking resources
4. Optimize server response time
5. Use ISR for frequently accessed content

### For INP
1. Debounce/throttle event handlers
2. Use React.memo for expensive components
3. Defer non-critical JavaScript
4. Minimize main thread work
5. Use web workers for heavy computation

### For CLS
1. Set explicit width/height on images
2. Reserve space for ads/embeds
3. Avoid inserting content above existing content
4. Use transform animations (not top/left)
5. Preload fonts and use font-display: swap

### For TTFB
1. Enable ISR with appropriate revalidation times
2. Optimize database queries
3. Implement request coalescing
4. Use Edge Runtime where possible
5. Monitor and optimize Payload CMS queries

## Testing

### Local Testing
```bash
# Build for production
npm run build

# Check First Load JS in build output
# Target: All routes under 100KB
```

### Lighthouse CI
```bash
# Install globally
npm install -g @lhci/cli

# Run audit
lhci autorun --config=lighthouserc.json
```

### Performance Profiling
1. Chrome DevTools Performance tab
2. React DevTools Profiler
3. Network tab for resource timing
4. Coverage tab for unused code

## References
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Core Web Vitals Thresholds](https://web.dev/defining-core-web-vitals-thresholds/)
