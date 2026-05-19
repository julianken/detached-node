import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";
import { buildRobotsRules } from "@/lib/robots-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: buildRobotsRules(),
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
