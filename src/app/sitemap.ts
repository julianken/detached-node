import { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getPublishedPages } from "@/lib/queries/pages";
import { siteUrl } from "@/lib/site-config";
import { PATTERNS } from "@/data/agentic-design-patterns/index";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
    },
    {
      url: `${siteUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
  ];

  // Agentic Design Patterns: hub + changelog + 23 satellite URLs.
  const adpHubRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/agentic-design-patterns`,
      lastModified: new Date(),
      changeFrequency: "weekly",
    },
    {
      url: `${siteUrl}/agentic-design-patterns/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
    },
  ];
  const adpSatelliteRoutes: MetadataRoute.Sitemap = PATTERNS.filter(
    (p) => !p.archived,
  ).map((p) => ({
    url: `${siteUrl}/agentic-design-patterns/${p.slug}`,
    lastModified: new Date(p.dateModified),
    changeFrequency: "monthly" as const,
  }));

  // Fetch published posts
  const posts = await getPublishedPosts();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
  }));

  // Fetch published pages
  const pages = await getPublishedPages();
  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((page) => page.slug !== "about") // About already in static routes
    .map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly" as const,
    }));

  return [
    ...staticRoutes,
    ...adpHubRoutes,
    ...adpSatelliteRoutes,
    ...postRoutes,
    ...pageRoutes,
  ];
}
