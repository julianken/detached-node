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
    description:
      'Patterns that govern the structural shape of an agent system — how steps are ordered, ' +
      'branched, parallelized, and delegated across single-agent and multi-agent topologies.',
  },
  {
    id: 'quality',
    number: 2,
    title: 'Quality & Control Gates',
    question: 'How do I catch errors, enforce safety, and know when to stop?',
    description:
      'Patterns for verifying outputs, enforcing policy constraints, and injecting human judgment ' +
      'at the points where autonomous decisions carry meaningful risk.',
  },
  {
    id: 'state',
    number: 3,
    title: 'State & Context',
    question: 'How does my agent retain and manage what it knows across steps?',
    description:
      'Patterns that manage working memory, persistent state, and context compression — ' +
      'how an agent carries information across turns, steps, and sessions.',
  },
  {
    id: 'interfaces',
    number: 4,
    title: 'Interfaces & Transport',
    question: 'How do agents and tools communicate with each other and external systems?',
    description:
      'Patterns governing the protocols, wire formats, and integration surfaces by which ' +
      'agents expose capabilities to callers and consume capabilities from external systems.',
  },
  {
    id: 'methodology',
    number: 5,
    title: 'Methodology',
    question: 'What principles should guide how I design and operate agent systems?',
    description:
      'Cross-cutting stances and design philosophies that shape how you approach agentic ' +
      'system design as a whole — beyond any single component or interaction pattern.',
  },
]
