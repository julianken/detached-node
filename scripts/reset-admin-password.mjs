import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

function assertNonProductionDatabase() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL is not set')
  let host
  try {
    host = new URL(raw).hostname
  } catch {
    throw new Error('DATABASE_URL is not a valid URL')
  }
  const allowed = /^(localhost|127\.0\.0\.1|::1)$/.test(host) || /(^|[-.])test([-.]|$)/.test(host)
  if (!allowed) {
    throw new Error(
      `reset-admin-password refuses to run against host ${host}. This script rewrites a ` +
        `user's password. Point DATABASE_URL at a local or test-tier database (hostname must ` +
        `be localhost/127.0.0.1/::1 or contain a "test" segment), or set ` +
        `I_KNOW_THIS_IS_NOT_PROD=1 to override.`,
    )
  }
}

if (process.env.I_KNOW_THIS_IS_NOT_PROD !== '1') assertNonProductionDatabase()

const email = process.argv[2] ?? 'admin@detached-node.dev'
const password = process.argv[3]
if (!password) {
  console.error('usage: node scripts/reset-admin-password.mjs <email> <password>')
  process.exit(2)
}

const host = new URL(process.env.DATABASE_URL).hostname
console.log(`resetting password for ${email} on db host=${host}`)

const payload = await getPayload({ config })
const users = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (!users.docs.length) {
  console.error(`no user with email=${email}`)
  process.exit(1)
}
await payload.update({ collection: 'users', id: users.docs[0].id, data: { password } })
console.log(`updated password for ${email}`)
process.exit(0)
