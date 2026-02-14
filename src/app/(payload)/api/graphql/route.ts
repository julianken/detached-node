import { GRAPHQL_POST, GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'
import config from '@payload-config'

export const POST = GRAPHQL_POST(config)

// Only expose GraphQL Playground in development
export const GET = process.env.NODE_ENV === 'production'
  ? () => new Response('Not Found', { status: 404 })
  : GRAPHQL_PLAYGROUND_GET(config)
