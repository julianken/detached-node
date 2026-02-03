import { GRAPHQL_HANDLER } from '@payloadcms/next/routes'
import config from '@payload-config'

const handler = GRAPHQL_HANDLER(config)

export { handler as GET, handler as POST }
