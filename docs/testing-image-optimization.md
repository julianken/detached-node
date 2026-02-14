# Testing Image Optimization (CON-104)

## When to Test

Run these tests after adding the first images via Payload CMS in Phase 2.

## Pre-Test Setup

1. Start development server:
```bash
npm run dev
```

2. Access Payload admin:
```
http://localhost:3000/admin
```

3. Upload test image:
   - Navigate to Media collection
   - Upload a large PNG/JPEG (>500KB recommended)
   - Add alt text (required)
   - Save

4. Create/update post:
   - Add or edit a post
   - Select uploaded image as featuredImage
   - Publish post

## Runtime Tests

### 1. Image Format Optimization

**Test:** Verify WebP/AVIF conversion

1. Open post listing page in browser
2. Open DevTools (F12) → Network tab
3. Filter by "Img" or "Media"
4. Reload page
5. Click on image request

**Expected results:**
- Response type shows `webp` or `avif` (not `png`/`jpeg`)
- File size significantly smaller than original
- Cache-Control header: `public, max-age=31536000, immutable`

**Screenshot location for verification:**
```
Network tab → Headers → Content-Type: image/webp
```

### 2. Responsive Images

**Test:** Verify correct image sizes per viewport

1. Open post in browser (desktop view)
2. DevTools → Network tab → Clear
3. Note image URL and size
4. DevTools → Toggle device toolbar
5. Switch to mobile viewport
6. Reload page
7. Note new image URL and size

**Expected results:**
- Desktop: Larger image (e.g., 1200w)
- Mobile: Smaller image (e.g., 640w)
- URL includes size parameter (e.g., `?w=640`)
- Mobile image is 50-70% smaller bandwidth

**Validation command:**
```bash
# Check srcset generation in HTML
curl http://localhost:3000/posts/your-slug | grep "srcset"
```

### 3. Lazy Loading

**Test:** Verify images load on scroll

