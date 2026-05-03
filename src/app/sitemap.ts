import { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getPublishedPages } from "@/lib/queries/pages";
import { siteUrl } from "@/lib/site-config";
import { PATTERNS } from "@/data/agentic-design-patterns/index";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Note: /failure-modes is removed pending coordination with issue #150 which
  // retires that route. Re-add only if #150 is closed without removal.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Agentic Design Patterns: hub + changelog + 23 satellite URLs.
  // Total ADP entries: 25 (asserted in CI via grep on /agentic-design-patterns).
  const adpHubRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/agentic-design-patterns`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/agentic-design-patterns/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
  const adpSatelliteRoutes: MetadataRoute.Sitemap = PATTERNS.filter(
    (p) => !p.archived,
  ).map((p) => ({
    url: `${siteUrl}/agentic-design-patterns/${p.slug}`,
    lastModified: new Date(p.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Fetch published posts
  const posts = await getPublishedPosts();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch published pages
  const pages = await getPublishedPages();
  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((page) => page.slug !== "about") // About already in static routes
    .map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...adpHubRoutes,
    ...adpSatelliteRoutes,
    ...postRoutes,
    ...pageRoutes,
  ];
}
