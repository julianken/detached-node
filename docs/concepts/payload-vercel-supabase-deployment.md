# Payload CMS + Vercel + Supabase: Deployment Research

**Status:** Research Complete
**Related:** CON-3 (Linear)
**Last Updated:** 2026-02-02

## Executive Summary

Payload CMS 3.0 works on Vercel's serverless platform, but there are important configuration requirements and limitations to understand. This document covers deployment configuration, database connection pooling, media storage options, authentication setup, and Vercel-specific considerations.

---

## 1. Vercel Deployment Configuration

### Does Payload Work on Vercel Serverless?

**Yes**, Payload 3.0 is designed to work serverlessly. From Payload's documentation:

> "It's all serverless, so you can deploy to Vercel, and it's just going to work right out of the box."

However, there are important caveats (see Cold Start Issues below).

### vercel.json Configuration

For most Payload + Next.js deployments, no `vercel.json` is required. Payload integrates with Next.js App Router, and Vercel handles Next.js projects natively.

**Optional vercel.json for specific needs:**

```json
{
  "functions": {
    "src/app/api/**/*": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/jobs/run",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**When you might need vercel.json:**
- Extending function timeout (default 10s on Hobby, configurable up to 60s)
- Setting up Vercel Cron Jobs for Payload's job queue
- Custom routing or headers

### Cold Start Issues

**This is a real concern.** Key findings:

1. **Relationship-heavy schemas**: If your content model has many relationships, Payload performs multiple simultaneous requests when editing entries. Each request may trigger a cold start, making the admin panel slow.

2. **Database connections**: Each cold start establishes new database connections, which can exhaust connection pools.

3. **Practical impact**: Some teams report working with a local Payload instance connected to the production database to avoid admin panel slowness.

**Mitigations:**
- Enable [Vercel Fluid Compute](https://vercel.com/docs/functions/fluid-compute) - provides near-zero cold starts for 99.37% of requests
- Keep schemas simple (good for Phase 1)
- Use connection pooling (Supavisor) correctly

### Vercel Plan Limitations

| Feature | Hobby | Pro |
|---------|-------|-----|
| Function timeout | 60s (300s with Fluid) | 60s (900s with Fluid) |
| Memory | 2GB (fixed) | Up to 3GB (configurable) |
| Bandwidth | 100 GB/month | 1 TB/month |
| Blob Storage | Available | 10GB included |
| Cron Jobs | Supported | Supported |

**Recommendation:** Start on Hobby for development; Pro recommended for production due to timeout flexibility and bandwidth.

---

## 2. Supabase Connection Pooling (Supavisor)

### Why Pooling Matters

Serverless functions create new database connections on each cold start. Without pooling, you'll quickly hit Postgres connection limits.

### Connection String Types

Supabase provides three connection methods:

| Type | Port | Use Case |
|------|------|----------|
| **Direct** | 5432 | Not recommended for serverless (requires IPv6) |
| **Session Pooler** | 5432 | Persistent connections (not ideal for serverless) |
| **Transaction Pooler** | 6543 | **Recommended for Vercel** |

### Configuration for Payload

**In your `.env` file:**

```bash
# Use Transaction Mode (port 6543) for serverless
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

**Critical: Disable Prepared Statements**

Supavisor transaction mode doesn't support prepared statements. For Payload with Drizzle (the default Postgres adapter), this should work out of the box, but verify your setup.

If using Prisma alongside Payload, add `?pgbouncer=true` to the connection string:

```bash
DATABASE_URL="postgres://...pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Pool Size Recommendations

From Supabase documentation:
- If using PostgREST API: Keep pool at ~40% of max connections
- If not using PostgREST: Can go up to ~80%

For a solo blog on Supabase Free tier:
- Default pool size is fine
- Monitor connections via Supabase Dashboard > Observability

### IPv4 Considerations

Vercel doesn't support IPv6. You have two options:

1. **Use Supavisor pooler** (recommended): The pooler URLs support IPv4
2. **IPv4 Add-on**: $4/month for a dedicated IPv4 address (not needed if using pooler)

---

## 3. Media Storage Options

### Option Comparison

| Storage | Pros | Cons | Cost |
|---------|------|------|------|
| **Vercel Blob** | Native integration, simple setup | 4.5MB server upload limit | $0.023/GB storage, $0.05/GB transfer |
| **Supabase Storage** | Same platform as DB, S3-compatible | Requires S3 adapter config, some reported issues | 1GB free, then $0.021/GB |
| **Cloudinary** | Best image optimization, transformations | Another service to manage | Free tier: 25GB bandwidth |
| **Cloudflare R2** | No egress fees, S3-compatible | Separate Cloudflare account | $0.015/GB storage, free egress |

### Recommended: Vercel Blob

For a solo blog, Vercel Blob is the simplest option:

**Installation:**
```bash
npm install @payloadcms/storage-vercel-blob
```

**Configuration (payload.config.ts):**
```typescript
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  // ... other config
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
```

**Important: Enable Client Uploads**

Due to Vercel's 4.5MB server upload limit, enable client-side uploads:

```typescript
vercelBlobStorage({
  collections: {
    media: {
      clientUploadEnabled: true, // Bypasses 4.5MB limit
    },
  },
  token: process.env.BLOB_READ_WRITE_TOKEN,
})
```

### Alternative: Supabase Storage (S3-Compatible)

If you prefer keeping everything in Supabase:

```bash
npm install @payloadcms/storage-s3
```

```typescript
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT, // Supabase storage endpoint
        forcePathStyle: true, // Required for Supabase
      },
    }),
  ],
})
```

**Note:** Some users have reported challenges with the Supabase S3 integration. Test thoroughly.

---

## 4. Authentication for Solo Admin

### Built-in Local Strategy

Payload's built-in authentication is sufficient for a solo admin. No additional setup required beyond the default Users collection.

**Default behavior:**
- Email/password authentication
- Secure session management
- Password reset via email
- Admin panel access control

### Recommended Setup

1. **Keep the default Users collection** with email/password auth
2. **Create your admin account** on first deploy via `/admin`
3. **Lock down registration** after initial setup:

```typescript
// collections/Users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only existing admins can create new users
    create: ({ req: { user } }) => Boolean(user),
    // Users can only read their own data
    read: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: ['admin'],
      defaultValue: 'admin',
      required: true,
    },
  ],
}
```

### API Keys (Optional)

If you need programmatic access (e.g., for automation):

```typescript
// collections/Users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true, // Enables API key auth
  },
  // ... rest of config
}
```

---

## 5. Production Environment Variables

### Required Variables

```bash
# Core Payload
PAYLOAD_SECRET="your-very-long-random-secret-key-here"
DATABASE_URL="postgres://postgres.[PROJECT]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Optional but recommended
PAYLOAD_CONFIG_PATH="./src/payload.config.ts"
```

### For Vercel Blob Storage

```bash
# Automatically set when you add Blob to your Vercel project
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### For Supabase Storage (if using)

