import { MetadataRoute } from "next";
import { logWarning } from "@/lib/logging";
import { getPublishedPosts } from "@/lib/queries/posts";
import { getPublishedPages } from "@/lib/queries/pages";

const siteUrl =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://detached-node.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Fetch published posts
  const posts = await getPublishedPosts();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  logWarning(
    `Successfully added ${postRoutes.length} posts to sitemap`,
    { count: postRoutes.length }
  );

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

  logWarning(
    `Successfully added ${pageRoutes.length} pages to sitemap`,
    { count: pageRoutes.length }
  );

  return [...staticRoutes, ...postRoutes, ...pageRoutes];
}
