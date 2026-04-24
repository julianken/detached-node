import dynamic from 'next/dynamic'

const MermaidClient = dynamic(() => import('./MermaidDiagram.client'), {
  ssr: false,
  loading: () => (
    <div
      className="my-6 min-h-[12rem] animate-pulse rounded-sm bg-zinc-100 dark:bg-zinc-800"
      aria-label="Loading diagram"
    />
  ),
})

export function MermaidDiagram({ source }: { source: string }) {
  return <MermaidClient source={source} />
}
