import type { MetadataRoute } from "next";
import { SITE } from "@/lib/agent-content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/index.md`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/llms.txt`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/login`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
