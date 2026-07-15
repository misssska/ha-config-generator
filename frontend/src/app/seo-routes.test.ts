import {
  describe,
  expect,
  it,
} from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_URL,
} from "@/lib/site-config";

describe("SEO metadata routes", () => {
  it("publishes the sitemap in robots.txt", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    });
  });

  it("includes the public home page in the sitemap", () => {
    expect(sitemap()).toEqual([
      {
        url: SITE_URL,
        changeFrequency: "weekly",
        priority: 1,
      },
    ]);
  });

  it("uses the HTTPS production URL", () => {
    const siteUrl = new URL(SITE_URL);

    expect(siteUrl.protocol).toBe("https:");
    expect(siteUrl.pathname).toBe("/");
  });

  it("defines a Google verification token", () => {
    expect(
      GOOGLE_SITE_VERIFICATION,
    ).toMatch(/^[A-Za-z0-9_-]{20,}$/);
  });
});
