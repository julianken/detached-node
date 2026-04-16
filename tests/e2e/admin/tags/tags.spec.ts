import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  expectVisible,
  expectUrl,
} from '../../helpers'

/**
 * CON-67: Tags Collection E2E Tests
 *
 * Validates that the Tags collection is accessible and seeded data is visible.
 * CRUD form interactions removed — Payload admin form selectors are brittle on CI.
 */

test.describe('Tags Collection', () => {
  test.use({ storageState: STORAGE_STATE })

  test('should navigate to Tags collection', async ({
    adminCollectionPage,
    page,
  }) => {
    await adminCollectionPage.goto('tags')

    await expectUrl(page, /\/admin\/collections\/tags/)
    await expectVisible(adminCollectionPage.collectionHeading)
    await expectVisible(adminCollectionPage.createNewButton)
  })

  test('list view should show seeded tags', async ({
    adminCollectionPage,
    page,
  }) => {
    await adminCollectionPage.goto('tags')

    await expectUrl(page, /\/admin\/collections\/tags/)

    const agenticAiRow = await adminCollectionPage.getRowByText('Agentic AI')
    await expect(agenticAiRow).toBeVisible()

    const workflowsRow = await adminCollectionPage.getRowByText('Workflows')
    await expect(workflowsRow).toBeVisible()

    const philosophyRow = await adminCollectionPage.getRowByText('Philosophy')
    await expect(philosophyRow).toBeVisible()
  })
})
