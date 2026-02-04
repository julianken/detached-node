'use client'

/**
 * Test page that intentionally throws an error
 * Used for E2E testing of the error boundary
 *
 * This page should only be available in development/test environments
 */
export default function TestErrorPage() {
  // Throw an error during render to trigger the error boundary
  if (typeof window !== 'undefined') {
    throw new Error('Intentional error for testing error boundary')
  }

  return null
}
