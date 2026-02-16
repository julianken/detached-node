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
        email: 'admin@detached-node.dev',
        password: 'DetachedNode2026!',
      },
    })
    console.log('✓ Admin user created: admin@detached-node.dev')
  } else {
    console.log(`ℹ Admin user already exists (${userCount} users found)`)
  }

  // Create tags
  const tagNames = ['agentic-ai', 'workflows', 'philosophy', 'systems', 'tool-use', 'autonomy']
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
                    text: 'Detached Node explores the emerging world of agentic AI — autonomous systems that reason, plan, and act. Through essays and analysis, this site examines how AI agents work, how they\'re orchestrated, and what it means when machines begin to operate with increasing independence.',
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
                    text: 'The name refers to a node that operates outside the main cluster — autonomous, self-directed, yet still connected to the broader network. It\'s a metaphor for how modern AI agents work: independently reasoning while remaining part of larger systems.',
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
        title: 'The Architecture of Agent Systems',
        slug: 'the-architecture-of-agent-systems',
        type: 'essay',
        summary: 'How do autonomous agents coordinate? An examination of the structural elements that transform simple tools into reasoning systems—and systems into autonomous workflows.',
        status: 'published',
        featured: true,
        publishedAt: new Date().toISOString(),
        tags: [tags['agentic-ai'], tags.systems],
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
                    text: 'Every agent system has an architecture. It was constructed—sometimes through deliberate design, sometimes through emergent behavior, sometimes through iterative refinement. Understanding this construction process is the first step toward building truly autonomous workflows.',
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
                    text: 'This is not to suggest that all architectures are equally effective or that complexity should be pursued for its own sake. Rather, the goal is to become a deliberate designer of agent systems rather than a passive consumer of black-box solutions.',
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
    console.log('✓ Created featured post: The Architecture of Agent Systems')

    // Second post
    await payload.create({
      collection: 'posts',
      data: {
        title: 'Orchestrating Agents in the LLM Age',
        slug: 'orchestrating-agents-llm-age',
        type: 'essay',
        summary: 'Multi-agent frameworks examined for an era where the reasoning is distributed and the tool use is autonomous.',
        status: 'published',
        featured: false,
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        tags: [tags.workflows, tags['tool-use']],
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
                    text: 'In 2023, the first wave of agent frameworks identified core patterns through which LLM reasoning passes before producing actions. Today, those patterns have been augmented—and in some cases replaced—by autonomous orchestration that operates at a scale and speed impossible for human operators.',
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
    console.log('✓ Created post: Orchestrating Agents in the LLM Age')
  } else {
    console.log(`ℹ Posts exist (${existingPosts.totalDocs} found)`)
  }

  console.log('\n✅ Seed complete!')
  console.log('\nAdmin credentials:')
  console.log('  Email: admin@detached-node.dev')
  console.log('  Password: DetachedNode2026!')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
