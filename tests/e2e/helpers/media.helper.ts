import { Page, Locator } from '@playwright/test'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * Helper functions for uploading and managing media in Payload CMS
 */

/**
 * Uploads a media file through the Payload file upload field
 *
 * @param page - Playwright page instance
 * @param filePath - Absolute path to the file to upload
 * @param fieldName - Optional field name to target specific upload field
 */
export async function uploadMedia(page: Page, filePath: string, fieldName?: string) {
  let fileInput: Locator

  if (fieldName) {
    // Target specific upload field
    const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
    fileInput = fieldContainer.locator('input[type="file"]')
  } else {
    // Target first available file input
    fileInput = page.locator('input[type="file"]').first()
  }

  // Set input files
  await fileInput.setInputFiles(filePath)

  // Wait for upload to complete
  // Payload shows upload progress and thumbnail
  await page.waitForSelector('.upload-thumbnail, [class*="thumbnail"], [class*="preview"]', {
    state: 'visible',
    timeout: 10000,
  })

  // Additional wait for processing
  await page.waitForTimeout(500)
}

/**
 * Uploads multiple media files at once
 *
 * @param page - Playwright page instance
 * @param filePaths - Array of absolute paths to files
 * @param fieldName - Optional field name to target specific upload field
 */
export async function uploadMultipleMedia(page: Page, filePaths: string[], fieldName?: string) {
  let fileInput: Locator

  if (fieldName) {
    const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
    fileInput = fieldContainer.locator('input[type="file"]')
  } else {
    fileInput = page.locator('input[type="file"]').first()
  }

  // Set multiple files
  await fileInput.setInputFiles(filePaths)

  // Wait for all uploads to complete
  await page.waitForTimeout(1000)
}

/**
 * Removes an uploaded media file
 *
 * @param page - Playwright page instance
 * @param fieldName - Optional field name to target specific field
 */
export async function removeMedia(page: Page, fieldName?: string) {
  let removeButton: Locator

  if (fieldName) {
    const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
    removeButton = fieldContainer.getByRole('button', { name: /remove|delete|clear/i })
  } else {
    removeButton = page.getByRole('button', { name: /remove|delete|clear/i }).first()
  }

  await removeButton.click()

  // Confirm deletion if there's a confirmation dialog
  const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i })
  if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmButton.click()
  }
}

/**
 * Creates a test image file for upload testing
 * This generates a simple PNG in the system temp directory
 *
 * @param filename - Name for the test file (e.g., 'test-image.png')
 * @returns Absolute path to the created file
 */
export async function createTestImage(filename: string = 'test-image.png'): Promise<string> {

  // Simple 1x1 red PNG in base64
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  )

  const filePath = path.join(os.tmpdir(), filename)
  fs.writeFileSync(filePath, pngData)

  return filePath
}

/**
 * Checks if a media field has an uploaded file
 *
 * @param page - Playwright page instance
 * @param fieldName - Optional field name to target specific field
 * @returns true if media is present
 */
export async function hasMedia(page: Page, fieldName?: string): Promise<boolean> {
  let thumbnail: Locator

  if (fieldName) {
    const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
    thumbnail = fieldContainer.locator('.upload-thumbnail, [class*="thumbnail"], [class*="preview"]')
  } else {
    thumbnail = page.locator('.upload-thumbnail, [class*="thumbnail"], [class*="preview"]').first()
  }

  return await thumbnail.isVisible({ timeout: 1000 }).catch(() => false)
}
