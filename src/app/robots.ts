import type { MetadataRoute } from "next";
import { site } from "lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: site.path, disallow: ["/admin", "/partner", "/account-manager", "/reviewer", "/data-entry", "/api"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
