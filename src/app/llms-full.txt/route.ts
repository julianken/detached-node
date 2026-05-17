import { PATTERNS } from "@/data/agentic-design-patterns";
import { getPublishedPosts } from "@/lib/queries/posts";
import { siteUrl } from "@/lib/site-config";

export async function GET(): Promise<Response> {
  const patterns = PATTERNS.filter((p) => !p.archived);
  const posts = await getPublishedPosts();

  const body = `# detached-node.dev — Full Content Index

Generated: ${new Date().toISOString()}

## Agentic Design Patterns (${patterns.length})

${patterns
    .map(
      (p) =>
        `- [${p.name}](${siteUrl}/agentic-design-patterns/${p.slug}) — ${p.oneLineSummary}`,
    )
    .join("\n")}

## Posts (${posts.length})

${posts
    .map(
      (p) =>
        `- [${p.title}](${siteUrl}/posts/${p.slug})${p.summary ? ` — ${p.summary}` : ""}`,
    )
    .join("\n")}

## Static pages

- [Home](${siteUrl}/)
- [About](${siteUrl}/about)
- [Patterns hub](${siteUrl}/agentic-design-patterns)
- [Patterns changelog](${siteUrl}/agentic-design-patterns/changelog)
- [Posts hub](${siteUrl}/posts)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
