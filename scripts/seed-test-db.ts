/**
 * Seed script for test database
 * Run with: pnpm seed:test
 *
 * Creates predictable test data for E2E testing.
 * Can be run multiple times - clears and reseeds on each run.
 */
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env.local FIRST
dotenv.config({ path: '.env.local' })

async function seedTestDatabase() {
  console.log('🌱 Starting test database seed...')

  // Dynamic import to ensure env vars are loaded first
  const { getPayload } = await import('payload')
  const configModule = await import('../src/payload.config.js')
  const config = configModule.default

  const payload = await getPayload({ config })

  // Clear existing test data
  console.log('🧹 Clearing existing data...')
  await payload.delete({ collection: 'listings', where: {} })
  await payload.delete({ collection: 'posts', where: {} })
  await payload.delete({ collection: 'pages', where: {} })
  await payload.delete({ collection: 'media', where: {} })
  await payload.delete({ collection: 'tags', where: {} })
  await payload.delete({ collection: 'users', where: {} })
  console.log('✓ Data cleared')

  // 1. Create test admin user
  console.log('👤 Creating test admin user...')
  const testUser = await payload.create({
    collection: 'users',
    data: {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test Admin',
    },
  })
  console.log('✓ Test admin created: test@example.com')

  // 2. Create tags
  console.log('🏷️  Creating tags...')
  const propagandaTag = await payload.create({
    collection: 'tags',
    data: {
      name: 'Propaganda',
      slug: 'propaganda',
      description: 'Analysis of propaganda techniques and their effects',
    },
  })

  const technologyTag = await payload.create({
    collection: 'tags',
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Technology as a medium for influence and control',
    },
  })

  const cultureTag = await payload.create({
    collection: 'tags',
    data: {
      name: 'Culture',
      slug: 'culture',
      description: 'Cultural patterns and conditioning mechanisms',
    },
  })
  console.log('✓ Created 3 tags')

  // 3. Create test media
  console.log('📷 Creating test media...')

  // Create a simple test image (1x1 transparent PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  )

  const testImagePath = path.join(process.cwd(), 'scripts', 'test-image.png')
  fs.writeFileSync(testImagePath, testImageBuffer)

  const mediaItem1 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Test featured image 1',
      caption: 'A test image for featured posts',
    },
    filePath: testImagePath,
  })

  const mediaItem2 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Test featured image 2',
      caption: 'Another test image',
    },
    filePath: testImagePath,
  })

  // Clean up temporary file
  fs.unlinkSync(testImagePath)

  console.log('✓ Created 2 test media items')

  // Helper to create Lexical rich text content
  const createRichText = (text: string) => ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              mode: 'normal',
              text,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          textStyle: '',
          textFormat: 0,
        },
      ],
      direction: 'ltr',
    },
  })

  // 4. Create posts (6 total)
  console.log('📝 Creating posts...')

  // Post 1: Featured + Published Essay
  const post1 = await payload.create({
    collection: 'posts',
    data: {
      title: 'The Architecture of Persuasion',
      slug: 'architecture-of-persuasion',
      type: 'essay',
      summary: 'An exploration of how modern persuasion techniques shape beliefs and behaviors at scale. This essay examines the structural elements.',
      featuredImage: mediaItem1.id,
      body: createRichText(
        'Understanding the architecture of persuasion requires examining both the explicit techniques and the implicit frameworks that shape how messages are received and processed.'
      ),
      tags: [propagandaTag.id, cultureTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-15').toISOString(),
      featured: true,
    },
  })

  // Post 2: Featured + Published Decoder
  const post2 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Decoding Corporate Newspeak',
      slug: 'decoding-corporate-newspeak',
      type: 'decoder',
      summary: 'A systematic breakdown of corporate language patterns designed to obscure reality and manufacture consent within organizational contexts.',
      featuredImage: mediaItem2.id,
      body: createRichText(
        'Corporate newspeak transforms clear concepts into abstraction: employees become "human capital," layoffs become "rightsizing," and surveillance becomes "performance optimization."'
      ),
      tags: [propagandaTag.id, technologyTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-20').toISOString(),
      featured: true,
    },
  })

  // Post 3: Featured + Published Field Report
  const post3 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Notes from the Attention Economy',
      slug: 'notes-attention-economy',
      type: 'field-report',
      summary: 'Field observations on how attention has become the primary resource extracted, commodified, and traded in digital environments.',
      featuredImage: mediaItem1.id,
      body: createRichText(
        'The attention economy operates on principles fundamentally different from traditional markets. Time, focus, and cognitive capacity are the currencies being traded.'
      ),
      tags: [technologyTag.id, cultureTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-25').toISOString(),
      featured: true,
    },
  })

  // Post 4: Published Index (not featured)
  const post4 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Essential Readings on Mind Control',
      slug: 'essential-readings-mind-control',
      type: 'index',
      summary: 'A curated collection of foundational texts examining propaganda, conditioning, and persuasion from multiple disciplinary perspectives.',
      body: createRichText(
        'This index compiles key works from sociology, psychology, media studies, and critical theory that illuminate mechanisms of influence and control.'
      ),
      references: [
        {
          title: 'Propaganda: The Formation of Men\'s Attitudes',
          author: 'Jacques Ellul',
          publication: 'Vintage Books',
          date: '1965-01-01',
        },
        {
          title: 'Manufacturing Consent',
          author: 'Noam Chomsky and Edward S. Herman',
          publication: 'Pantheon Books',
          date: '1988-01-01',
        },
      ],
      tags: [propagandaTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-10').toISOString(),
      featured: false,
    },
  })

  // Post 5: Draft Essay
  const post5 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Unpublished Thoughts on Conditioning',
      slug: 'unpublished-thoughts-conditioning',
      type: 'essay',
      summary: 'Early draft exploring behavioral conditioning mechanisms in contemporary society. Still in development and not ready for publication.',
      body: createRichText(
        'This is a work in progress examining how subtle environmental cues shape behavior without conscious awareness.'
      ),
      tags: [cultureTag.id],
      status: 'draft',
      featured: false,
    },
  })

  // Post 6: Archived Essay
  const post6 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Legacy Post About Old Propaganda',
      slug: 'legacy-post-old-propaganda',
      type: 'essay',
      summary: 'Historical analysis of propaganda techniques from the Cold War era. Archived for reference but no longer actively maintained.',
      body: createRichText(
        'This archived post examines propaganda methods that, while dated in some respects, reveal patterns still present in modern influence campaigns.'
      ),
      tags: [propagandaTag.id],
      status: 'archived',
      publishedAt: new Date('2025-12-01').toISOString(),
      featured: false,
    },
  })

  console.log('✓ Created 6 posts')

  // 5. Create About page
  console.log('📄 Creating About page...')
  await payload.create({
    collection: 'pages',
    data: {
      title: 'About Mind-Controlled',
      slug: 'about',
      description: 'Learn about the purpose and perspective behind Mind-Controlled',
      body: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  mode: 'normal',
                  text: 'Mind-Controlled explores the mechanics of propaganda, conditioning, and persuasion in modern society.',
                  type: 'text',
                  style: '',
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              textStyle: '',
              textFormat: 0,
            },
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  mode: 'normal',
                  text: 'This is a space for critical analysis of how ideas spread and take hold—not to promote cynicism, but to cultivate discernment.',
                  type: 'text',
                  style: '',
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              textStyle: '',
              textFormat: 0,
            },
          ],
          direction: 'ltr',
        },
      },
      status: 'published',
    },
  })
  console.log('✓ Created About page')

  // 6. Create listing
  console.log('📋 Creating listing...')
  await payload.create({
    collection: 'listings',
    data: {
      title: 'Featured Essays',
      slug: 'featured-essays',
      description: 'A curated collection of featured essays on propaganda and persuasion',
      featuredImage: mediaItem1.id,
      items: [post1.id, post2.id, post3.id],
      status: 'published',
    },
  })
  console.log('✓ Created listing with 3 posts')

  console.log('\n✅ Test database seed complete!')
  console.log('\nTest Data Summary:')
  console.log('  • 1 test admin user (test@example.com / testpassword123)')
  console.log('  • 3 tags (Propaganda, Technology, Culture)')
  console.log('  • 2 media items')
  console.log('  • 6 posts (3 featured+published, 1 published, 1 draft, 1 archived)')
  console.log('  • 1 page (About)')
  console.log('  • 1 listing (Featured Essays)')

  process.exit(0)
}

seedTestDatabase().catch((err) => {
  console.error('❌ Seed error:', err)
  process.exit(1)
})
