import type { MetadataRoute } from "next";
import { SITE } from "@/lib/agent-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/dev/", "/dashboard", "/new"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
