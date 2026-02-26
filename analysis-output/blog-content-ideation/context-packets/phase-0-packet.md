# Context Packet: Phase 0

## Analysis Question
What blog post ideas — with SEO grounding — can be extracted from a practitioner's voice transcript about sub-agent orchestration in AI coding tools (Claude Code)?

## Key Concepts from Transcript
- Context isolation: bounding agent context to prevent pollution and bias reinforcement
- Parallel specialist dispatch: sending 5 different specialist agents (frontend, backend, DB, architect, etc.) to analyze the same problem from different angles
- Hallucination mitigation via redundancy: if 4/5 agents agree and 1 diverges, dispatch validation agents
- Git worktree isolation: each agent gets its own worktree to prevent interference
- Iterative review waves: agents write PRs, then reviewer agents analyze from multiple specialist perspectives
- Node-locality perspective: agents instantiated "on the node" (ticket) see differently than the orchestrator at the root
- Probability-aware workflows: designing for non-determinism, building iterative validation into the process
- Cost optimization: using cheaper models (Sonnet) for sub-agents while Opus orchestrates
- Overlapping lanes of fire: Venn diagram of specialist coverage creating redundant validation

## Constraints
- Blog is early-stage, needs SEO-discoverable content
- Audience: technical practitioners using AI coding tools
- Tone: analytical, practitioner-voice, not promotional or generic
- Output: blog post IDEAS with SEO analysis, not the posts themselves

## Quality Criteria (weighted)
- Differentiation (25%), SEO opportunity (25%), Practitioner value (20%), Depth potential (15%), Voice alignment (15%)

## Artifacts
- Transcript: `/Users/j/repos/tech-blog/blog-ideas/voice-transcripts/subagent-orchestration-context-isolation-and-parallel-review.txt`
- Analysis brief: `analysis-output/blog-content-ideation/phase-0/analysis-brief.md`
