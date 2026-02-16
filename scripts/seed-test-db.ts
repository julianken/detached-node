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
  const agenticAiTag = await payload.create({
    collection: 'tags',
    data: {
      name: 'Agentic AI',
      slug: 'agentic-ai',
      description: 'Analysis of agentic AI systems and their capabilities',
    },
  })

  const workflowsTag = await payload.create({
    collection: 'tags',
    data: {
      name: 'Workflows',
      slug: 'workflows',
      description: 'Autonomous workflows and orchestration patterns',
    },
  })

  const philosophyTag = await payload.create({
    collection: 'tags',
    data: {
      name: 'Philosophy',
      slug: 'philosophy',
      description: 'Philosophy of machine intelligence and autonomy',
    },
  })
  console.log('✓ Created 3 tags')

  // 3. Create media from Unsplash images
  console.log('📷 Downloading hero images from Unsplash...')

  const heroImages = [
    {
      // Circuit board close-up — "Architecture of Agent Systems"
      url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&h=630&fit=crop&q=80',
      alt: 'Abstract circuit board patterns representing agent architectures',
      caption: 'Photo by Lianhao Qu on Unsplash',
      filename: 'architecture-of-agent-systems.jpg',
    },
    {
      // Network visualization — "Decoding Tool Use Patterns"
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&q=80',
      alt: 'Network of connected nodes representing tool use patterns',
      caption: 'Photo by Sean Pollock on Unsplash',
      filename: 'tool-use-patterns.jpg',
    },
    {
      // Data streams — "Notes on Autonomous Workflows"
      url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop&q=80',
      alt: 'Digital interface displaying autonomous workflow orchestration',
      caption: 'Photo by Rami Al-zayat on Unsplash',
      filename: 'autonomous-workflows.jpg',
    },
    {
      // Stack of technical books — "Essential Readings on Agentic AI"
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=630&fit=crop&q=80',
      alt: 'Stack of technical reference books on AI and systems design',
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
      title: 'The Architecture of Agent Systems',
      slug: 'architecture-of-agent-systems',
      type: 'essay',
      summary: 'An exploration of how modern agent architectures coordinate reasoning and action at scale. This essay examines the structural elements.',
      featuredImage: mediaItems[0].id,
      body: createRichTextMulti([
        'Understanding the architecture of agent systems requires examining both the explicit design patterns and the implicit frameworks that shape how autonomous processes reason and act. An agent system is not a single component but a structure — a system of interlocking parts that together create an environment where complex tasks can be decomposed and executed autonomously.',
        'Consider the modern agent loop. A task does not simply execute; it reasons about which tools to invoke, which sub-tasks to delegate, which context to preserve and which to discard. The architecture is in the orchestration. By the time an agent produces output, dozens of reasoning steps have already been performed, each one a small act of planning disguised as simple execution.',
        'The concept of agentic AI represents a shift from passive language models to active reasoning systems. An agent does not merely respond to prompts — it plans, acts, observes, and adapts. The architecture determines how these phases interact, how state is maintained between steps, and how failures are detected and recovered from. The most capable agent systems are those where these interactions have been carefully designed rather than left to emerge accidentally.',
        'The most effective agent architectures operate through composable abstractions. They do not hardcode behavior; they define interfaces. They do not prescribe solutions; they enable discovery. When a particular tool-use pattern appears across multiple seemingly independent agent frameworks — ReAct, plan-and-execute, reflection loops — it ceases to feel like an implementation detail and begins to reveal a deeper structural principle.',
        'This is the key insight: the architecture of agent systems is not primarily about individual components but about the environment in which reasoning occurs. Design the environment well and you barely need to constrain the agent at all. The system will discover effective strategies from the available tools and context, arriving at solutions that appear creative while following principled architectural patterns.',
        'Recognizing these architectural patterns does not make one an expert agent builder overnight. But it does create a productive foundation — a framework for evaluating new approaches and distinguishing genuine innovation from superficial novelty. That evaluation capacity is the narrow space in which engineering judgment can be exercised.',
      ]),
      tags: [agenticAiTag.id, philosophyTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-15').toISOString(),
      featured: true,
    },
  })

  // Post 2: Featured + Published Decoder
  const post2 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Decoding Tool Use Patterns',
      slug: 'decoding-tool-use-patterns',
      type: 'decoder',
      summary: 'A systematic breakdown of how AI agents select, invoke, and chain tools to accomplish tasks that no single tool could handle alone.',
      featuredImage: mediaItems[1].id,
      body: createRichTextMulti([
        'Tool use in agentic systems transforms abstract reasoning into concrete action: queries become API calls, intentions become file operations, and plans become executable workflows. This translation serves a precise function — it bridges the gap between what an LLM can reason about and what it can actually accomplish in the world.',
        'The pattern is remarkably consistent across agent frameworks. When an agent encounters a complex task, it never attempts it monolithically. It decomposes, delegates, and sequences. Each decomposition adds another layer of abstraction between the original request and its execution. By the time the tools are invoked, the original intent has been refined through multiple reasoning steps.',
        'The ReAct pattern identified this mechanism in 2022, but tool use has evolved far beyond what early frameworks imagined. Modern tool use does not merely execute — it actively reasons about execution. Reflection transforms errors into learning. Chaining transforms single actions into workflows. Parallel execution transforms sequential bottlenecks into concurrent operations.',
        'Consider the phrase "the agent used a tool." The construction is revealing. "Used" implies simple invocation, a single action — as if the agent merely called a function. But effective tool use involves selection from alternatives, parameter construction, output interpretation, error handling, and result integration. The entire process is a sophisticated reasoning chain presented as a simple action.',
        'The most powerful category of tool use is compositional — where agents combine multiple tools into novel workflows that were never explicitly programmed. "Search, then summarize, then write" — these compound patterns emerge from the agent\'s reasoning rather than from hard-coded pipelines. When an agent discovers that it can chain tools in new ways, it ceases to be a simple executor and begins to exhibit genuine problem-solving behavior.',
        'Decoding tool use patterns is not merely an exercise in system design. It is a practice of understanding autonomous behavior. Every time we trace an agent\'s tool selection back to its reasoning chain, we gain insight into how these systems make decisions — and where those decisions can go wrong.',
        'The decoder\'s task is not skepticism but precision. The goal is not to distrust agent behavior but to understand it — to ask, each time, "Why did the agent choose this tool, and what alternatives were available?" That question, simple as it sounds, is the one that separates robust agent design from fragile automation.',
      ]),
      tags: [agenticAiTag.id, workflowsTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-20').toISOString(),
      featured: true,
    },
  })

  // Post 3: Featured + Published Field Report
  const post3 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Notes on Autonomous Workflows',
      slug: 'notes-on-autonomous-workflows',
      type: 'field-report',
      summary: 'Field observations on how autonomous workflows have become the primary pattern for orchestrating complex AI tasks across distributed systems.',
      featuredImage: mediaItems[2].id,
      body: createRichTextMulti([
        'Autonomous workflows operate on principles fundamentally different from traditional automation. In conventional programming, the developer decides what to execute. In autonomous workflows, the agent decides what to do next — and the agent is reasoning in real time. Your task description, your context window, your tool definitions: these are the raw materials being interpreted, planned against, and acted upon.',
        'I spent a week observing agent workflow traces in a production system. The results were illuminating. On an average run, roughly 30% of tool invocations were directly specified by the initial prompt. The remaining 70% were emergent — reasoning-driven decisions about what to do next based on intermediate results, error recovery, and context accumulated during execution. The workflow was not being followed; it was being discovered.',
        'The engineering behind this discovery process is precise. Planning-execution-reflection loops (the same mechanism that makes ReAct agents effective) are embedded into every autonomous workflow. The interval between plan revision and action — a tool result, an unexpected error, a context shift — is deliberately responsive. This responsiveness is the engine of adaptability. If the agent could only follow a fixed plan, it would fail on the first unexpected result. Not knowing the full path in advance means the agent keeps reasoning.',
        'What makes autonomous workflows particularly powerful is that they have unified previously separate concerns. The same framework that handles task decomposition also handles error recovery, tool selection, and output synthesis. Opting out of the orchestration means opting out of capabilities you actually need for robust operation.',
        'The researcher Andrej Karpathy has described autonomous agents as a new "operating system" — a runtime environment that, like traditional OS processes, manages resources, handles interrupts, and coordinates concurrent operations. The analogy is apt. When every step in a workflow can trigger reasoning, when every tool invocation is evaluated for correctness, the workflow environment becomes intelligent in ways that affect every component, including those that were designed to be simple.',
        'Field observation suggests that the most significant effect of autonomous workflows is not speed per se but a subtler shift in the nature of automation itself. Extended operation of reasoning-driven workflows does not merely execute tasks — it discovers new approaches to them. The capacity for novel problem-solving emerges not because it is explicitly programmed but because the architecture permits exploration.',
        'There is no simple answer to a systemic design challenge. "Just add more tools" is autonomous workflows\' equivalent of "just add more servers" — technically possible, practically useless as a response to an architecture that requires careful tool design, clear interfaces, and deliberate constraint. Understanding the patterns is the first step; building robust systems requires principled design, evaluation, and the deliberate construction of composable tool ecosystems.',
        'These notes are themselves an experiment in that principled construction: long-form, analytical, deliberately resistant to the hype cycles of AI discourse. If you have read this far, you have already done something the attention economy is designed to prevent.',
      ]),
      tags: [workflowsTag.id, philosophyTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-25').toISOString(),
      featured: true,
    },
  })

  // Post 4: Published Index (not featured)
  const post4 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Essential Readings on Agentic AI',
      slug: 'essential-readings-agentic-ai',
      type: 'index',
      summary: 'A curated collection of foundational texts examining agentic AI, autonomous systems, and tool use from multiple disciplinary perspectives.',
      featuredImage: mediaItems[3].id,
      body: createRichTextMulti([
        'This index compiles key works from AI research, systems design, cognitive science, and philosophy of mind that illuminate the mechanisms of autonomous reasoning and action. The list is deliberately selective rather than exhaustive — these are papers and books that fundamentally changed how I understand the machinery of agentic systems.',
        'The ReAct paper (Yao et al., 2022) remains a foundational text. It argues that reasoning and acting are not separate capabilities but interleaved processes — an agent that reasons without acting is merely a language model, and an agent that acts without reasoning is merely a script. ReAct distinguishes between "chain-of-thought" reasoning (which produces analysis) and "act-then-observe" loops (which produce results). The latter, it demonstrates, is far more capable in practice, because it grounds reasoning in real-world feedback rather than pure speculation. Every time an agent successfully recovers from an error, ReAct would suggest you examine how that recovery was structured.',
        'Anthropic\'s work on tool use and constitutional AI provides the safety analysis that early agent research sometimes lacks. Their approach identifies key constraints through which agent behavior should be filtered: harmlessness, helpfulness, and honesty. The insight of this framework is that it does not require hardcoded rules — no one needs to anticipate every possible misuse. The constraints are constitutional, built into the training and evaluation of the system. Safety emerges structurally, without anyone needing to be the explicit censor.',
        'For understanding the systems dimension, "Designing Data-Intensive Applications" by Martin Kleppmann is indispensable, though it predates the agent era. Kleppmann identifies fundamental principles of distributed systems — consistency, availability, partition tolerance — that apply directly to multi-agent architectures. The book can be read as either a systems design guide or an agent architecture manual, and its adoption by agent framework builders suggests which reading has prevailed.',
        'Stuart Russell\'s "Human Compatible" completes the essential quartet. Published in 2019, it argues that the alignment problem — ensuring AI systems pursue human-intended goals — is more fundamental than the capability problem. Russell\'s thesis — that an agent should be uncertain about its objectives and defer to human preferences — has only become more urgent in the age of autonomous workflows. When agent systems become capable enough to act independently, the capacity for meaningful human oversight becomes critical.',
        'These four works provide the conceptual foundations. Other entries in this index extend their insights into specific domains: prompt engineering, tool design, evaluation frameworks, and the emerging landscape of multi-agent coordination. Together, they constitute something like a field manual for navigating a world increasingly shaped by autonomous systems — not to resist the technology, but to understand and direct it.',
      ]),
      references: [
        {
          title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
          author: 'Shunyu Yao et al.',
          publication: 'ICLR 2023',
          date: '2022-10-06',
        },
        {
          title: 'Human Compatible: Artificial Intelligence and the Problem of Control',
          author: 'Stuart Russell',
          publication: 'Viking Press',
          date: '2019-10-08',
        },
      ],
      tags: [agenticAiTag.id],
      status: 'published',
      publishedAt: new Date('2026-01-10').toISOString(),
      featured: false,
    },
  })

  // Post 5: Draft Essay
  const post5 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Unpublished Thoughts on Emergence',
      slug: 'unpublished-thoughts-emergence',
      type: 'essay',
      summary: 'Early draft exploring emergent AI behaviors in complex agent systems. Still in development and not ready for publication.',
      body: createRichTextMulti([
        'This is a work in progress examining how unexpected capabilities emerge from the interaction of simple components in agent systems. The central question is deceptively simple: how much of what an agent does was actually specified by its designers?',
        'Emergent behavior is typically associated with complex systems theory — flocking birds, ant colonies, the self-organizing patterns of cellular automata. But the most striking emergence happens in AI systems, embedded in the interaction of language models with tool environments. The agent that discovers it can chain search results into a research workflow. The multi-agent system that develops its own delegation protocols. The reasoning loop that learns to ask clarifying questions. These are not accidents of design; they are consequences of architecture.',
        'The key insight from complexity science is that behavior at the system level cannot be predicted from the properties of individual components. A language model that can write code and a tool that can execute code are individually unremarkable. But combine them in a reasoning loop with error feedback, and you get an agent that can iteratively debug its own programs — a capability that exists nowhere in the individual components.',
        'What interests me is the gap between the emergence and the narrative we construct around it. We describe emergent agent behaviors as if they were designed. The agent that discovers a novel tool-use pattern is described as "intelligent" or "creative." The emergence is invisible precisely because it has been integrated into our explanatory framework. This is what makes it so much more interesting than simple automation — it challenges our assumptions about the boundary between programmed and discovered behavior.',
        'I am still working through the implications. If much of agent behavior is emergent rather than designed, what does that mean for concepts like reliability, predictability, and control? These are not merely philosophical questions — they have practical consequences for how we evaluate agent systems, design safeguards, and understand the limits of autonomous operation. More to come as this thinking develops.',
      ]),
      tags: [philosophyTag.id],
      status: 'draft',
      featured: false,
    },
  })

  // Post 6: Archived Essay
  const post6 = await payload.create({
    collection: 'posts',
    data: {
      title: 'Legacy Post About Early Automation',
      slug: 'legacy-post-early-automation',
      type: 'essay',
      summary: 'Historical analysis of early automation techniques from the pre-AI era. Archived for reference but no longer actively maintained.',
      body: createRichTextMulti([
        'This archived post examines automation methods from the pre-AI era that, while dated in their specific forms, reveal patterns still present in modern agent systems. The techniques have evolved; the underlying logic has not.',
        'Early automation on both the industrial and software sides operated through a remarkably similar mechanism: the construction of rigid rule systems so comprehensive that they could handle any anticipated scenario. The assembly line\'s fixed sequence and the expert system\'s decision tree served identical structural functions — they provided the deterministic control flow that every pre-AI automation system requires to operate reliably.',
        'The most effective early automation was not the crude scripting of batch files or cron jobs. It was the integration automation — the kind that worked by connecting disparate systems into coherent workflows. In enterprise software, this took the form of ETL pipelines that normalized data across incompatible systems, middleware that translated between protocols, and orchestration engines that coordinated processes across organizational boundaries.',
        'What strikes me, revisiting this material, is how clearly it prefigures our current agent architecture landscape. The patterns of early automation — workflow orchestration, error handling, state management — did not disappear with the arrival of AI. They were refined, augmented with reasoning capabilities, and distributed across a vastly more flexible execution environment. The rigid determinism of early automation has been replaced by adaptive reasoning, but the underlying need for reliable orchestration remains recognizable.',
        'I am archiving this post because the analysis, while still relevant in its broad strokes, requires significant updating to account for developments in LLM-powered agents, autonomous tool use, and the blurring of the line between programmed and emergent behavior. The pre-AI model assumed identifiable decision paths and deterministic execution. Neither assumption holds in the current landscape.',
      ]),
      tags: [agenticAiTag.id],
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
      title: 'About Detached Node',
      slug: 'about',
      description: 'Learn about the purpose and perspective behind Detached Node',
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
                  text: 'This is a space for critical analysis of how autonomous systems are designed and deployed—not to promote hype, but to cultivate understanding.',
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
      description: 'A curated collection of featured essays on agentic AI and autonomous systems',
      featuredImage: mediaItems[0].id,
      items: [post1.id, post2.id, post3.id],
      status: 'published',
    },
  })
  console.log('✓ Created listing with 3 posts')

  console.log('\n✅ Test database seed complete!')
  console.log('\nTest Data Summary:')
  console.log('  • 1 test admin user (test@example.com / testpassword123)')
  console.log('  • 3 tags (Agentic AI, Workflows, Philosophy)')
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
