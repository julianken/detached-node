/**
 * Seed script for initial content
 * Run with: npx tsx scripts/seed.ts
 *
 * Uses Payload Local API to create content directly in the database.
 * Requires DATABASE_URL and PAYLOAD_SECRET environment variables.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  console.log('🌱 Starting seed...')

  const payload = await getPayload({ config })

  // Check if admin user exists
  const { totalDocs: userCount } = await payload.count({ collection: 'users' })

  if (userCount === 0) {
    console.log('Creating admin user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@mind-controlled.com',
        password: 'MindControl2026!',
      },
    })
    console.log('✓ Admin user created: admin@mind-controlled.com')
  } else {
    console.log(`ℹ Admin user already exists (${userCount} users found)`)
  }

  // Create tags
  const tagNames = ['propaganda', 'conditioning', 'media', 'theory']
  const tags: Record<string, string | number> = {}

  for (const name of tagNames) {
    const existing = await payload.find({
      collection: 'tags',
      where: { name: { equals: name } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const tag = await payload.create({
        collection: 'tags',
        data: { name },
      })
      tags[name] = tag.id
      console.log(`✓ Created tag: ${name}`)
    } else {
      tags[name] = existing.docs[0].id
      console.log(`ℹ Tag exists: ${name}`)
    }
  }

  // Create About page
  const existingAbout = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
  })

  if (existingAbout.docs.length === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'About',
        slug: 'about',
        status: 'published',
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
                    text: 'Mind-Controlled explores the mechanics of propaganda, conditioning, and persuasion in modern society. This is a space for critical analysis of how ideas spread and take hold—not to promote cynicism, but to cultivate discernment.',
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
                    text: 'The name references Jacques Ellul\'s work on propaganda—the idea that modern humans are shaped by forces we rarely examine. By making these forces visible, we reclaim some agency over our own thinking.',
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
      },
    })
    console.log('✓ Created About page')
  } else {
    console.log('ℹ About page exists')
  }

  // Create sample posts
  const existingPosts = await payload.find({
    collection: 'posts',
    limit: 1,
  })

  if (existingPosts.docs.length === 0) {
    // Featured post
    await payload.create({
      collection: 'posts',
      data: {
        title: 'The Architecture of Belief',
        slug: 'the-architecture-of-belief',
        type: 'essay',
        summary: 'How do ideas become convictions? An examination of the structural elements that transform information into belief—and belief into identity.',
        status: 'published',
        featured: true,
        publishedAt: new Date().toISOString(),
        tags: [tags.propaganda, tags.conditioning],
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
                    text: 'Every belief we hold has an architecture. It was constructed—sometimes deliberately, sometimes through cultural osmosis, sometimes through personal experience. Understanding this construction process is the first step toward intellectual autonomy.',
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
                    text: 'This is not to suggest that all beliefs are equally valid or that skepticism should lead to paralysis. Rather, the goal is to become a conscious participant in our own belief formation rather than a passive recipient.',
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
      },
    })
    console.log('✓ Created featured post: The Architecture of Belief')

    // Second post
    await payload.create({
      collection: 'posts',
      data: {
        title: 'Manufacturing Consent in the Algorithm Age',
        slug: 'manufacturing-consent-algorithm-age',
        type: 'essay',
        summary: 'Chomsky and Herman\'s framework updated for an era where the filters are computational and the propaganda is personalized.',
        status: 'published',
        featured: false,
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        tags: [tags.media, tags.theory],
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
                    text: 'In 1988, Chomsky and Herman identified five filters through which news passes before reaching audiences. Today, those filters have been augmented—and in some cases replaced—by algorithmic curation that operates at a scale and speed impossible for human editors.',
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
      },
    })
    console.log('✓ Created post: Manufacturing Consent in the Algorithm Age')
  } else {
    console.log(`ℹ Posts exist (${existingPosts.totalDocs} found)`)
  }

  console.log('\n✅ Seed complete!')
  console.log('\nAdmin credentials:')
  console.log('  Email: admin@mind-controlled.com')
  console.log('  Password: MindControl2026!')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
