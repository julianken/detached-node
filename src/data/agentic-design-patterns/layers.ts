import type { Layer } from './types'

// ---------------------------------------------------------------------------
// Agentic Design Patterns — 5-Layer Organization
// ---------------------------------------------------------------------------
// Layer order is intentional: Topology first (the largest bucket; sub-divided
// to prevent GoF "behavioral bloat"), then the three cross-cutting concerns
// (Quality, State, Interfaces), then Methodology last.

export const LAYERS: Layer[] = [
  {
    id: 'topology',
    number: 1,
    title: 'Topology / Control Flow',
    question: 'How should my agent calls be arranged and sequenced?',
    description: 'Patterns for arranging and sequencing agent calls.',
  },
  {
    id: 'quality',
    number: 2,
    title: 'Quality & Control Gates',
    question: 'How do I catch errors, enforce safety, and know when to stop?',
    description: 'Output verification, policy gates, human review, and abort thresholds.',
  },
  {
    id: 'state',
    number: 3,
    title: 'State & Context',
    question: 'How does my agent retain and manage what it knows across steps?',
    description: 'Where agents keep what they need across steps, sessions, and restarts.',
  },
  {
    id: 'interfaces',
    number: 4,
    title: 'Interfaces & Transport',
    question: 'How do agents and tools communicate with each other and external systems?',
    description: 'The wire formats and protocols between agents and external systems.',
  },
  {
    id: 'methodology',
    number: 5,
    title: 'Methodology',
    question: 'What principles should guide how I design and operate agent systems?',
    description: 'Cross-cutting design principles, applied to all of the above.',
  },
]
