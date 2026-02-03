import { GRAPHQL_POST, GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'
import config from '@payload-config'

export const POST = GRAPHQL_POST(config)
export const GET = GRAPHQL_PLAYGROUND_GET(config)
