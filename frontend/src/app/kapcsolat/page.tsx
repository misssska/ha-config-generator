import type {
  Metadata,
} from "next";
import Link from "next/link";

import LegalPageLayout from "@/components/LegalPageLayout";
import {
  DATA_CONTROLLER,
} from "@/lib/legal-info";

export const metadata: Metadata = {
  title: "Kapcsolat",
  description:
    "Kapcsolat és üzemeltetői információk a HA Config Generatorhoz.",
  alternates: {
    canonical: "/kapcsolat",
  },
};

const sectionClass =
  "rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8";

const headingClass =
  "text-xl font-semibold text-slate-100";

const paragraphClass =
  "mt-3 text-sm leading-7 text-slate-400";

export default function ContactPage() {
  return (
    <LegalPageLayout
      eyebrow="HA Config Generator"
      title="Kapcsolat és névjegy"
      intro="Az oldal egy független, magánszemély által fejlesztett ESPHome-konfigurációgenerátor."
    >
      <section className={sectionClass}>
        <h2 className={headingClass}>
          Üzemeltető
        </h2>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-[190px_minmax(0,1fr)]">
          <dt className="font-medium text-slate-300">
            Név
          </dt>
          <dd className="text-slate-400">
            {DATA_CONTROLLER.name},{" "}
            {DATA_CONTROLLER.type}
          </dd>

          <dt className="font-medium text-slate-300">
            Megjelenési név
          </dt>
          <dd className="text-slate-400">
            {DATA_CONTROLLER.displayName}
          </dd>

          <dt className="font-medium text-slate-300">
            Hely
          </dt>
          <dd className="text-slate-400">
            {DATA_CONTROLLER.location}
          </dd>
        </dl>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          Kapcsolattartás
        </h2>

        <p className={paragraphClass}>
          Technikai kérdés, hibajelentés, fejlesztési
          javaslat vagy adatvédelmi kérelem esetén ezen
          a címen lehet kapcsolatba lépni:
        </p>

        <a
          href={`mailto:${DATA_CONTROLLER.email}`}
          className="mt-4 inline-flex rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        >
          {DATA_CONTROLLER.email}
        </a>

        <p className={paragraphClass}>
          A normál technikai megkereséseknél garantált
          ügyfélszolgálati válaszidő nincs.
          Adatvédelmi kérelmek kezelése a vonatkozó
          jogszabályi határidők szerint történik.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          Visszajelzés
        </h2>

        <p className={paragraphClass}>
          Hibák és fejlesztési ötletek a főoldalon
          található Visszajelzés gombbal is elküldhetők.
          Bizalmas adatot, Wi-Fi-jelszót, API-kulcsot vagy teljes
          secrets.yaml fájlt nem szabad az üzenetbe másolni.
        </p>

        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
        >
          Konfigurátor megnyitása
        </Link>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          Felelősségteljes használat
        </h2>

        <p className={paragraphClass}>
          A generált konfigurációt telepítés előtt
          mindig ellenőrizni kell. A helytelen GPIO-kiosztás
          vagy elektromos bekötés eszközkárt,
          adatvesztést vagy balesetveszélyt okozhat.
        </p>

        <p className={paragraphClass}>
          A HA Config Generator független projekt, nem az
          ESPHome vagy a Home Assistant hivatalos szolgáltatása.
        </p>

        <Link
          href="/adatkezeles"
          className="mt-4 inline-flex text-sm font-semibold text-emerald-300 underline decoration-emerald-500/40 underline-offset-4 hover:text-emerald-200"
        >
          Adatkezelési tájékoztató
        </Link>
      </section>
    </LegalPageLayout>
  );
}
