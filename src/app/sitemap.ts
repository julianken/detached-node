import { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const siteUrl =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://mind-controlled.vercel.app";

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
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const payload = await getPayload({ config });
    const posts = await payload.find({
      collection: "posts",
      where: { status: { equals: "published" } },
      limit: 1000,
    });

    postRoutes = posts.docs.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Database may not be available during build
  }

  // Fetch published pages
  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const payload = await getPayload({ config });
    const pages = await payload.find({
      collection: "pages",
      where: { status: { equals: "published" } },
      limit: 100,
    });

    pageRoutes = pages.docs
      .filter((page) => page.slug !== "about") // About already in static routes
      .map((page) => ({
        url: `${siteUrl}/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // Database may not be available during build
  }

  return [...staticRoutes, ...postRoutes, ...pageRoutes];
}
