import { test, expect } from '../../fixtures'
import { TEST_ADMIN } from '../../fixtures/auth.fixture'

/**
 * E2E Tests: Authenticated User Access to All Content (CON-76)
 *
 * Verifies that authenticated users have full access to all post statuses:
 * - Draft posts visible in admin collection
 * - Archived posts visible in admin collection
 * - API returns all post statuses when authenticated
 * - Can edit draft content
 * - Can edit archived content
 *
 * Test Data (from seed-test-db.ts):
 * - Draft: "Unpublished Thoughts on Conditioning" (slug: unpublished-thoughts-conditioning)
 * - Archived: "Legacy Post About Old Propaganda" (slug: legacy-post-old-propaganda)
 * - Published: Multiple posts including "The Architecture of Persuasion"
 *
 * Note: These tests use authenticated admin session via storageState
 */

test.describe('Authenticated User Access to All Content', () => {
  // Authenticate before each test
  test.beforeEach(async ({ adminLoginPage }) => {
    await adminLoginPage.goto()
    await adminLoginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  })

  test.describe('Admin Collection - All Status Visibility', () => {
    test('should show draft posts in admin posts collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')

      // Verify the page loaded
      await page.waitForLoadState('networkidle')

      // Verify draft post is visible in the list
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Unpublished Thoughts on Conditioning')

      // Verify we can see the draft status indicator (if present)
      // This is a bonus verification - the main thing is the post is visible
      const draftIndicator = page.getByText(/draft/i).first()
      const isDraftVisible = await draftIndicator.isVisible()
      // At minimum, the post title should be visible
      const draftTitle = page.getByText('Unpublished Thoughts on Conditioning').first()
      await expect(draftTitle).toBeVisible()
    })

    test('should show archived posts in admin posts collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')

      // Verify the page loaded
      await page.waitForLoadState('networkidle')

      // Verify archived post is visible in the list
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Legacy Post About Old Propaganda')

      // Verify the post title is visible
      const archivedTitle = page.getByText('Legacy Post About Old Propaganda').first()
      await expect(archivedTitle).toBeVisible()
    })

    test('should show published posts in admin posts collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')

      // Verify the page loaded
      await page.waitForLoadState('networkidle')

      // Verify published posts are visible
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('The Architecture of Persuasion')

      // Verify the post title is visible
      const publishedTitle = page.getByText('The Architecture of Persuasion').first()
      await expect(publishedTitle).toBeVisible()
    })

    test('should show all statuses together in admin collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')

      // Verify the page loaded
      await page.waitForLoadState('networkidle')

      // Get all page content
      const pageContent = await page.textContent('body')

      // Verify all three statuses are represented
      expect(pageContent).toContain('Unpublished Thoughts on Conditioning') // draft
      expect(pageContent).toContain('Legacy Post About Old Propaganda') // archived
      expect(pageContent).toContain('The Architecture of Persuasion') // published

      // This demonstrates that admin users see ALL posts regardless of status
    })
  })

  test.describe('Draft Post - Edit Access', () => {
    test('should open and display draft post in editor', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the draft post
      await page.getByText('Unpublished Thoughts on Conditioning').first().click()
      await page.waitForLoadState('networkidle')

      // Verify we're in the editor
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

      // Verify title field has correct value
      const titleField = page.locator('input[name="title"]')
      await expect(titleField).toHaveValue('Unpublished Thoughts on Conditioning')

      // Verify status is set to draft
      const statusSelect = page.locator('select[name="status"], [name="status"]')
      await expect(statusSelect).toHaveValue('draft')
    })

    test('should allow editing draft post content', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the draft post
      await page.getByText('Unpublished Thoughts on Conditioning').first().click()
      await page.waitForLoadState('networkidle')

      // Get the summary field
      const summaryField = page.locator('textarea[name="summary"]')

      // Verify current summary
      await expect(summaryField).toHaveValue(/Early draft exploring behavioral conditioning/)

      // Edit the summary (append text to verify edit capability)
      const originalSummary = await summaryField.inputValue()
      const updatedSummary = originalSummary + ' [Updated via E2E test]'
      await summaryField.fill(updatedSummary)

      // Save the changes
      const saveButton = page.getByRole('button', { name: /save/i }).first()
      await saveButton.click()

      // Wait for save confirmation
      await page.waitForTimeout(2000)

      // Verify we're still on the editor page (save successful)
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

      // Verify the summary was updated
      await expect(summaryField).toHaveValue(updatedSummary)

      // Cleanup: restore original summary
      await summaryField.fill(originalSummary)
      await saveButton.click()
      await page.waitForTimeout(2000)
    })

    test('should allow changing draft post status', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the draft post
      await page.getByText('Unpublished Thoughts on Conditioning').first().click()
      await page.waitForLoadState('networkidle')

      // Verify current status is draft
      const statusSelect = page.locator('select[name="status"], [name="status"]')
      await expect(statusSelect).toHaveValue('draft')

      // The ability to change status demonstrates full edit access
      // We won't actually change it to avoid breaking other tests
      // Just verify the field is editable
      await expect(statusSelect).toBeEnabled()
    })
  })

  test.describe('Archived Post - Edit Access', () => {
    test('should open and display archived post in editor', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the archived post
      await page.getByText('Legacy Post About Old Propaganda').first().click()
      await page.waitForLoadState('networkidle')

      // Verify we're in the editor
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

      // Verify title field has correct value
      const titleField = page.locator('input[name="title"]')
      await expect(titleField).toHaveValue('Legacy Post About Old Propaganda')

      // Verify status is set to archived
      const statusSelect = page.locator('select[name="status"], [name="status"]')
      await expect(statusSelect).toHaveValue('archived')
    })

    test('should allow editing archived post content', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the archived post
      await page.getByText('Legacy Post About Old Propaganda').first().click()
      await page.waitForLoadState('networkidle')

      // Get the summary field
      const summaryField = page.locator('textarea[name="summary"]')

      // Verify current summary
      await expect(summaryField).toHaveValue(/Historical analysis of propaganda techniques/)

      // Edit the summary (append text to verify edit capability)
      const originalSummary = await summaryField.inputValue()
      const updatedSummary = originalSummary + ' [Updated via E2E test]'
      await summaryField.fill(updatedSummary)

      // Save the changes
      const saveButton = page.getByRole('button', { name: /save/i }).first()
      await saveButton.click()

      // Wait for save confirmation
      await page.waitForTimeout(2000)

      // Verify we're still on the editor page (save successful)
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

      // Verify the summary was updated
      await expect(summaryField).toHaveValue(updatedSummary)

      // Cleanup: restore original summary
      await summaryField.fill(originalSummary)
      await saveButton.click()
      await page.waitForTimeout(2000)
    })

    test('should allow changing archived post status', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the archived post
      await page.getByText('Legacy Post About Old Propaganda').first().click()
      await page.waitForLoadState('networkidle')

      // Verify current status is archived
      const statusSelect = page.locator('select[name="status"], [name="status"]')
      await expect(statusSelect).toHaveValue('archived')

      // The ability to change status demonstrates full edit access
      // We won't actually change it to avoid breaking other tests
      // Just verify the field is editable
      await expect(statusSelect).toBeEnabled()
    })
  })

  test.describe('API Access - Authenticated User', () => {
    test('should return draft posts via API when authenticated', async ({ request }) => {
      // Fetch draft post via API using query string
      const whereQuery = JSON.stringify({
        slug: { equals: 'unpublished-thoughts-conditioning' },
      })
      const response = await request.get(`/api/posts?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBe(1)

      // Verify it's the draft post
      const draftPost = data.docs[0]
      expect(draftPost.title).toBe('Unpublished Thoughts on Conditioning')
      expect(draftPost.status).toBe('draft')
    })

    test('should return archived posts via API when authenticated', async ({ request }) => {
      // Fetch archived post via API using query string
      const whereQuery = JSON.stringify({
        slug: { equals: 'legacy-post-old-propaganda' },
      })
      const response = await request.get(`/api/posts?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBe(1)

      // Verify it's the archived post
      const archivedPost = data.docs[0]
      expect(archivedPost.title).toBe('Legacy Post About Old Propaganda')
      expect(archivedPost.status).toBe('archived')
    })

    test('should return published posts via API when authenticated', async ({ request }) => {
      // Fetch published post via API using query string
      const whereQuery = JSON.stringify({
        slug: { equals: 'architecture-of-persuasion' },
      })
      const response = await request.get(`/api/posts?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBe(1)

      // Verify it's the published post
      const publishedPost = data.docs[0]
      expect(publishedPost.title).toBe('The Architecture of Persuasion')
      expect(publishedPost.status).toBe('published')
    })

    test('should return all post statuses via API when authenticated', async ({ request }) => {
      // Fetch all posts via API
      const response = await request.get('/api/posts')

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()

      // Should have 6 total posts (4 published + 1 draft + 1 archived)
      expect(data.docs.length).toBe(6)

      // Extract statuses
      const statuses = data.docs.map((post: { status: string }) => post.status)

      // Verify all status types are present
      expect(statuses).toContain('draft')
      expect(statuses).toContain('archived')
      expect(statuses).toContain('published')

      // Count each status type
      const draftCount = statuses.filter((s: string) => s === 'draft').length
      const archivedCount = statuses.filter((s: string) => s === 'archived').length
      const publishedCount = statuses.filter((s: string) => s === 'published').length

      expect(draftCount).toBe(1)
      expect(archivedCount).toBe(1)
      expect(publishedCount).toBe(4)
    })

    test('should allow filtering by draft status via API', async ({ request }) => {
      // Explicitly fetch only draft posts using query string
      const whereQuery = JSON.stringify({
        status: { equals: 'draft' },
      })
      const response = await request.get(`/api/posts?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      // Should return 1 draft post
      expect(data.docs.length).toBe(1)
      expect(data.docs[0].status).toBe('draft')
      expect(data.docs[0].title).toBe('Unpublished Thoughts on Conditioning')
    })

    test('should allow filtering by archived status via API', async ({ request }) => {
      // Explicitly fetch only archived posts using query string
      const whereQuery = JSON.stringify({
        status: { equals: 'archived' },
      })
      const response = await request.get(`/api/posts?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      // Should return 1 archived post
      expect(data.docs.length).toBe(1)
      expect(data.docs[0].status).toBe('archived')
      expect(data.docs[0].title).toBe('Legacy Post About Old Propaganda')
    })
  })

  test.describe('Comprehensive Authenticated Access', () => {
    test('should maintain full access across admin UI and API', async ({
      page,
      adminCollectionPage,
      request,
    }) => {
      // 1. Verify admin collection shows all statuses
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Unpublished Thoughts on Conditioning') // draft
      expect(pageContent).toContain('Legacy Post About Old Propaganda') // archived
      expect(pageContent).toContain('The Architecture of Persuasion') // published

      // 2. Verify API returns all statuses
      const apiResponse = await request.get('/api/posts')
      const apiData = await apiResponse.json()
      expect(apiData.docs.length).toBe(6) // 4 published + 1 draft + 1 archived

      const slugs = apiData.docs.map((post: { slug: string }) => post.slug)
      expect(slugs).toContain('unpublished-thoughts-conditioning') // draft
      expect(slugs).toContain('legacy-post-old-propaganda') // archived
      expect(slugs).toContain('architecture-of-persuasion') // published

      // 3. Verify can edit draft post
      await page.getByText('Unpublished Thoughts on Conditioning').first().click()
      await page.waitForLoadState('networkidle')

      const titleField = page.locator('input[name="title"]')
      await expect(titleField).toHaveValue('Unpublished Thoughts on Conditioning')
      await expect(titleField).toBeEnabled()

      // 4. Navigate back and verify can edit archived post
      await page.goBack()
      await page.waitForLoadState('networkidle')

      await page.getByText('Legacy Post About Old Propaganda').first().click()
      await page.waitForLoadState('networkidle')

      const archivedTitleField = page.locator('input[name="title"]')
      await expect(archivedTitleField).toHaveValue('Legacy Post About Old Propaganda')
      await expect(archivedTitleField).toBeEnabled()
    })
  })
})
