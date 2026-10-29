import type { MetadataRoute } from "next";
import { site } from "lib/content";

// Only public marketing pages; the portal areas are not indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}${site.path}`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
