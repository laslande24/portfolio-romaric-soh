import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { caseStudies } from "@/content/case-studies";
import { siteUrl } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/cv", ...Object.values(caseStudies).map(({ slug }) => `/work/${slug}`)];
  return paths.map((path) => ({
    url: `${siteUrl}/en${path}`,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) },
  }));
}
