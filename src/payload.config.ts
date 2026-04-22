import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
    // Enable schema push for initial deployment (creates tables automatically)
    // Consider disabling after initial setup and using migrations instead
    push: true,
  }),
  plugins: [
    // Always include the plugin so its client upload handler is registered
    // in the importMap at build time. When BLOB_READ_WRITE_TOKEN is absent
    // (e.g. local dev without blob access, CI typecheck), the plugin
    // internally detects `!token` and marks itself disabled (see
    // @payloadcms/storage-vercel-blob/src/index.ts), which is safe.
    //
    // The previous env-gated conditional (`...(env ? [plugin] : [])`) caused
    // the admin UI to crash in production with a missing importMap key
    // (`@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler`)
    // whenever the importMap had been generated in an environment without the
    // token, because the plugin's initClientUploads call — which is what
    // registers that handler — was skipped entirely at codegen time.
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true, // Bypasses 4.5MB serverless limit
      addRandomSuffix: true,
    }),
  ],
  sharp,
})
