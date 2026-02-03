import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://mind-controlled.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
