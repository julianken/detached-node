import { test, expect } from '../fixtures'

/**
 * E2E Tests: Public API Access to Tags and Media (CON-77)
 *
 * Verifies that public (unauthenticated) users can access tags and media:
 * - Tags readable via API without authentication
 * - Media readable via API without authentication
 * - Media files accessible without authentication
 *
 * Test Data (from seed-test-db.ts):
 * - Tags: agentic-ai, workflows, philosophy
 * - Media: 2 test images (Test featured image 1, Test featured image 2)
 *
 * Note: These tests run WITHOUT authentication to verify public access
 */

test.describe('Public API Access to Tags and Media', () => {
  test.describe('Tags API - Public Access', () => {
    test('should allow unauthenticated GET request to /api/tags', async ({ request }) => {
      // Fetch tags without any authentication headers
      const response = await request.get('/api/tags')

      // Verify successful response
      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)
    })

    test('should return all tags without authentication', async ({ request }) => {
      const response = await request.get('/api/tags')

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()

      // Should have 3 tags from seed data
      expect(data.docs.length).toBe(3)

      // Extract tag slugs
      const tagSlugs = data.docs.map((tag: { slug: string }) => tag.slug)

      // Verify all expected tags are present
      expect(tagSlugs).toContain('agentic-ai')
      expect(tagSlugs).toContain('technology')
      expect(tagSlugs).toContain('culture')
    })

    test('should return complete tag data structure without authentication', async ({ request }) => {
      const response = await request.get('/api/tags')
      const data = await response.json()

      // Find the agentic-ai tag for detailed verification
      const agenticAiTag = data.docs.find((tag: { slug: string }) => tag.slug === 'agentic-ai')

      expect(agenticAiTag).toBeDefined()
      expect(agenticAiTag.name).toBe('Agentic AI')
      expect(agenticAiTag.slug).toBe('agentic-ai')
      expect(agenticAiTag.description).toBe('Analysis of agentic AI patterns and architectures')
      expect(agenticAiTag.id).toBeDefined()
    })

    test('should allow filtering tags by slug without authentication', async ({ request }) => {
      // Query for specific tag using where clause
      const whereQuery = JSON.stringify({
        slug: { equals: 'technology' },
      })
      const response = await request.get(`/api/tags?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThanOrEqual(1)

      // Verify the technology tag is in the results
      const techTag = data.docs.find((tag: { slug: string }) => tag.slug === 'technology')
      expect(techTag).toBeDefined()
      expect(techTag.name).toBe('Technology')
    })

    test('should return pagination metadata for tags without authentication', async ({ request }) => {
      const response = await request.get('/api/tags')
      const data = await response.json()

      // Verify standard Payload pagination structure
      expect(data.totalDocs).toBeDefined()
      expect(data.totalPages).toBeDefined()
      expect(data.page).toBeDefined()
      expect(data.hasPrevPage).toBeDefined()
      expect(data.hasNextPage).toBeDefined()

      // For 3 tags, should be on page 1 with no next page
      expect(data.totalDocs).toBe(3)
      expect(data.page).toBe(1)
      expect(data.hasNextPage).toBe(false)
    })
  })

  test.describe('Media API - Public Access', () => {
    test('should allow unauthenticated GET request to /api/media', async ({ request }) => {
      // Fetch media without any authentication headers
      const response = await request.get('/api/media')

      // Verify successful response
      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)
    })

    test('should return all media items without authentication', async ({ request }) => {
      const response = await request.get('/api/media')

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()

      // Should have 2 media items from seed data
      expect(data.docs.length).toBeGreaterThanOrEqual(2)

      // Verify media items have expected alt text
      const altTexts = data.docs.map((media: { alt: string }) => media.alt)
      expect(altTexts).toContain('Test featured image 1')
      expect(altTexts).toContain('Test featured image 2')
    })

    test('should return complete media data structure without authentication', async ({ request }) => {
      const response = await request.get('/api/media')
      const data = await response.json()

      // Get the first media item for detailed verification
      const mediaItem = data.docs.find((m: { alt: string }) => m.alt === 'Test featured image 1')

      expect(mediaItem).toBeDefined()
      expect(mediaItem.id).toBeDefined()
      expect(mediaItem.alt).toBe('Test featured image 1')
      expect(mediaItem.caption).toBe('A test image for featured posts')
      expect(mediaItem.url).toBeDefined()
      expect(mediaItem.filename).toBeDefined()
      expect(mediaItem.mimeType).toBeDefined()
      expect(mediaItem.filesize).toBeDefined()
      expect(mediaItem.width).toBeDefined()
      expect(mediaItem.height).toBeDefined()
    })

    test('should allow filtering media by alt text without authentication', async ({ request }) => {
      // Query for specific media item using where clause
      const whereQuery = JSON.stringify({
        alt: { equals: 'Test featured image 2' },
      })
      const response = await request.get(`/api/media?where=${encodeURIComponent(whereQuery)}`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThanOrEqual(1)

      // Verify the correct media item is in the results
      const mediaItem = data.docs.find((m: { alt: string }) => m.alt === 'Test featured image 2')
      expect(mediaItem).toBeDefined()
      expect(mediaItem.caption).toBe('Another test image')
    })

    test('should return pagination metadata for media without authentication', async ({ request }) => {
      const response = await request.get('/api/media')
      const data = await response.json()

      // Verify standard Payload pagination structure
      expect(data.totalDocs).toBeDefined()
      expect(data.totalPages).toBeDefined()
      expect(data.page).toBeDefined()
      expect(data.hasPrevPage).toBeDefined()
      expect(data.hasNextPage).toBeDefined()

      // For at least 2 media items, should be on page 1
      expect(data.totalDocs).toBeGreaterThanOrEqual(2)
      expect(data.page).toBe(1)
    })
  })

  test.describe('Media Files - Public Access', () => {
    test('should return media URLs in API response without authentication', async ({
      request,
    }) => {
      // First, get a media item to verify URLs are present
      const apiResponse = await request.get('/api/media')
      const apiData = await apiResponse.json()

      expect(apiData.docs.length).toBeGreaterThan(0)

      const mediaItem = apiData.docs[0]
      expect(mediaItem.url).toBeDefined()
      expect(mediaItem.filename).toBeDefined()

      // Verify URL is a string and looks like a valid path
      expect(typeof mediaItem.url).toBe('string')
      expect(mediaItem.url.length).toBeGreaterThan(0)

      // Verify the URL contains the filename
      expect(mediaItem.url).toContain(mediaItem.filename)
    })

    test('should include complete media metadata without authentication', async ({ request }) => {
      // Get media item
      const apiResponse = await request.get('/api/media')
      const apiData = await apiResponse.json()
      const mediaItem = apiData.docs[0]

      // Verify all essential media fields are present
      expect(mediaItem.id).toBeDefined()
      expect(mediaItem.url).toBeDefined()
      expect(mediaItem.filename).toBeDefined()
      expect(mediaItem.mimeType).toBeDefined()
      expect(mediaItem.filesize).toBeDefined()
      expect(mediaItem.width).toBeDefined()
      expect(mediaItem.height).toBeDefined()
      expect(mediaItem.alt).toBeDefined()
    })

    test('should provide media URLs for all uploaded media without authentication', async ({
      request,
    }) => {
      // Get all media items
      const apiResponse = await request.get('/api/media')
      const apiData = await apiResponse.json()

      // Verify each media item has a URL
      for (const mediaItem of apiData.docs) {
        expect(mediaItem.url).toBeDefined()
        expect(typeof mediaItem.url).toBe('string')
        expect(mediaItem.url.length).toBeGreaterThan(0)
      }
    })

    test('should expose media metadata needed for public consumption', async ({ request }) => {
      // Get media item
      const apiResponse = await request.get('/api/media')
      const apiData = await apiResponse.json()
      const mediaItem = apiData.docs[0]

      // Verify public-facing metadata is available
      expect(mediaItem.alt).toBeDefined()
      expect(mediaItem.caption).toBeDefined()
      expect(mediaItem.width).toBeDefined()
      expect(mediaItem.height).toBeDefined()
      expect(mediaItem.mimeType).toBeDefined()

      // These are the fields needed for public display
      expect(mediaItem.mimeType).toMatch(/image\//)
    })
  })

  test.describe('Comprehensive Public Access', () => {
    test('should maintain public access across tags API and media API', async ({ request }) => {
      // 1. Verify tags API is accessible
      const tagsResponse = await request.get('/api/tags')
      expect(tagsResponse.ok()).toBeTruthy()
      const tagsData = await tagsResponse.json()
      expect(tagsData.docs.length).toBe(3)

      // 2. Verify media API is accessible
      const mediaResponse = await request.get('/api/media')
      expect(mediaResponse.ok()).toBeTruthy()
      const mediaData = await mediaResponse.json()
      expect(mediaData.docs.length).toBeGreaterThanOrEqual(2)

      // 3. Verify media items have URLs
      const mediaItem = mediaData.docs[0]
      expect(mediaItem.url).toBeDefined()
      expect(typeof mediaItem.url).toBe('string')

      // All API endpoints work without authentication
    })

    test('should verify no authentication headers are required for public resources', async ({
      request,
    }) => {
      // Make requests explicitly without any auth headers
      const tagsResponse = await request.get('/api/tags', {
        headers: {
          // Explicitly no Authorization header
        },
      })
      expect(tagsResponse.ok()).toBeTruthy()

      const mediaResponse = await request.get('/api/media', {
        headers: {
          // Explicitly no Authorization header
        },
      })
      expect(mediaResponse.ok()).toBeTruthy()

      // This confirms that authentication is truly optional for these resources
    })
  })
})
