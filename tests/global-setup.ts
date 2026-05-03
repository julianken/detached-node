/**
 * Playwright Global Setup
 * Runs once before all tests to seed the test database and set up authentication
 */
import { execSync } from 'child_process'
import { chromium, FullConfig } from '@playwright/test'
import { setupAuth, STORAGE_STATE } from './e2e/fixtures/auth.fixture'
import fs from 'fs'
import path from 'path'

async function globalSetup(config: FullConfig) {
  // Skip seeding if already done by CI workflow step
  if (!process.env.CI) {
    console.log('🌱 Running test database seed...')
    try {
      execSync('pnpm seed:test', {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
      console.log('✅ Test database seeded successfully')
    } catch (error) {
      // Seed failure is non-fatal: static/public routes (e.g. ADP pattern
      // satellites) are DB-independent and can still be tested even when no
      // local database is available. DB-dependent tests will fail on their own.
      console.warn('⚠️  Seed failed — DB-independent tests (e.g. ADP routes) will still run.', error)
    }
  } else {
    console.log('⏭️  Skipping seed (already done by CI workflow)')
  }

  // Set up authentication
  console.log('🔐 Setting up authentication...')

  // Ensure .auth directory exists
  const authDir = path.dirname(STORAGE_STATE)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL })

  try {
    await setupAuth(page)
    console.log('✅ Authentication setup complete')
  } catch (error) {
    // Auth failure is non-fatal: public routes (e.g. ADP pattern satellites)
    // don't need authentication. Admin-only tests will fail on their own.
    console.warn('⚠️  Authentication setup failed — public-route tests will still run.', error)
  } finally {
    await browser.close()
  }
}

export default globalSetup