```bash
S3_BUCKET="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_REGION="your-region"
S3_ENDPOINT="https://[PROJECT].supabase.co/storage/v1/s3"
```

### For Email (Password Reset)

```bash
# If using Resend (recommended for simplicity)
RESEND_API_KEY="re_..."

# Or SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user"
SMTP_PASS="pass"
```

### Client-Side Variables

Variables needed at build time must be prefixed:

```bash
NEXT_PUBLIC_SERVER_URL="https://your-domain.vercel.app"
```

### Generating PAYLOAD_SECRET

```bash
openssl rand -base64 32
```

---

## 6. Vercel-Specific Gotchas

### 1. Function Timeout on Hobby Plan

Default is 10 seconds; max is 60 seconds. For Payload admin operations, you may need to increase this:

```typescript
// src/app/api/[...payload]/route.ts
export const maxDuration = 60
```

### 2. File Upload Limit

Server-side uploads are limited to 4.5MB. **Always enable `clientUploads: true`** for media collections.

### 3. Job Queue Doesn't Work Natively

Payload's job queue requires a persistent process. On Vercel:

- Use Vercel Cron Jobs to trigger jobs periodically
- Or use an external queue service (QStash, Inngest)

**Example cron setup for Vercel:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/payload-jobs",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 4. Cold Starts Affect Admin Panel

The admin panel may feel slow on first load. Mitigations:
- Enable Fluid Compute
- Keep content models simple
- Consider a Pro plan for better performance

### 5. Preview Deployments Share Nothing

Each Vercel preview deployment is isolated. For consistent previews, you can share the production database (be careful with writes) or use Supabase branching.

### 6. Environment Variable Naming

Payload templates use `DATABASE_URL`, but some Vercel Postgres templates use `POSTGRES_URL`. Make sure your `payload.config.ts` matches your env var name.

---

## 7. Deployment Checklist

### Before First Deploy

- [ ] Generate a strong `PAYLOAD_SECRET`
- [ ] Set up Supabase project with connection pooler
- [ ] Configure Vercel Blob storage in Vercel dashboard
- [ ] Set all environment variables in Vercel dashboard
- [ ] Enable Fluid Compute in Vercel project settings

### After First Deploy

- [ ] Create admin user at `/admin`
- [ ] Test media uploads (ensure client uploads work)
- [ ] Verify database connections in Supabase dashboard
- [ ] Set up email provider for password reset (if needed)
- [ ] Configure access controls on Users collection

### Monitoring

- [ ] Enable Vercel Analytics
- [ ] Monitor Supabase connection usage
- [ ] Set up error tracking (Sentry, etc.)

---

## 8. Cost Estimates (Solo Blog)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby | $0 |
| Vercel | Pro (recommended) | $20 |
| Supabase | Free | $0 |
| Supabase | Pro (if needed) | $25 |
| Vercel Blob | Included in Pro | ~$0-2 |
| Total (minimal) | | $0 |
| Total (recommended) | | $20-25 |

---

## Sources

- [Payload CMS Deployment Docs](https://payloadcms.com/docs/production/deployment)
- [Payload Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)
- [Payload + Supabase Guide](https://payloadcms.com/posts/guides/setting-up-payload-with-supabase-for-your-nextjs-app-a-step-by-step-guide)
- [Supabase Connection Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [Vercel Blob Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel Cold Start Solutions](https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel)
- [Payload Vercel Template](https://github.com/payloadcms/vercel-deploy-payload-postgres)
- [Supavisor FAQ](https://github.com/orgs/supabase/discussions/21566)
