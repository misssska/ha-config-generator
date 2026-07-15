import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

export const SOFTWARE_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": [
    "SoftwareApplication",
    "WebApplication",
  ],
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements:
    "Requires JavaScript and a modern web browser.",
  isAccessibleForFree: true,
  inLanguage: [
    "hu",
    "en",
  ],
  offers: {
    "@type": "Offer",
    price: 0,
  },
} as const;

export function serializeJsonLd(
  value: unknown,
): string {
  return JSON.stringify(value).replace(
    /</g,
    "\\u003c",
  );
}
