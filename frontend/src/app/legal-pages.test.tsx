import {
  renderToStaticMarkup,
} from "react-dom/server";
import {
  describe,
  expect,
  it,
} from "vitest";

import ContactPage from "@/app/kapcsolat/page";
import PrivacyPage from "@/app/adatkezeles/page";
import SiteFooter from "@/components/SiteFooter";
import {
  LANGUAGE_STORAGE_KEY,
} from "@/i18n/translations";
import {
  CONFIG_STORAGE_KEY,
} from "@/lib/config-persistence";
import {
  DATA_CONTROLLER,
} from "@/lib/legal-info";

describe("legal and contact pages", () => {
  it("publishes the required privacy information", () => {
    const markup = renderToStaticMarkup(
      <PrivacyPage />,
    );

    expect(markup).toContain(
      DATA_CONTROLLER.name,
    );
    expect(markup).toContain(
      DATA_CONTROLLER.email,
    );
    expect(markup).toContain(
      DATA_CONTROLLER.location,
    );
    expect(markup).toContain(
      "12 hónapos",
    );
    expect(markup).toContain(
      LANGUAGE_STORAGE_KEY,
    );
    expect(markup).toContain(
      CONFIG_STORAGE_KEY,
    );
    expect(markup).toContain("Vercel Inc.");
    expect(markup).toContain(
      "Render Services, Inc.",
    );
    expect(markup).toContain(
      "Neon, LLC / Databricks",
    );
    expect(markup).toContain(
      "Nemzeti Adatvédelmi",
    );
  });

  it("publishes operator contact details", () => {
    const markup = renderToStaticMarkup(
      <ContactPage />,
    );

    expect(markup).toContain(
      DATA_CONTROLLER.name,
    );
    expect(markup).toContain(
      `mailto:${DATA_CONTROLLER.email}`,
    );
    expect(markup).toContain(
      DATA_CONTROLLER.displayName,
    );
    expect(markup).toContain(
      'href="/adatkezeles"',
    );
  });

  it("links the global footer to legal pages", () => {
    const markup = renderToStaticMarkup(
      <SiteFooter />,
    );

    expect(markup).toContain(
      'href="/adatkezeles"',
    );
    expect(markup).toContain(
      'href="/kapcsolat"',
    );
  });
});
