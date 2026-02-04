/**
 * Playwright Global Setup
 * Runs once before all tests to seed the test database
 */
import { execSync } from 'child_process'

async function globalSetup() {
  console.log('🌱 Running test database seed...')

  try {
    // Run the seed script synchronously to ensure it completes before tests start
    execSync('pnpm seed:test', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    console.log('✅ Test database seeded successfully')
  } catch (error) {
    console.error('❌ Failed to seed test database:', error)
    throw error
  }
}

export default globalSetup
