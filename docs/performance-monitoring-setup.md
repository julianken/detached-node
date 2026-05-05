# Performance Monitoring Setup

This site deploys to **Cloud Run**, not Vercel. Performance signals come from two
sources:

1. **Server-side latency** — Cloud Run access logs in Cloud Logging.
2. **Client-side Web Vitals** — `useReportWebVitals` → `/api/vitals` → Cloud Logging.

No third-party RUM SDK is installed.

## Architecture

```
Browser
  │  useReportWebVitals (next/web-vitals)
  ▼
WebVitalsReporter            navigator.sendBeacon
(src/components/             ─────────────────────►  /api/vitals
 WebVitalsReporter.tsx)                              (src/app/api/vitals/route.ts)
                                                        │
                                                        │ console.log(JSON.stringify(...))
                                                        ▼
                                                     stdout
                                                        │
                                                        ▼
                                            Cloud Logging (jsonPayload.*)
```

Cloud Run automatically parses any stdout line that's valid JSON into
`jsonPayload`, and recognizes a top-level `severity` field. That's why the route
emits `console.log(JSON.stringify({ severity: "INFO", message: "web_vital", ... }))`
rather than calling the project logger — `logEvent` in `src/lib/logging.ts` is a
no-op outside development.

## Privacy

The `/api/vitals` route never logs IP. It derives a coarse `device: "mobile" |
"desktop"` flag from `User-Agent` and discards everything else from the header.
No cookies, no session IDs, no per-user identifiers.

## Querying

### Server-side latency (already collected, no setup)

Cloud Run emits a request log per request. To see p95 server latency over the
last 30 days, broken out by route, run:

```bash
gcloud logging read '
  resource.type="cloud_run_revision"
  resource.labels.service_name="detached-node"
  httpRequest.requestMethod="GET"
  httpRequest.status<500
  timestamp>="-P30D"
' --format='value(timestamp, httpRequest.requestUrl, httpRequest.latency)' \
  --limit=10000 > latency.tsv
```

For a chart, use **Logs Explorer → Create chart from query**, or pivot in Metrics
Explorer with `run.googleapis.com/request_latencies` (a built-in Cloud Run
metric, no log query required). Group by `revision_name` to spot regressions
tied to specific deploys.

### Client-side Web Vitals (collected once this is deployed)

```
resource.type="cloud_run_revision"
jsonPayload.message="web_vital"
jsonPayload.vital.name="LCP"
```

Useful breakdowns:

- `jsonPayload.path` — per-route p75
- `jsonPayload.device` — mobile vs desktop split
- `jsonPayload.vital.rating` — Google's good/needs-improvement/poor bucketing
- `jsonPayload.vital.navigationType` — distinguish cold loads from soft nav

To extract a time series, in Logs Explorer use **"Create metric"** with a
distribution metric on `jsonPayload.vital.value`, filtered by
`jsonPayload.vital.name`. That gives you a chartable Cloud Monitoring metric
per vital.

## Verification after first deploy

1. Open the production site in a real browser (vitals are no-ops in dev).
2. DevTools → Network → filter `vitals`. Each metric finalization should
   produce a `204` POST to `/api/vitals`.
3. In Cloud Logging, search `jsonPayload.message="web_vital"` — entries should
   appear within ~30 seconds.
4. The page must be fully unloaded before LCP/CLS finalize, so navigate away
   (or close the tab) to flush them via `sendBeacon`.

## Known limitations

- `/api/vitals` is **not rate-limited**. The existing Upstash limiter only
  covers `/api/graphql` (see `docs/rate-limiting-strategy.md`). If `/api/vitals`
  becomes a target, wire that limiter in.
- No sampling. At current traffic this is fine; when traffic grows, add a
  client-side `Math.random() < SAMPLE_RATE` gate in `WebVitalsReporter.tsx`.
- The route logs only succeed if the server is alive. Hard server crashes
  during a beacon flush will drop the metric — acceptable for RUM purposes.
