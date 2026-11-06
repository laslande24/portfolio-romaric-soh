import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/en/fondations", "/fr/fondations"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