1. Open post listing page with multiple posts
2. DevTools → Network tab → Clear
3. Keep page at top (don't scroll)
4. Wait 3 seconds
5. Check Network tab

**Expected results:**
- Only above-fold images loaded initially
- Below-fold images show "pending" or not loaded
- Scroll down → images load as they enter viewport

**Priority image test:**
```bash
# Hero image should have priority (no lazy loading)
curl http://localhost:3000/posts/your-slug | grep "priority"
# Should find: loading="eager" or fetchpriority="high"
```

### 4. Layout Stability (CLS)

**Test:** Verify no layout shift during image load

1. DevTools → Performance tab
2. Check "Screenshots" option
3. Start recording
4. Reload post page
5. Stop recording after page fully loads
6. Review timeline

**Expected results:**
- No sudden jumps when images load
- CLS score < 0.1 (good)
- Blur placeholder visible during load
- Smooth transition to full image

**Lighthouse test:**
```bash
lighthouse http://localhost:3000/posts/your-slug \
  --only-categories=performance \
  --view
```

### 5. Cache Headers

**Test:** Verify long-term caching

1. DevTools → Network tab
2. Load post page
3. Click image request
4. Headers tab

**Expected headers:**
```
Cache-Control: public, max-age=31536000, immutable
Age: 0
X-Vercel-Cache: MISS (first load) or HIT (subsequent)
```

**Validation:**
```bash
curl -I http://localhost:3000/_next/image?url=/media/test.png&w=1200
# Look for Cache-Control header
```

### 6. Open Graph Images

**Test:** Verify social sharing images

1. View post page source:
```bash
curl http://localhost:3000/posts/your-slug | grep "og:image"
```

**Expected output:**
```html
<meta property="og:image" content="/media/your-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Your alt text" />
```

**Social media debuggers:**
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Performance Benchmarks

### Baseline Measurements (Before Optimization)

Create baseline with unoptimized image:

```html
<img src="/media/test-large.png" alt="Test" />
```

1. Lighthouse performance score
2. LCP time
3. Image file size
4. Network bandwidth

### Post-Optimization Measurements

Run same tests with OptimizedImage:

```tsx
<OptimizedImage
  src="/media/test-large.png"
  alt="Test"
  width={1200}
  height={630}
/>
```

**Expected improvements:**
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Image size | ~500KB | ~150KB | 70% reduction |
| LCP | ~2.5s | ~1.5s | <2.5s |
| CLS | 0.1-0.2 | <0.05 | <0.1 |
| Lighthouse | 75-85 | 90-100 | >90 |

### Core Web Vitals

Monitor real user metrics:

```bash
# Install web-vitals package
npm install web-vitals

# Add to _app.tsx or layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Production Tests

After deploying to Vercel:

### 1. CDN Delivery

```bash
# Check X-Vercel-Cache header
curl -I https://your-site.vercel.app/_next/image?url=/media/test.png&w=1200

# Expected: X-Vercel-Cache: HIT (after first request)
```

### 2. Edge Network

Verify images serve from nearest edge location:

1. Use [CDN Planet tool](https://www.cdnplanet.com/tools/cdnfinder/)
2. Enter image URL
3. Verify Vercel Edge Network is detected
4. Check latency from multiple locations

### 3. Format Support

Test across browsers:

**Chrome/Edge (AVIF support):**
```bash
curl -H "Accept: image/avif,image/webp,*/*" \
  https://your-site.vercel.app/_next/image?url=/media/test.png&w=1200
# Content-Type: image/avif
```

**Safari (WebP support):**
```bash
curl -H "Accept: image/webp,*/*" \
  https://your-site.vercel.app/_next/image?url=/media/test.png&w=1200
# Content-Type: image/webp
```

**Old browsers (fallback):**
```bash
curl -H "Accept: */*" \
  https://your-site.vercel.app/_next/image?url=/media/test.png&w=1200
# Content-Type: image/png (original format)
```

## Troubleshooting

### Images not optimizing

**Symptom:** Original PNG/JPEG served instead of WebP/AVIF

**Checks:**
1. Verify next.config.ts has image config
2. Check browser supports format (DevTools → Accept header)
3. Ensure image is from allowed domain (remotePatterns)
4. Check build output for optimization errors

**Solution:**
```bash
npm run build
# Look for: "Optimized X images" or error messages
```

### Layout shift still occurring

**Symptom:** CLS > 0.1, content jumps when image loads

**Checks:**
1. Verify width/height props are set
2. Check if explicit dimensions match actual image
3. Ensure no conflicting CSS (e.g., width: auto)

**Solution:**
```tsx
// Incorrect (causes shift)
<OptimizedImage src="..." alt="..." />

// Correct (stable layout)
<OptimizedImage
  src="..."
  alt="..."
  width={1200}
  height={630}
/>
```

### Images not lazy loading

**Symptom:** All images load immediately

**Checks:**
1. Verify priority prop is only on LCP images
2. Check browser viewport size
3. Ensure images are below fold

**Debug:**
```tsx
// Priority image (loads immediately)
<OptimizedImage priority src="..." alt="..." />

// Lazy image (loads on scroll)
<OptimizedImage src="..." alt="..." />
```

### Cache not working

**Symptom:** Images reload on every request

**Checks:**
1. Verify Cache-Control headers
2. Check browser cache settings (disable cache off)
3. Ensure immutable flag is present

**Validation:**
```bash
# Check response headers
curl -I https://your-site.vercel.app/_next/image?url=/media/test.png
# Should include: Cache-Control: public, max-age=31536000, immutable
```

## Performance Monitoring

### Setup Analytics

**Vercel Analytics:**
1. Enable in Vercel dashboard
2. View Web Vitals tab
3. Monitor LCP, CLS, FCP trends

**Custom monitoring:**
```typescript
// Track image load time
const startTime = performance.now();

<OptimizedImage
  onLoadingComplete={() => {
    const loadTime = performance.now() - startTime;
    console.log(`Image loaded in ${loadTime}ms`);
  }}
  src="..."
  alt="..."
/>
```

### Regular Audits

Schedule monthly:

1. Lighthouse performance audit
2. WebPageTest.org analysis
3. Core Web Vitals check
4. Image optimization review

**Automated testing:**
```bash
# Add to CI/CD pipeline
npm run build
lighthouse https://your-site.vercel.app/posts \
  --only-categories=performance \
  --output=json \
  --output-path=./lighthouse-report.json

# Fail if score < 90
node scripts/check-lighthouse-score.js
```

## Success Criteria

Before marking CON-104 complete:

- [ ] Images serve as WebP/AVIF (not original format)
- [ ] Mobile users receive appropriately sized images
- [ ] Below-fold images lazy load correctly
- [ ] No layout shift when images load (CLS < 0.1)
- [ ] Cache headers show 1-year TTL
- [ ] Lighthouse performance score > 90
- [ ] LCP includes image load time < 2.5s
- [ ] Open Graph images display in social sharing
- [ ] All images have descriptive alt text

## Resources

- [Next.js Image Optimization Docs](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
