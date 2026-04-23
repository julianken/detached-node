import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Tags } from './collections/Tags'
import { Posts } from './collections/Posts'
import { Listings } from './collections/Listings'
import { assertRequiredEnv } from './lib/env/required-env'

const env = assertRequiredEnv([
  'PAYLOAD_SECRET',
  'DATABASE_URL',
  'NEXT_PUBLIC_SERVER_URL',
] as const)

// In production runtime, GCS must be configured — otherwise the s3Storage
// plugin silently disables and uploads go to ephemeral Cloud Run disk,
// which vaporizes on the next revision. Skip during `next build` since
// GCS vars are injected at Cloud Run runtime, not baked into the image.
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  assertRequiredEnv([
    'GCS_BUCKET',
    'GCS_HMAC_ACCESS_KEY',
    'GCS_HMAC_SECRET',
  ] as const)
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Tags, Posts, Listings],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
    push: false,
  }),
  plugins: [
    // Always registered so Payload's importMap includes the S3 client upload handler
    // for the admin UI. `enabled` gates the actual storage operations — when GCS is
    // not configured (local dev, E2E tests), uploads fall back to Payload's default
    // local storage without the S3 adapter throwing on empty bucket names.
    s3Storage({
      enabled: Boolean(process.env.GCS_BUCKET),
      collections: { media: { prefix: 'media' } },
      bucket: process.env.GCS_BUCKET ?? '',
      clientUploads: true,
      config: {
        region: 'auto',
        endpoint: 'https://storage.googleapis.com',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.GCS_HMAC_ACCESS_KEY ?? '',
          secretAccessKey: process.env.GCS_HMAC_SECRET ?? '',
        },
      },
    }),
  ],
  sharp,
})
