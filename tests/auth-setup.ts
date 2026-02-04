/**
 * Authentication Setup for Playwright Tests
 * This runs once before all tests to establish an authenticated admin session
 * The session is saved and reused across all tests for efficiency
 */
import { chromium, FullConfig } from '@playwright/test'
import { setupAuth, STORAGE_STATE } from './e2e/fixtures/auth.fixture'
import fs from 'fs'
import path from 'path'

async function globalSetup(config: FullConfig) {
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
