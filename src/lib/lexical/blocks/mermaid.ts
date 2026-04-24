import type { Block } from 'payload'

export const mermaidBlock: Block = {
  slug: 'mermaid',
  labels: {
    singular: 'Mermaid diagram',
    plural: 'Mermaid diagrams',
  },
  fields: [
    {
      name: 'code',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Mermaid source (e.g. sequenceDiagram, flowchart).',
      },
    },
  ],
}
