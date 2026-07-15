import {
  SOFTWARE_APPLICATION_JSON_LD,
  serializeJsonLd,
} from "@/lib/software-application-jsonld";

export default function SoftwareApplicationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(
          SOFTWARE_APPLICATION_JSON_LD,
        ),
      }}
    />
  );
}
