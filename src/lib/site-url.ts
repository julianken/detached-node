import { assertRequiredEnv } from './env/required-env'

const env = assertRequiredEnv(['NEXT_PUBLIC_SERVER_URL'] as const)

export const siteUrl: string = env.NEXT_PUBLIC_SERVER_URL
