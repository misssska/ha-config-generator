import {
  renderToStaticMarkup,
} from "react-dom/server";
import {
  describe,
  expect,
  it,
} from "vitest";

import SoftwareApplicationJsonLd from "@/components/SoftwareApplicationJsonLd";
import {
  SOFTWARE_APPLICATION_JSON_LD,
  serializeJsonLd,
} from "@/lib/software-application-jsonld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

describe("SoftwareApplicationJsonLd", () => {
  it("describes the public web application", () => {
    expect(
      SOFTWARE_APPLICATION_JSON_LD,
    ).toMatchObject({
      "@context": "https://schema.org",
      "@type": [
        "SoftwareApplication",
        "WebApplication",
      ],
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory:
        "DeveloperApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: 0,
      },
    });
  });

  it("does not invent ratings or reviews", () => {
    expect(
      SOFTWARE_APPLICATION_JSON_LD,
    ).not.toHaveProperty(
      "aggregateRating",
    );

    expect(
      SOFTWARE_APPLICATION_JSON_LD,
    ).not.toHaveProperty(
      "review",
    );
  });

  it("escapes HTML opening characters", () => {
    expect(
      serializeJsonLd({
        value: "</script>",
      }),
    ).not.toContain("<");
  });

  it("renders valid JSON-LD markup", () => {
    const markup = renderToStaticMarkup(
      <SoftwareApplicationJsonLd />,
    );

    expect(markup).toContain(
      'type="application/ld+json"',
    );

    expect(markup).toContain(
      '"SoftwareApplication"',
    );
  });
});
