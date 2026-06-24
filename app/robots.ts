import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL || "https://jobfinderai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Gated/private app surfaces and per-user share cards have no public SEO
      // value and shouldn't compete with the indexable marketing/jobs pages.
      disallow: ["/dashboard", "/api", "/checkout", "/r/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
