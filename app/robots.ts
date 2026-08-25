import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * The catalog is public and meant to be indexed. What is not:
 *
 *   /admin      someone else's dashboard, and gated anyway
 *   /api        JSON, useless in results
 *   /sign-in    thin auth pages that would compete with the catalog for the
 *   /sign-up    brand query and win nothing
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
