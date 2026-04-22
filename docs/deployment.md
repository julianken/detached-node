# Deployment Guide

**Platform**: Vercel
**Database**: Supabase Postgres (Transaction Pooler mode for serverless)
**Storage**: Vercel Blob (optional, for media uploads)
**Rate Limiting**: Upstash Redis (optional but recommended)

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Deployment Workflow](#deployment-workflow)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Database Migrations](#database-migrations)
5. [Monitoring](#monitoring)
6. [Rollback Procedure](#rollback-procedure)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)
9. [Cost Management](#cost-management)
10. [Future Enhancements](#future-enhancements)

## Environment Variables

### Required (Production)

These environment variables MUST be set in Vercel project settings before deployment.

```bash
# Database (Supabase Postgres with Transaction Pooler)
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Payload CMS Secret (minimum 32 characters)
# Generate with: openssl rand -base64 32
PAYLOAD_SECRET="your-cryptographically-random-secret-min-32-chars"

# Server URL (update with your production domain)
NEXT_PUBLIC_SERVER_URL="https://detached-node.vercel.app"
```

**Important Notes**:

- **DATABASE_URL**: Must use Supabase Transaction Pooler (port 6543) for serverless compatibility. Session Pooler (port 5432) will cause connection issues on Vercel.
- **PAYLOAD_SECRET**: Generate a strong secret. Never reuse across environments.
- **NEXT_PUBLIC_SERVER_URL**: Must match your production domain exactly (no trailing slash).

### Optional (Production)

These environment variables enable optional features in production.

```bash
# Vercel Blob Storage (for media uploads)
# Auto-configured when you add Vercel Blob via dashboard
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Upstash Redis (for distributed rate limiting)
# HIGHLY RECOMMENDED for production to prevent API abuse
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Future integrations (not yet implemented)
# SENTRY_DSN="https://..."
# SENTRY_AUTH_TOKEN="..."
```

**Important Notes**:

- **BLOB_READ_WRITE_TOKEN**: Only required if you want admin users to upload images. Without this, media uploads will fail gracefully.
- **UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN**: Required for production rate limiting. Without these, rate limiting falls back to in-memory mode (not recommended for production).

### Development (.env.local)

Copy `.env.example` to `.env.local` and configure for local development.

```bash
# Local Postgres (or Supabase)
DATABASE_URL="postgresql://localhost:5432/detachednode"

# Development secret (generate a unique one, don't use production secret)
PAYLOAD_SECRET="dev-secret-min-32-chars-long-string-here"

# Local server URL
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# Optional: Local Upstash Redis for testing rate limiting
# UPSTASH_REDIS_REST_URL="..."
# UPSTASH_REDIS_REST_TOKEN="..."
```

**Never commit `.env.local` to git.** It's already in `.gitignore`.

### Preview Environment

Vercel scopes environment variables per environment (Production, Preview, Development). A variable set only in Production is **undefined during Preview builds**, which breaks every PR's preview deployment. See [issue #73](https://github.com/julianken/detached-node/issues/73) for the incident this section prevents.

The following variables must be set in Vercel's **Preview** scope (in addition to Production):

```bash
# Payload CMS secret — MUST differ from Production (token-signing isolation)
# Generate with: openssl rand -base64 32
PAYLOAD_SECRET="preview-only-secret-min-32-chars"

# Server URL — safe to reuse the Production canonical, or use a per-deployment URL
NEXT_PUBLIC_SERVER_URL="https://detached-node.vercel.app"

# Database — TODO: provision a dedicated Preview Postgres.
# Do NOT point Preview at the Production DB: `payload migrate` runs on every
# Preview build and would mutate production data.
DATABASE_URL="postgres://..."
```

Vercel env vars are not inherited across scopes — Production and Preview are independent name-value maps.

**Setting them via CLI**:

```bash
vercel env add PAYLOAD_SECRET preview
# paste a fresh secret; do NOT reuse Production's
vercel env add NEXT_PUBLIC_SERVER_URL preview
vercel env add DATABASE_URL preview
```

**Verifying**:

```bash
vercel env ls | grep -E "PAYLOAD_SECRET|DATABASE_URL|NEXT_PUBLIC_SERVER_URL"
# Expect each row to list "Preview" in its environments column
```

Missing any of these in Preview produces the error `Missing required environment variables: [...]` at build time (see `src/lib/env/required-env.ts`).

## Deployment Workflow

### Automatic Deployments

**Production** (main branch):

1. Push to `main` branch triggers automatic production deployment
2. Vercel runs `npm run build` (which includes `payload migrate` via `build:production` script)
3. Database migrations execute automatically
4. Build completes and deploys to `detached-node.vercel.app`
5. Deployment is live within 1-2 minutes

**Preview** (Pull Requests):

1. Opening a PR creates a unique preview deployment
2. Each commit to the PR branch triggers a new preview build
3. Preview uses preview environment variables (if configured separately)
4. Preview URL format: `detached-node-git-[branch]-[team].vercel.app`
5. Preview deployments are automatically deleted after PR merge/close

**Branch Protection**:

- Main branch requires PR approval before merge
- All status checks (tests, build) must pass before deployment

### Manual Deployment

Install Vercel CLI for manual control:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Link your local project to Vercel (first time only)
vercel link

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

**When to use manual deployment**:

- Emergency hotfix that bypasses normal CI/CD
- Testing deployment configuration changes
- Debugging deployment issues locally

## Pre-Deployment Checklist

### First-Time Setup (One-Time Tasks)

- [ ] Create Vercel account and team
- [ ] Connect GitHub repository to Vercel project
- [ ] Create Supabase Postgres database
  - [ ] Copy Transaction Pooler connection string (port 6543)
  - [ ] Store DATABASE_URL in Vercel environment variables
- [ ] Generate PAYLOAD_SECRET with `openssl rand -base64 32`
  - [ ] Store in Vercel environment variables
- [ ] Set NEXT_PUBLIC_SERVER_URL to production domain
- [ ] Optional: Add Vercel Blob storage integration via Vercel dashboard
  - [ ] Vercel auto-configures BLOB_READ_WRITE_TOKEN
- [ ] Optional: Create Upstash Redis database for rate limiting
  - [ ] Store UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
- [ ] Enable Vercel Analytics in project settings (already integrated in code)
- [ ] Enable Vercel Speed Insights in project settings (already integrated in code)
- [ ] Configure custom domain (if desired)
  - [ ] Add domain in Vercel dashboard
  - [ ] Update DNS records as instructed
  - [ ] Wait for SSL certificate provisioning
  - [ ] Update NEXT_PUBLIC_SERVER_URL to custom domain

### Before Each Production Deploy

Run these checks before merging to `main`:

**Code Quality**:

- [ ] All unit tests pass: `npm run test:unit`
- [ ] All E2E tests pass: `npm run test:e2e` (if applicable)
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Linter passes with no errors: `npm run lint`

**Build Verification**:

- [ ] Production build succeeds locally: `npm run build`
- [ ] Check First Load JS in build output (target: all routes < 100KB)
- [ ] No console errors or warnings in build output

**Database**:

- [ ] If schema changed, migrations are created and tested locally
- [ ] Migrations are idempotent (safe to run multiple times)
- [ ] Migrations have rollback plan documented

**Configuration**:

- [ ] New environment variables added to Vercel (if any)
- [ ] Environment variables updated in `.env.example`
- [ ] Documentation updated if configuration changed

**Performance**:

- [ ] Bundle size within budget (check build output)
- [ ] Images optimized (WebP/AVIF format, < 200KB each)
- [ ] No obvious performance regressions in preview deployment

**Accessibility**:

- [ ] No critical accessibility issues (run Lighthouse audit)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (test with VoiceOver/NVDA)

**Security**:

- [ ] No secrets committed to git (run `git diff main` and inspect)
- [ ] Rate limiting configured (if Upstash credentials set)
- [ ] Security headers configured (already in `next.config.ts`)

## Database Migrations

### Automatic Migration (Default)

Migrations run automatically on every production deployment.

**How it works**:

1. `package.json` defines `build:production` script: `pnpm payload migrate && pnpm build`
2. Vercel runs this script during build
3. Payload CMS executes pending migrations against DATABASE_URL
4. If migrations succeed, build continues
5. If migrations fail, deployment is aborted

**Build Script**:

```json
{
  "scripts": {
    "build": "next build",
    "build:production": "pnpm payload migrate && pnpm build"
  }
}
```

Vercel uses `build` script by default. To enable automatic migrations, configure Vercel build settings:

**Vercel Dashboard** → Project Settings → General → Build & Development Settings:

- Build Command: `pnpm build:production` (or `npm run build:production`)

### Manual Migration (Emergency Use)

If you need to run migrations manually (rare):

```bash
# SSH into Vercel deployment (not directly supported)
# Instead, use Vercel CLI with production environment

# 1. Pull production environment variables
vercel env pull .env.production

# 2. Run migrations locally against production database
# WARNING: This is dangerous. Only do this if automatic migration failed.
npm run payload migrate

# 3. Verify migrations succeeded
# Check database or Payload admin panel
```

**Warning**: Manual migrations against production database are risky. Only use in emergencies.

### Migration Best Practices

**Creating Migrations**:

1. Run `npm run payload migrate:create` locally
2. Payload generates migration file in `src/migrations/`
3. Review migration SQL (ensure it's safe)
4. Test migration locally against development database
5. Commit migration file to git
6. Automatic migration runs on next deployment

**Migration Safety**:

- Migrations are idempotent (safe to run multiple times)
- Migrations are additive (don't remove columns until data migrated)
- Migrations have zero-downtime strategy:
  - Add new columns (nullable or with defaults)
  - Backfill data in background
  - Switch application to use new columns
  - Remove old columns in separate migration (later)

**Rollback Strategy**:

If migration fails:

1. Check Vercel build logs for error details
2. Fix migration locally
3. Create new migration to repair damage (if needed)
4. Push fix to trigger new deployment
5. Old deployment remains live (Vercel doesn't deploy broken builds)

## Monitoring

### Production Metrics

**Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

Key metrics tracked:

- **Deployments**: Build status, deployment history, rollback options
- **Analytics**: Page views, unique visitors, traffic sources, device breakdown
- **Speed Insights**: Core Web Vitals (LCP, FID/INP, CLS), TTFB, regional performance
- **Function Logs**: Runtime logs, error traces, execution duration
- **Build Logs**: Compilation output, migration execution, warnings/errors

**Linear Issues**: [https://linear.app/beak-gaming/project/upkeep](https://linear.app/beak-gaming/project/upkeep)

- Track production bugs and incidents
- Monitor error rates and trends
- Plan performance improvements

### Performance Targets

See `docs/performance-targets.md` for detailed metrics.

**Core Web Vitals** (75th percentile):

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID/INP** (First Input Delay / Interaction to Next Paint): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

**Time to First Byte**:

- Dynamic pages: < 600ms
- ISR pages: < 100ms
- Static pages: < 50ms

**Bundle Size**:

- First Load JS: < 100KB (gzipped)
- Total page weight: < 1MB

**Current Optimizations**:

- React 19 Compiler (automatic memoization)
- ISR with 60-second revalidation on posts
- Server Components by default
- Vercel Speed Insights and Analytics integration
- Package import optimization
- Next.js Image component (WebP/AVIF)
- Security headers

### Monitoring Tools

**Vercel Speed Insights**:

1. Navigate to Vercel Dashboard → Project → Speed Insights
2. View real user metrics (RUM) for Core Web Vitals
3. Filter by page, device, connection type, geography
4. Identify performance bottlenecks

**Vercel Analytics**:

1. Navigate to Vercel Dashboard → Project → Analytics
2. View traffic patterns, user flows, referrer sources
3. Track conversion funnels (future feature)

**Build-Time Monitoring**:

- Next.js build output shows First Load JS for each route
- Check build logs for warnings about bundle size
- Use `@next/bundle-analyzer` (install separately) for detailed bundle analysis

### Alerts and Notifications

**Recommended Alerts** (configure via Vercel dashboard or integrations):

1. **Deployment Failures**: Email/Slack notification when build fails
2. **High Error Rate**: Alert when error rate > 5% of requests
3. **Performance Degradation**: Alert when LCP > 4.0s (critical)
4. **Rate Limiting**: Alert when > 10% of requests are rate limited (if Upstash configured)
5. **Uptime**: External uptime monitoring (e.g., UptimeRobot, Pingdom)

**Upstash Monitoring** (if rate limiting configured):

- Log into Upstash console → Select database → Analytics tab
- Monitor Redis request rate, latency, error rate
- Track rate limit hits (429 responses)

## Rollback Procedure

If production deployment has critical issues, use these rollback strategies.

### Instant Rollback (Vercel Dashboard)

**Steps**:

1. Navigate to Vercel Dashboard → Project → Deployments
2. Find previous stable deployment (marked with green checkmark)
3. Click "..." menu → "Promote to Production"
4. Confirm promotion
5. Previous deployment is now live (takes effect in seconds)

**Use this when**:

- Critical bug discovered immediately after deployment
- Performance regression detected
- Migrations succeeded but application code has bug

### Git Revert (If Instant Rollback Insufficient)

**Steps**:

```bash
# 1. Revert the problematic commit
git revert HEAD

# 2. Push to main (triggers new deployment)
git push origin main

# 3. Monitor deployment in Vercel dashboard
# Deployment should succeed and restore previous functionality
```

**Use this when**:

- Instant rollback doesn't fully resolve issue
- Need to revert multiple commits
- Database migrations need to be undone (requires new migration)

### Database Rollback (Advanced)

**Warning**: Database rollbacks are complex and risky. Only use in emergencies.

**Steps**:

1. Create compensating migration to undo schema changes
2. Test compensating migration locally
3. Deploy compensating migration via git commit
4. Verify database state is correct

**Prevention**:

- Always test migrations locally before deploying
- Use additive migrations (add columns, don't remove)
- Implement zero-downtime migration strategy

## Troubleshooting

### Build Fails

**Symptoms**: Deployment fails during build phase, error in build logs.

**Diagnosis**:

1. Check build logs in Vercel dashboard (click failed deployment → "Build Logs")
2. Look for TypeScript errors, missing dependencies, migration failures
3. Check if build succeeds locally: `npm run build`

**Solutions**:

- **TypeScript errors**: Fix type errors in code, commit, push
- **Missing dependencies**: Add missing package to `package.json`, commit, push
- **Migration failure**: Fix migration file, create new migration if needed
- **Environment variable missing**: Add to Vercel project settings → Environment Variables
- **`Missing required environment variables: [...]`**: The env-preflight validator caught one or more vars unset for this environment. If Production passes but Preview fails, it's almost certainly per-environment scope — see [Preview Environment](#preview-environment). Diagnose: `vercel env ls | grep -E "PAYLOAD_SECRET|DATABASE_URL|NEXT_PUBLIC_SERVER_URL"`

**Verification**:

```bash
# Test production build locally
npm run build

# Check for errors in output
# Verify First Load JS sizes are reasonable
```

### Runtime Errors

**Symptoms**: Application loads but crashes on certain pages, error in function logs.

**Diagnosis**:

1. Check function logs in Vercel dashboard → Project → Logs
2. Filter by error level, search for stack traces
3. Identify which route/function is failing
4. Check if error occurs in preview deployment (test before production)

**Solutions**:

- **Database connection error**: Verify DATABASE_URL is correct (Transaction Pooler port 6543)
- **PAYLOAD_SECRET error**: Ensure secret is set and >= 32 characters
- **Rate limiting error**: Check UPSTASH_REDIS_REST_URL and token are valid
- **GraphQL error**: Check query syntax, verify schema is correct

**Debugging**:

```bash
# Pull production environment variables
vercel env pull .env.production

# Run locally with production config
npm run dev

# Reproduce error locally
```

### Database Connection Issues

**Symptoms**: "Connection refused", "Too many connections", "Timeout" errors.

**Common Causes**:

1. **Wrong connection string**: Using Session Pooler (port 5432) instead of Transaction Pooler (port 6543)
2. **Database down**: Supabase maintenance or outage
3. **Connection limit reached**: Too many concurrent connections
4. **Network issue**: Firewall blocking Vercel IPs

**Solutions**:

**1. Verify Transaction Pooler**:

```bash
# Correct format (port 6543):
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Wrong format (port 5432) - DO NOT USE:
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**2. Check Supabase Status**:

- Visit Supabase dashboard → Project → Settings → Database
- Check connection status
- Review recent database logs

**3. Test Connection Locally**:

```bash
# Pull production DATABASE_URL
vercel env pull .env.production

# Test connection with psql
psql "$DATABASE_URL"

# If connection fails, DATABASE_URL is invalid
```

**4. Connection Pooling**:

Payload CMS uses `@payloadcms/db-postgres` which handles connection pooling automatically. Configuration in `src/payload.config.ts`:

```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL || '',
  },
  push: true, // Auto-creates tables (disable after initial setup)
}),
```

**5. Supabase Region Mismatch**:

- Ensure Supabase database is in same region as Vercel deployment (or close)
- US East (Supabase: us-east-1, Vercel: iad1)
- US West (Supabase: us-west-1, Vercel: sfo1)
- Europe (Supabase: eu-central-1, Vercel: fra1)

### GraphQL Endpoint Errors

**Symptoms**: GraphQL queries fail, timeout, or return unexpected errors.

**Diagnosis**:

1. Test GraphQL endpoint directly: `https://detached-node.vercel.app/api/graphql`
2. Check function logs for errors
3. Verify query syntax in GraphQL Playground (local: `http://localhost:3000/api/graphql`)

**Solutions**:

- **Query complexity**: GraphQL query is too complex (too many nested fields)
- **Rate limiting**: Request exceeded rate limit (if Upstash configured)
- **Database timeout**: Query takes too long to execute (optimize query)
- **Schema mismatch**: Query references field that doesn't exist (check Payload schema)

**Timeout Configuration**:

GraphQL API routes have increased timeout in `vercel.json`:

```json
{
  "functions": {
    "src/app/(payload)/api/**/*": {
      "maxDuration": 60
    }
  }
}
```

Default Vercel timeout is 10 seconds. This increases it to 60 seconds for Payload API routes.

### Rate Limiting Issues

**Symptoms**: 429 responses, "Rate limit exceeded" errors.

**Diagnosis**:

1. Check if Upstash Redis credentials are configured
2. Verify Upstash database is accessible
3. Review rate limit headers in response:
   - `RateLimit-Limit`: Maximum requests allowed
   - `RateLimit-Remaining`: Requests remaining in window
   - `RateLimit-Reset`: Unix timestamp when limit resets

**Solutions**:

- **Expected rate limiting**: Client is making too many requests (working as intended)
- **Upstash down**: Check Upstash status, falls back to in-memory (less effective)
- **Misconfigured limits**: Review `src/lib/rate-limit.ts`, adjust limits if too strict
- **Development mode**: Rate limiting uses in-memory fallback without Upstash (expected)

**Rate Limiting Strategy**:

See `docs/rate-limiting-strategy.md` for comprehensive documentation.

**Current Limits** (when Upstash configured):

- `/api/users/login`: 5 requests/minute (per IP + User-Agent)
- `/api/users/forgot-password`: 3 requests/hour (per IP)
- `/api/graphql`: 100 requests/minute (token bucket, allows bursts)
- `/api/*` (general): 300 requests/minute (per IP)
- `/admin/*`: 60 requests/minute (per authenticated user)

## Security Considerations

### Secrets Management

**Environment Variables**:

- Store all secrets in Vercel environment variables (never in git)
- Use different secrets for preview vs production environments
- Rotate PAYLOAD_SECRET quarterly (coordinate with team)

**Secret Rotation**:

```bash
# Generate new secret
openssl rand -base64 32

# Update in Vercel dashboard
# Vercel → Project → Settings → Environment Variables → Edit PAYLOAD_SECRET

# Redeploy application (new secret takes effect)
```

**Git Security**:

```bash
# Before committing, verify no secrets in diff
git diff

# Check for accidentally committed secrets
git log -p | grep -i "secret\|password\|token"

# If secret committed, rotate immediately and rewrite git history
```

### HTTPS

**Automatic SSL**:

- All Vercel deployments use HTTPS automatically
- Custom domains get free SSL certificates (Let's Encrypt)
- Certificates auto-renew

**Forced HTTPS**:

Security headers in `next.config.ts` enforce HTTPS:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ]
}
```

### Content Security Policy (CSP)

**Current Headers**:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing attacks
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer leakage
- `X-XSS-Protection: 1; mode=block` - Enables XSS filter
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Disables unnecessary permissions

**Future Enhancement**: Add full CSP header for stricter security.

### Rate Limiting Security

**Protection Against**:

- Brute force attacks on `/api/users/login`
- Password reset abuse on `/api/users/forgot-password`
- API scraping and DoS attacks
- GraphQL query complexity attacks

**Implementation**: See `docs/rate-limiting-strategy.md` for complete strategy.

**Upstash Required**: For production rate limiting to work across distributed edge functions, Upstash Redis MUST be configured. Without it, rate limiting falls back to in-memory (per-function instance), which is ineffective.

### Authentication

**Payload CMS Authentication**:

- Admin routes (`/admin/*`) require authentication
- Uses JWT tokens stored in HTTP-only cookies
- Session timeout: 7 days (configurable)

**API Authentication**:

- Public API routes (read-only): No authentication required
- Admin API routes (write): Require valid JWT token
- GraphQL endpoint: Supports both public and authenticated queries

### CORS (Cross-Origin Resource Sharing)

**Current Setup**: CORS is handled by Next.js and Payload CMS defaults.

**Custom Domains**: If adding custom domain, verify CORS configuration allows requests from new domain.

## Cost Management

### Current Usage

**Vercel Free Tier**:

- 100GB bandwidth/month
- 100 hours serverless function execution
- 6,000 build minutes/month
- Unlimited deployments
- Automatic SSL

**Supabase Free Tier**:

- 500MB database storage
- 1GB bandwidth/month
- Unlimited API requests
- 2 CPU cores
- 1GB RAM

**Upstash Free Tier** (if configured):

- 10,000 Redis commands/day
- 256MB storage
- Global replication

### Monitoring Usage

**Vercel**:

1. Navigate to Vercel Dashboard → Settings → Usage
2. View bandwidth, function execution, build minutes
3. Set up usage alerts when approaching limits

**Supabase**:

1. Navigate to Supabase Dashboard → Settings → Usage
2. View database size, bandwidth, active connections
3. Upgrade to Pro plan if exceeding limits ($25/month)

**Upstash**:

1. Navigate to Upstash Console → Database → Analytics
2. View daily command usage, storage size
3. Upgrade to pay-as-you-go if exceeding 10K commands/day

### Optimization Strategies

**Stay Within Free Tier**:

1. **ISR Caching**: Post pages use ISR with 60-second revalidation (reduces function calls by ~80%)
2. **Image Optimization**: Next.js Image component converts to WebP/AVIF (reduces bandwidth)
3. **Server Components**: Most components are Server Components (reduces client-side JavaScript)
4. **Rate Limiting**: Prevents abuse and excessive API calls (with Upstash)
5. **Bundle Size**: React Compiler and package optimization keeps bundle small

**Expected Costs** (current traffic):

- **Vercel**: $0/month (within free tier)
- **Supabase**: $0/month (within free tier)
- **Upstash**: $0/month (within free tier, ~5K commands/day)

**Projected Costs** (10x traffic):

- **Vercel**: $0/month (still within free tier, ISR caching is effective)
- **Supabase**: $0/month (still within free tier)
- **Upstash**: ~$3/month (50K commands/day with ephemeral cache)

### Cost Alerts

**Set Up Budget Alerts**:

1. Vercel: Dashboard → Settings → Usage → Configure alerts
2. Supabase: Dashboard → Settings → Billing → Set spending limit
3. Upstash: Console → Billing → Set budget alerts

**Recommended Thresholds**:

- Alert at 80% of free tier limits
- Hard limit at 100% (prevent overages)

## Future Enhancements

### Deployment

- [ ] Set up staging environment (separate Vercel project)
- [ ] Implement automated E2E tests in CI/CD pipeline
- [ ] Add pre-deployment smoke tests
- [ ] Configure blue-green deployment strategy
- [ ] Implement canary releases for gradual rollouts

### Monitoring

- [ ] Add Sentry for error tracking and performance monitoring
- [ ] Set up custom error pages with error IDs (already have error-ids.ts)
- [ ] Implement structured logging with correlation IDs
- [ ] Add uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create operational dashboard with key metrics

### Database

- [ ] Implement automated database backups (Supabase daily backups are automatic)
- [ ] Set up read replicas for improved performance (Supabase Pro plan)
- [ ] Add database query monitoring and slow query alerts
- [ ] Implement connection pool metrics

### Performance

- [ ] Add bundle size analysis in CI/CD
- [ ] Implement performance budgets with enforcement
- [ ] Add skeleton loaders for improved perceived performance
- [ ] Implement service worker for offline support
- [ ] Add resource hints (preload, prefetch, preconnect)

### Security

- [ ] Implement full Content Security Policy header
- [ ] Add HSTS header for HTTPS enforcement
- [ ] Set up security scanning in CI/CD (Snyk, Dependabot)
- [ ] Implement API authentication with API keys (future feature)
- [ ] Add DDoS protection monitoring

### Custom Domain

- [ ] Register custom domain (e.g., detachednode.com)
- [ ] Configure DNS with Vercel
- [ ] Update NEXT_PUBLIC_SERVER_URL to custom domain
- [ ] Set up email forwarding for contact@detachednode.com

### Documentation

- [ ] Create runbooks for common operational tasks
- [ ] Document disaster recovery procedures
- [ ] Create architecture diagrams (system, deployment, data flow)
- [ ] Write incident response playbook
- [ ] Document on-call procedures (if team grows)

## Resources

**Vercel Documentation**:

- [Deployment](https://vercel.com/docs/deployments/overview)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Functions](https://vercel.com/docs/functions)
- [Edge Network](https://vercel.com/docs/edge-network/overview)

**Payload CMS Documentation**:

- [Production Deployment](https://payloadcms.com/docs/production/deployment)
- [Database Configuration](https://payloadcms.com/docs/database/overview)
- [Migrations](https://payloadcms.com/docs/database/migrations)

**Supabase Documentation**:

- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Performance Tuning](https://supabase.com/docs/guides/database/performance)

**Upstash Documentation**:

- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- [Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)

**Next.js Documentation**:

- [Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)

**Project-Specific Documentation**:

- [Performance Targets](./performance-targets.md)
- [Rate Limiting Strategy](./rate-limiting-strategy.md)
- [Design System](./design-system.md)

---

**Document Version**: 1.1
**Last Updated**: 2026-04-22
**Maintained By**: Backend Development Agent
**Linear Issue**: CON-113
