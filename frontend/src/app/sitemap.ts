import type {
  MetadataRoute,
} from "next";

import {
  SITE_URL,
} from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/kapcsolat`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/adatkezeles`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
