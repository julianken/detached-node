# Google Search Console Setup

Setup guide for verifying `detached-node.dev` in Google Search Console and submitting the sitemap.

**Domain:** detached-node.dev
**Deployment:** Vercel
**DNS Provider:** Wherever the domain registrar is (update this once known)

---

## Step 1: Add Property in Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add property**
3. Choose **Domain** (not URL prefix) — this covers all subdomains and both HTTP/HTTPS
4. Enter: `detached-node.dev`
5. Click **Continue**

Google will display a TXT record value. Copy it — you will need it in the next step.

---

## Step 2: DNS Verification via TXT Record

### What to add

| Field | Value |
|-------|-------|
| **Type** | TXT |
| **Name / Host** | `@` (root domain) |
| **Value** | `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| **TTL** | 3600 (or lowest available) |

Replace the `X` string with the actual value shown in Search Console.

### Vercel DNS (if domain is managed through Vercel)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → select the project
2. Navigate to **Settings** → **Domains**
3. Click the domain `detached-node.dev` → **DNS Records**
4. Click **Add Record**
5. Set Type: `TXT`, Name: `@`, Value: paste the google-site-verification string
6. Save

### Registrar DNS (if domain is managed at registrar, e.g. Namecheap, Cloudflare, Google Domains)

Log in to the registrar's DNS management panel and add the TXT record per the table above. Exact UI varies by registrar.

### Propagation

DNS propagation typically takes 5–15 minutes for Vercel-managed DNS. External registrars may take up to 48 hours. Most resolvers pick up TXT records within 30 minutes.

### Verify propagation (optional)

```bash
dig TXT detached-node.dev +short
```

The output should include the `google-site-verification=...` string.

---

## Step 3: Confirm Verification in Search Console

1. Return to Search Console
2. Click **Verify**
3. If propagation is complete, verification succeeds immediately
4. If it fails, wait 15 minutes and retry — do not create a second TXT record

---

## Step 4: Submit the Sitemap

Once the property is verified:

1. In Search Console, select the `detached-node.dev` property
2. Left sidebar → **Indexing** → **Sitemaps**
3. Click **Add a new sitemap**
4. Enter the sitemap URL: `sitemap.xml`
   (Search Console will resolve this against your verified domain as `https://detached-node.dev/sitemap.xml`)
5. Click **Submit**

The sitemap status will change from "Pending" to "Success" once Google fetches it. This typically takes a few minutes to a few hours.

---

## Step 5: Submit the RSS Feed

The RSS feed is available at `https://detached-node.dev/feed.xml`. Google does not index feeds via sitemaps, but feed readers use the `<link rel="alternate" type="application/rss+xml">` tag in the page `<head>` for auto-discovery.

To verify the feed is accessible and valid:

```bash
curl -s https://detached-node.dev/feed.xml | head -20
```

Expected output begins with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Detached Node</title>
    ...
```

Run the feed through [validator.w3.org/feed/](https://validator.w3.org/feed/) to confirm it passes RSS 2.0 validation.

---

## Step 6: URL Inspection

Use the URL Inspection tool to check individual pages:

1. In Search Console, click the search bar at the top
2. Enter a full URL (e.g. `https://detached-node.dev/posts/your-post-slug`)
3. Click **Inspect**
4. If the page is not indexed, click **Request indexing**

Use this workflow for:
- New posts after publication — request indexing to accelerate discovery
- Pages flagged as "Discovered - currently not indexed" in the Coverage report
- Any URL returning unexpected status in the Coverage report

---

## First 30 Days: Monitoring Checklist

After verification and sitemap submission, check Search Console on this schedule:

### Day 1–3

- [ ] Sitemap shows status "Success" (Indexing → Sitemaps)
- [ ] At least one URL appears in the Coverage report (Indexing → Pages)
- [ ] No "Server error (5xx)" entries in Coverage

### Day 7

- [ ] Coverage report shows the homepage and about page as indexed
- [ ] No unexpected "Excluded" categories dominating the report
- [ ] Sitemap continues to show "Success"

### Day 14

- [ ] Post URLs begin appearing in Coverage (if posts were published)
- [ ] Check Core Web Vitals (Experience → Core Web Vitals) for any flagged URLs
- [ ] First impressions may appear in Performance → Search results (queries with 0 clicks are normal at this stage)

### Day 30

- [ ] Review which queries are generating impressions
- [ ] Confirm all published posts appear as indexed or queued
- [ ] Check for crawl anomalies in Coverage (large "Not indexed" spike = potential issue)
- [ ] Verify Core Web Vitals shows "Good" URLs — flag any "Poor" entries for investigation

---

## Ongoing Monitoring

After the first 30 days, check Search Console periodically for:

- **Coverage report** (Indexing → Pages): Confirms which URLs are indexed; flags crawl errors
- **Core Web Vitals** (Experience → Core Web Vitals): Flags LCP/CLS/INP regressions
- **Search results** (Performance → Search results): Impressions and clicks by query
- **Sitemap status** (Indexing → Sitemaps): Confirms the sitemap is being fetched and parsed

No action is required unless Coverage shows unexpected "Not indexed" entries or the sitemap shows errors.

---

## Troubleshooting

**Verification fails after DNS update:**
- Confirm the TXT record value is exact — no extra spaces or line breaks
- Run `dig TXT detached-node.dev +short` and confirm the record appears
- Wait 30 minutes and retry

**Sitemap shows "Couldn't fetch":**
- Visit `https://detached-node.dev/sitemap.xml` in a browser and confirm it returns valid XML
- Check that the deployment is live and the domain resolves correctly
- Resubmit from Search Console

**RSS feed returns 404:**
- Confirm `src/app/feed.xml/route.ts` was deployed (check Vercel deployment logs)
- Visit `https://detached-node.dev/feed.xml` directly — a 404 means the route did not deploy
- Verify the file is at the app root (`src/app/feed.xml/`), not inside a route group

**URL Inspection shows "Crawled - currently not indexed":**
- This is normal for new sites in the first 1–4 weeks
- Use **Request indexing** for high-priority pages
- Ensure internal links point to the page (orphan pages are indexed more slowly)
