import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const email = process.argv[2] ?? 'admin@detached-node.dev'
const password = process.argv[3] ?? 'checkpoint-smoke-2026'

const payload = await getPayload({ config })
const users = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (!users.docs.length) {
  console.error(`no user with email=${email}`)
  process.exit(1)
}
await payload.update({ collection: 'users', id: users.docs[0].id, data: { password } })
console.log(`updated password for ${email}`)
process.exit(0)
