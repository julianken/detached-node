/**
 * Seed script for the "The Phase Boundary Is Where the Loop Actually Lives" article.
 *
 * Slug: phase-boundary-loop
 * Word count: ~900w
 *
 * Run with: npx tsx scripts/seed-phase-boundary-loop.ts
 *
 * Requires DATABASE_URL and PAYLOAD_SECRET environment variables.
 * Idempotent: skips creation if a post with this slug already exists.
 */
import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function seed() {
  const { getPayload } = await import('payload')
  const configModule = await import('../src/payload.config.js')
  const config = configModule.default
  const payload = await getPayload({ config })

  const SLUG = 'phase-boundary-loop'

  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: SLUG } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`Post "${SLUG}" already exists — skipping.`)
    process.exit(0)
  }

  // Ensure the agentic-ai tag exists
  let tagId: number | string | undefined
  const tagResult = await payload.find({
    collection: 'tags',
    where: { slug: { equals: 'agentic-ai' } },
    limit: 1,
  })
  if (tagResult.docs.length > 0) {
    tagId = tagResult.docs[0].id
  } else {
    const newTag = await payload.create({
      collection: 'tags',
      data: { name: 'Agentic AI', slug: 'agentic-ai' },
    })
    tagId = newTag.id
  }

  const { createRichTextMulti } = await import('../src/lib/rich-text.js')

  const body = createRichTextMulti([
    // Opening: teaching voice, disk-anchored artifact protocol
    'Here is one way to wire a multi-phase agent loop with disk-anchored artifacts: every transition writes disk artifacts before dispatching the next wave; a STATUS.md row updates synchronously; a context packet (1–2 K tokens, not raw artifacts) flows forward as the dispatch payload; the next phase reads the packet plus its own assigned slice, never the prior phase\'s full transcript. This configuration has a name — the Funnel Method — and what this essay documents is one specific composition of well-established antecedents, not a novel invention.',

    // The boundary as primitive
    'The interesting thing about a multi-phase agent loop is not the agents — it is what crosses between them. A loop without a hard phase boundary is a context-accumulation loop. Each wave\'s output stays in the orchestrator\'s context; downstream workers inherit a prompt weighted toward whatever the prior waves produced; the investigation funnel becomes a confirmation funnel because later workers tend to extend rather than challenge. The boundary breaks this structural drift. Workers write to disk; their transcripts leave the orchestrator\'s context; the context packet is the compressed summary of what mattered, not what was said.',

    // Prior art: Double Diamond, NGT, Anthropic, LangGraph, Temporal, Microsoft, Google
    'The four-phase funnel shape is consistent with the British Design Council\'s Double Diamond (2005): Discover, Define, Develop, Deliver — four phases, two diverge-and-converge cycles, explicit phase boundaries between them. The parallel-then-converge dispatch mechanic draws on Nominal Group Technique (NGT, Delbecq and Van de Ven, 1971), which prescribes silent individual work before group ranking — the same structural logic applied to agent waves rather than human teams. Anthropic\'s multi-agent research blog describes the lead-spawns-3-5-subagents primitive at production scale: parallel subagents explore independent branches, a synthesis pass converges the findings. LangGraph and Temporal own the durable-state-machine and journal-based-recovery framing at the framework layer. Microsoft\'s Azure Architecture Center and Google\'s ADK documentation both describe parallel dispatch and checkpoint patterns for multi-agent systems. The 5+5+3+1 Funnel Method is one specific composition of those antecedents.',

    // The disk-artifact protocol
    'Three artifacts cross each phase boundary. The phase-{N}/{role}-{slug}.md files are each worker\'s output, written to disk synchronously before the orchestrator reads them. The STATUS.md row is updated inline at each boundary — one row per phase, with timestamp and artifact count — and is the only record a fresh-context session needs to reconstruct where a stopped funnel left off without replaying any prior transcript. The context-packets/phase-{N}-packet.md is assembled from the phase artifacts by the orchestrator and forwarded as the dispatch payload for the next wave. Workers read the packet plus their own brief. They do not see the raw artifact directory.',

    // The 5+5+3+1 cardinality described, not claimed
    'The specific 5+5+3+1 cardinality — five investigators, five iterators, three synthesizers, one unifier — is a configuration, not a theorem. Five independent investigators tend to cover a problem space without significant overlap; five iterators can each take a genuinely distinct angle on the findings without redundancy; three synthesizers can apply three different analytical lenses; one unifier can hold the synthesis outputs in context and produce a coherent final deliverable. Fewer investigators tend to miss important facets; more tend to produce significant overlap. The numbers come from running the structure across a range of inputs and observing where coverage and redundancy trade off. The cardinality is what this repository converged on after experimentation, not what a theorem demands.',

    // In-repo realizations: three skills across three domains
    'Three Claude Code skills encode the funnel as executable configuration across three triggering domains. The analysis-funnel skill (docs/agentic-bridge/funnel/ is a canonical in-repo artifact tree from a complete run) handles open-ended investigation. The decision-funnel skill handles option evaluation. The creative-funnel skill handles parallel creative production. All three encode 5+5+3+1 with the same disk-artifact protocol — STATUS.md, phase-{N}/{role}-{slug}.md artifacts, context-packets/phase-{N}-packet.md — applied to their respective domains. The docs/read-along-feature/ directory is a second in-repo artifact tree demonstrating the same convention applied to a different question.',

    // Contrast with constituent ADP patterns
    'Four patterns in the agentic design patterns catalog are narrower than this composition. Parallelization is the fan-out primitive — it handles the single-message multi-Task() dispatch mechanic that each wave uses — but it does not specify phase structure, boundary discipline, or context-packet forwarding. Checkpointing is the boundary-persistence primitive — it handles the disk-write and STATUS.md recovery anchor — but it does not specify how many waves to run or what crosses them. Orchestrator-Workers is the architecture framing — a central planner dispatching specialized workers — but it does not specify that the dispatcher\'s context is protected by boundary checkpoints and context-packet compression. Context Engineering is the compression primitive — it handles the 1–2 K token context-packet assembly — but it does not specify phase structure or aggregation discipline. The Funnel Method composes all four.',

    // Closing: the implication
    'The implication of the boundary-as-primitive framing is that multi-phase agent loops are filesystem designs, not framework choices. The questions that matter are: what does each phase write to disk, what does the next phase need to read, and how is the gap between those two things compressed into a context packet that is small enough to keep worker contexts clean. A loop that gets those three questions right will work in Claude Code, in LangGraph, in Temporal, or in a shell script with curl. A loop that gets them wrong will drift toward confirmation regardless of the framework. The framework choice is downstream of the boundary design.',
  ])

  const post = await payload.create({
    collection: 'posts',
    data: {
      title: 'The Phase Boundary Is Where the Loop Actually Lives',
      slug: SLUG,
      type: 'field-report',
      summary:
        'Here is one way to wire a multi-phase agent loop with disk-anchored artifacts. The 5+5+3+1 Funnel Method — five investigators, five iterators, three synthesizers, one unifier — is one specific composition of Double Diamond, NGT, Anthropic\'s multi-agent research primitives, and durable-execution patterns. What crosses between phases is the design.',
      body,
      tags: tagId !== undefined ? [tagId] : [],
      status: 'published',
      publishedAt: new Date('2026-05-05').toISOString(),
      featured: false,
    },
  })

  console.log(`Created post: "${post.title}" (slug: ${post.slug}, id: ${post.id})`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
