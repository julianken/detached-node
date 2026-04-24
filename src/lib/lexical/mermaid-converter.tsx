import { MermaidDiagram } from '@/components/MermaidDiagram'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

type MermaidBlockFields = { blockType: 'mermaid'; code: string }

export const mermaidConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    mermaid: ({ node }: { node: SerializedBlockNode }) => (
      <MermaidDiagram source={(node.fields as unknown as MermaidBlockFields).code} />
    ),
  },
})
