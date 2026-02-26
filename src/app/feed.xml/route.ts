import { getPublishedPosts } from "@/lib/queries/posts";
import { siteUrl } from "@/lib/site-config";
import type { Post } from "@/payload-types";

const SITE_TITLE = "Detached Node";
const SITE_DESCRIPTION =
  "Exploring modern agentic AI workflows, autonomous systems, and the philosophy of machine intelligence.";

function toRfc2822(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toUTCString();
  const d = new Date(dateStr);
  // Guard against invalid date strings from malformed Payload data
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    posts = [];
  }

  const items = posts
    .map((post) => {
      const link = escapeXml(`${siteUrl}/posts/${post.slug}`);
      const description = escapeXml(post.summary ?? "");
      const pubDate = toRfc2822(post.publishedAt);
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
