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
import { createRichText, createRichTextMulti } from '../src/lib/rich-text.js'

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

  // 3. Create media from Unsplash images
  console.log('📷 Downloading hero images from Unsplash...')

  const heroImages = [
    {
      // Surveillance cameras on a wall — "Architecture of Persuasion"
      url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&h=630&fit=crop&q=80',
      alt: 'Surveillance cameras mounted on a concrete wall',
      caption: 'Photo by Lianhao Qu on Unsplash',
      filename: 'architecture-of-persuasion.jpg',
    },
    {
      // Corporate office tower — "Decoding Corporate Newspeak"
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&q=80',
      alt: 'Glass corporate tower reflecting distorted light',
      caption: 'Photo by Sean Pollock on Unsplash',
      filename: 'corporate-newspeak.jpg',
    },
    {
      // Person scrolling phone in dark room — "Notes from the Attention Economy"
      url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop&q=80',
      alt: 'Smartphone screen glowing with notifications in a dark room',
      caption: 'Photo by Rami Al-zayat on Unsplash',
      filename: 'attention-economy.jpg',
    },
    {
      // Stack of old books — "Essential Readings on Mind Control"
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=630&fit=crop&q=80',
      alt: 'Stack of well-worn books on a wooden surface',
      caption: 'Photo by Susan Q Yin on Unsplash',
      filename: 'essential-readings.jpg',
    },
  ]

  const tmpDir = path.join(process.cwd(), 'scripts', '.tmp-seed-images')
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const mediaItems: Array<{ id: number | string }> = []
  for (const img of heroImages) {
    const filePath = path.join(tmpDir, img.filename)
    console.log(`  ↓ ${img.filename}`)
    const response = await fetch(img.url)
    if (!response.ok) {
      console.warn(`  ⚠ Failed to download ${img.filename}, using placeholder`)
      // Fallback to a tiny placeholder
      const placeholderBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      )
      fs.writeFileSync(filePath, placeholderBuffer)
    } else {
      const buffer = Buffer.from(await response.arrayBuffer())
      fs.writeFileSync(filePath, buffer)
    }

    const mediaItem = await payload.create({
      collection: 'media',
      data: {
        alt: img.alt,
        caption: img.caption,
      },
      filePath,
    })
    mediaItems.push(mediaItem)
  }

  // Clean up temporary files
  fs.rmSync(tmpDir, { recursive: true })

  console.log(`✓ Created ${mediaItems.length} media items`)

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
      featuredImage: mediaItems[0].id,
      body: createRichTextMulti([
        'Understanding the architecture of persuasion requires examining both the explicit techniques and the implicit frameworks that shape how messages are received and processed. Persuasion is not a single act but a structure — a system of interlocking parts that together create an environment where certain conclusions feel inevitable.',
        'Consider the modern news cycle. A story does not simply report facts; it selects which facts to elevate, which to bury, which to frame as context and which to present as the main event. The architecture is in the selection. By the time you encounter the headline, dozens of editorial decisions have already been made on your behalf, each one a small act of persuasion disguised as curation.',
        'Jacques Ellul argued that propaganda is not merely the work of governments or advertisers but a sociological phenomenon — a condition of modern technological society itself. The sheer volume of information we process daily creates a dependency on pre-digested interpretations. We cannot evaluate everything from first principles, so we outsource our judgment to trusted intermediaries. The architecture of persuasion exploits this delegation.',
        'The most effective persuasion operates below the threshold of conscious awareness. It does not argue; it assumes. It does not convince; it normalizes. When a particular framing appears across multiple seemingly independent sources — news outlets, social media, entertainment, casual conversation — it ceases to feel like a perspective and begins to feel like reality itself.',
        'This is the key insight: the architecture of persuasion is not primarily about individual messages but about the environment in which messages are received. Control the environment and you barely need to craft the message at all. The audience will construct the desired conclusion from the available materials, believing all the while that they arrived at it independently.',
        'Recognizing this architecture does not make one immune to it. But it does create a productive friction — a moment of delay between encounter and acceptance where critical evaluation becomes possible. That delay is the narrow space in which genuine thought can occur.',
      ]),
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
      featuredImage: mediaItems[1].id,
      body: createRichTextMulti([
        'Corporate newspeak transforms clear concepts into abstraction: employees become "human capital," layoffs become "rightsizing," and surveillance becomes "performance optimization." This linguistic alchemy serves a precise function — it insulates decision-makers from the human consequences of their decisions by replacing concrete nouns with abstract ones.',
        'The pattern is remarkably consistent across industries. When a company fires 10,000 people, the press release never says "fired." It says "reduced headcount," "streamlined operations," or "initiated a workforce transformation." Each euphemism adds another layer of distance between the act and its description. By the time the language reaches the public, the human beings have been fully abstracted away.',
        'George Orwell identified this mechanism in "Politics and the English Language" in 1946, but corporate newspeak has evolved far beyond what he imagined. Modern corporate language does not merely obscure — it actively reframes. "Disruption" transforms destruction into innovation. "Synergy" transforms elimination into collaboration. "Pivoting" transforms failure into strategy.',
        'Consider the phrase "we are letting you go." The construction is revealing. "Letting" implies permission, even generosity — as if the company is freeing the employee from bondage rather than removing their livelihood. "Go" suggests movement, departure, a journey — not the sudden halt of income and purpose that termination actually represents. The entire phrase is an inversion of reality presented as compassion.',
        'The most insidious category of corporate newspeak is the language of inevitability. "Market forces," "industry trends," "the new normal" — these phrases present human decisions as natural phenomena, as immutable as weather. When a CEO says "the market demands efficiency," they are performing an act of ventriloquism, projecting their own choices onto an abstract entity that cannot be questioned or held accountable.',
        'Decoding corporate newspeak is not merely an exercise in linguistics. It is a practice of restoring agency to descriptions of human action. Every time we translate "workforce optimization" back into "people lost their jobs," we resist the abstraction that makes exploitation feel like an impersonal process rather than a series of deliberate choices made by identifiable human beings.',
        'The decoder\'s task is not cynicism but precision. The goal is not to assume malice behind every euphemism but to insist on clarity — to ask, each time, "What is actually happening here, and to whom?" That question, simple as it sounds, is the one corporate newspeak is specifically engineered to prevent.',
      ]),
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
      featuredImage: mediaItems[2].id,
      body: createRichTextMulti([
        'The attention economy operates on principles fundamentally different from traditional markets. In conventional economics, the consumer decides what to buy. In the attention economy, the product decides what to consume — and the product is you. Your time, your focus, your cognitive capacity: these are the raw materials being extracted, refined, and sold.',
        'I spent a week tracking my own attention patterns with a timer. The results were unsettling. On an average day, I initiated roughly 30% of my screen interactions. The remaining 70% were prompted — notifications, autoplay sequences, algorithmic recommendations, "you might also like" carousels. My attention was not being spent; it was being harvested.',
        'The engineering behind this harvesting is precise. Variable-ratio reinforcement schedules (the same mechanism that makes slot machines addictive) are embedded into every scroll feed. The interval between rewards — a funny post, a shocking headline, a friend\'s update — is deliberately unpredictable. This unpredictability is the engine of compulsion. If you knew exactly when the next interesting thing would appear, you could plan around it. Not knowing means you keep scrolling.',
        'What makes the attention economy particularly difficult to resist is that it has co-opted the infrastructure of genuine human connection. The same platform where you coordinate with your child\'s school is also the platform strip-mining your attention for advertising revenue. Opting out of the extraction means opting out of participation in communities you actually care about.',
        'The philosopher Matthew Crawford has written about attention as a "commons" — a shared resource that, like clean air or fisheries, can be degraded by overexploitation. The analogy is apt. When every surface in public space carries advertising, when every digital interaction is optimized for engagement, the commons of attention is being enclosed. The cognitive environment becomes polluted in ways that affect everyone, including those who try to opt out.',
        'Field observation suggests that the most significant effect of the attention economy is not distraction per se but a subtler shift in the quality of thought. Extended immersion in algorithmically curated content does not merely occupy time — it habituates the mind to a particular rhythm: short, reactive, emotionally charged. The capacity for sustained, self-directed thought atrophies not because it is actively suppressed but because it is never exercised.',
        'There is no individual solution to a structural problem. "Just put your phone down" is the attention economy\'s equivalent of "just say no" — technically possible, practically useless as a response to an environment specifically engineered to make that action as difficult as possible. Understanding the machinery is the first step; dismantling it requires collective action, regulation, and the deliberate construction of alternative information environments.',
        'These notes are themselves an experiment in that alternative construction: long-form, unoptimized, deliberately resistant to the rhythms of engagement. If you have read this far, you have already done something the attention economy is designed to prevent.',
      ]),
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
      featuredImage: mediaItems[3].id,
      body: createRichTextMulti([
        'This index compiles key works from sociology, psychology, media studies, and critical theory that illuminate the mechanisms of influence and control. The list is deliberately selective rather than exhaustive — these are books that fundamentally changed how I understand the machinery of persuasion.',
        'Jacques Ellul\'s "Propaganda" remains the foundational text. Written in 1962, it argues that propaganda is not an aberration of modern society but its essential condition. Ellul distinguishes between "agitation propaganda" (which seeks to provoke action) and "integration propaganda" (which seeks to produce conformity). The latter, he argues, is far more pervasive and far harder to detect, because it works by aligning individuals with the prevailing social order rather than pushing them toward revolution. Every time you feel a comfortable certainty about a complex issue, Ellul would suggest you examine where that certainty came from.',
        'Chomsky and Herman\'s "Manufacturing Consent" provides the structural analysis that Ellul\'s work sometimes lacks. Their propaganda model identifies five "filters" through which news passes before reaching the public: ownership, advertising, sourcing, flak, and ideology. The genius of the model is that it does not require conspiracy — no one needs to sit in a room deciding what to suppress. The filters are structural, built into the economics and institutional incentives of media production. Censorship happens automatically, without anyone needing to be the censor.',
        'For understanding the psychological dimension, Robert Cialdini\'s "Influence: The Psychology of Persuasion" is indispensable, though it requires careful reading. Cialdini identifies six principles of influence — reciprocity, commitment, social proof, authority, liking, and scarcity — but his tone is that of a field guide rather than a warning. The book can be read as either a defense manual or an instruction manual, and its widespread adoption by marketers and salespeople suggests which reading has prevailed.',
        'Neil Postman\'s "Amusing Ourselves to Death" completes the essential quartet. Published in 1985, it argues that Aldous Huxley\'s vision of control through pleasure was more prescient than Orwell\'s vision of control through pain. Postman\'s thesis — that television (and by extension, all entertainment-driven media) transforms every subject it touches into entertainment — has only become more urgent in the age of social media. When political discourse becomes indistinguishable from entertainment, the capacity for serious deliberation erodes.',
        'These four texts provide the conceptual foundations. Other entries in this index extend their insights into specific domains: education, technology, consumer culture, and the emerging landscape of algorithmic influence. Together, they constitute something like a field manual for navigating a world saturated in persuasion — not to become immune, but to become aware.',
      ]),
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
      body: createRichTextMulti([
        'This is a work in progress examining how subtle environmental cues shape behavior without conscious awareness. The central question is deceptively simple: how much of what you do today was actually decided by you?',
        'Behavioral conditioning is typically associated with laboratories — Pavlov\'s dogs, Skinner\'s pigeons, the controlled environments of mid-century psychology. But the most effective conditioning happens in the wild, embedded in the design of everyday environments. The supermarket layout that routes you past impulse-buy items. The app notification timed to arrive during your commute. The open-plan office that conditions you to perform busyness. These are not accidents of design; they are its purpose.',
        'B.F. Skinner\'s key insight was that behavior shaped by its consequences is more durable than behavior compelled by force. A rat that learns to press a lever for food will keep pressing long after the food stops coming — especially if the reward was intermittent to begin with. This principle, operant conditioning, is now the foundation of every engagement-optimized platform, every gamified loyalty program, every variable-reward notification system.',
        'What interests me is the gap between the conditioning and the narrative we construct around it. We experience our conditioned behaviors as choices. The person who checks their phone 150 times a day does not feel conditioned; they feel curious, connected, responsible. The conditioning is invisible precisely because it has been integrated into the self-narrative. This is what makes it so much more effective than coercion — it recruits the subject as a collaborator.',
        'I am still working through the implications. If much of our behavior is conditioned rather than chosen, what does that mean for concepts like responsibility, authenticity, and freedom? These are not merely philosophical questions — they have practical consequences for how we design institutions, evaluate actions, and understand ourselves. More to come as this thinking develops.',
      ]),
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
      body: createRichTextMulti([
        'This archived post examines propaganda methods from the Cold War era that, while dated in their specific forms, reveal patterns still present in modern influence campaigns. The techniques have evolved; the underlying logic has not.',
        'Cold War propaganda on both sides operated through a remarkably similar mechanism: the construction of an existential threat so overwhelming that it justified any domestic policy, any military expenditure, any curtailment of civil liberties. The Soviet threat to the West and the capitalist threat to the East served identical structural functions — they provided the permanent emergency that every propaganda system requires to sustain itself.',
        'The most effective Cold War propaganda was not the crude caricatures of Voice of America broadcasts or Soviet poster art. It was the integration propaganda — the kind that worked by shaping the background assumptions of daily life. In the United States, this took the form of civil defense drills that normalized the possibility of nuclear annihilation, entertainment that consistently portrayed American values as universal values, and an educational system that taught the Cold War as a moral struggle between freedom and tyranny rather than a geopolitical competition between empires.',
        'What strikes me, revisiting this material, is how clearly it prefigures our current information environment. The techniques of the Cold War — manufactured consent, enemy construction, the weaponization of uncertainty — did not disappear with the Berlin Wall. They were refined, digitized, and distributed across a vastly more complex media ecosystem. The bipolar clarity of the Cold War has been replaced by a multipolar confusion, but the underlying machinery of influence remains recognizable.',
        'I am archiving this post because the analysis, while still relevant in its broad strokes, requires significant updating to account for developments in algorithmic propaganda, state-sponsored social media operations, and the blurring of the line between foreign and domestic influence campaigns. The Cold War model assumed identifiable propagandists and discrete national audiences. Neither assumption holds in the current landscape.',
      ]),
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
      featuredImage: mediaItems[0].id,
      items: [post1.id, post2.id, post3.id],
      status: 'published',
    },
  })
  console.log('✓ Created listing with 3 posts')

  console.log('\n✅ Test database seed complete!')
  console.log('\nTest Data Summary:')
  console.log('  • 1 test admin user (test@example.com / testpassword123)')
  console.log('  • 3 tags (Propaganda, Technology, Culture)')
  console.log('  • 4 media items')
  console.log('  • 6 posts (3 featured+published, 1 published, 1 draft, 1 archived)')
  console.log('  • 1 page (About)')
  console.log('  • 1 listing (Featured Essays)')

  process.exit(0)
}

seedTestDatabase().catch((err) => {
  console.error('❌ Seed error:', err)
  process.exit(1)
})
