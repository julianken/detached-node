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
    console.error('❌ Authentication setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
