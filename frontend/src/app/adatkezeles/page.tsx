import type {
  Metadata,
} from "next";

import LegalPageLayout from "@/components/LegalPageLayout";
import {
  DATA_CONTROLLER,
  FEEDBACK_RETENTION_MONTHS,
  LOCAL_STORAGE_ITEMS,
  PRIVACY_NOTICE_LAST_UPDATED,
} from "@/lib/legal-info";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató",
  description:
    "A HA Config Generator adatkezelési tájékoztatója.",
  alternates: {
    canonical: "/adatkezeles",
  },
};

const sectionClass =
  "rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8";

const headingClass =
  "text-xl font-semibold text-slate-100";

const paragraphClass =
  "mt-3 text-sm leading-7 text-slate-400";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Jogi információk"
      title="Adatkezelési tájékoztató"
      intro="Ez a tájékoztató bemutatja, hogy a HA Config Generator használata és a visszajelzések beküldése során milyen adatok kezelése történik."
      updatedAt={PRIVACY_NOTICE_LAST_UPDATED}
    >
      <section className={sectionClass}>
        <h2 className={headingClass}>
          1. Az adatkezelő
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
            Kapcsolattartás
          </dt>
          <dd>
            <a
              href={`mailto:${DATA_CONTROLLER.email}`}
              className="text-emerald-300 underline decoration-emerald-500/40 underline-offset-4 hover:text-emerald-200"
            >
              {DATA_CONTROLLER.email}
            </a>
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
          2. A konfigurációgenerátor használata
        </h2>

        <p className={paragraphClass}>
          A generáláshoz megadott eszköz-, GPIO-,
          hálózati és rendszerbeállításokat a
          backend kizárólag a kért ESPHome-fájlok
          előállításához dolgozza fel. Az alkalmazás
          ezeket a konfigurációkat nem menti a
          szerveroldali adatbázisba.
        </p>

        <p className={paragraphClass}>
          Amennyiben a konfiguráció személyes adatot
          tartalmaz, az adatkezelés célja a felhasználó
          által kért funkció biztosítása. A jogalap
          az adatkezelőnek a szolgáltatás működőképes
          és biztonságos nyújtásához fűződő
          jogos érdeke.
        </p>

        <p className={paragraphClass}>
          A sikeres generálások számlálója csak
          egy összesített darabszámot tárol, abból
          egyedi felhasználó nem azonosítható.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          3. Visszajelzések kezelése
        </h2>

        <p className={paragraphClass}>
          A visszajelzési űrlap a választott kategóriát,
          az üzenetet, az opcionálisan megadott
          e-mail-címet és a beküldés időpontját
          tárolja. Az e-mail-cím megadása nem kötelező.
        </p>

        <p className={paragraphClass}>
          Az adatkezelés célja a hibák kivizsgálása,
          a fejlesztési ötletek értékelése és
          szükség esetén a beküldővel való
          kapcsolattartás. A jogalap az adatkezelőnek a
          szolgáltatás javításához és a
          megkeresések megválaszolásához fűződő
          jogos érdeke.
        </p>

        <p className={paragraphClass}>
          A visszajelzéseknél{" "}
          {FEEDBACK_RETENTION_MONTHS} hónapos megőrzési
          szabály érvényesül. A lejárt rekordokat
          az automatikus takarítás a következő
          adatbázis-műveletkor törli. Indokolt kérésre
          az adat korábban is törölhető.
        </p>

        <p className={paragraphClass}>
          A rejtett website mező kizárólag
          automatizált spam felismerésére szolgál;
          az alkalmazás nem menti az adatbázisba.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          4. Helyi böngészős tárolás
        </h2>

        <p className={paragraphClass}>
          Az alkalmazás saját kódja nem használ
          analitikai vagy marketingcélú sütiket. A
          következő funkcionális localStorage
          bejegyzések maradnak a felhasználó
          böngészőjében:
        </p>

        <ul className="mt-4 space-y-3">
          {LOCAL_STORAGE_ITEMS.map((item) => (
            <li
              key={item.key}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-6 text-slate-400"
            >
              <code className="text-emerald-300">
                {item.key}
              </code>
              <span className="mx-2 text-slate-600">
                —
              </span>
              {item.purpose}
            </li>
          ))}
        </ul>

        <p className={paragraphClass}>
          A konfiguráció helyi mentése az alkalmazás
          alaphelyzetbe állításával vagy a
          böngésző webhelyadatai között törölhető.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          5. Adatfeldolgozók és infrastruktúra
        </h2>

        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-400">
          <p>
            <strong className="text-slate-200">
              Vercel Inc.
            </strong>
            {" "}
            — a frontend tárhelye és tartalomkiszolgálása.
            {" "}
            <a
              href="https://vercel.com/legal/dpa"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 underline underline-offset-4"
            >
              Adatfeldolgozási feltételek
            </a>
          </p>

          <p>
            <strong className="text-slate-200">
              Render Services, Inc.
            </strong>
            {" "}
            — a backend és az API tárhelye.
            {" "}
            <a
              href="https://render.com/dpa"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 underline underline-offset-4"
            >
              Adatfeldolgozási feltételek
            </a>
          </p>

          <p>
            <strong className="text-slate-200">
              Neon, LLC / Databricks
            </strong>
            {" "}
            — a PostgreSQL-adatbázis szolgáltatója.
            {" "}
            <a
              href="https://neon.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 underline underline-offset-4"
            >
              Adatvédelmi tájékoztató
            </a>
          </p>
        </div>

        <p className={paragraphClass}>
          A szolgáltatók a működéshez szükséges
          technikai naplóadatokat — például IP-címet,
          kérési időpontot és kapcsolati adatokat —
          saját feltételeik szerint kezelhetik. EGT-n
          kívüli adattovábbításnál az
          alkalmazandó adatfeldolgozási megállapodásokban
          meghatározott garanciák alkalmazandók.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          6. Az érintett jogai
        </h2>

        <p className={paragraphClass}>
          Az érintett a feltételek fennállása esetén
          kérheti a személyes adataihoz való hozzáférést,
          azok helyesbítését, törlését,
          kezelésük korlátozását, tiltakozhat a
          jogos érdeken alapuló adatkezelés ellen, valamint
          gyakorolhatja az adathordozhatósághoz való jogát.
        </p>

        <p className={paragraphClass}>
          A kérelmeket a{" "}
          <a
            href={`mailto:${DATA_CONTROLLER.email}`}
            className="text-emerald-300 underline underline-offset-4"
          >
            {DATA_CONTROLLER.email}
          </a>
          {" "}
          címre lehet elküldeni. A kérelmet főszabály
          szerint egy hónapon belül kezeljük.
        </p>

        <p className={paragraphClass}>
          Az érintett panaszt tehet a Nemzeti Adatvédelmi
          és Információszabadság Hatóságnál,
          illetve bírósághoz fordulhat.
          {" "}
          <a
            href="https://www.naih.hu/"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-300 underline underline-offset-4"
          >
            NAIH hivatalos weboldala
          </a>
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          7. Adatbiztonság és módosítás
        </h2>

        <p className={paragraphClass}>
          Az adatkezelő az adatkezelés jellegéhez igazodó
          technikai és szervezési intézkedéseket alkalmaz.
          Internetes szolgáltatásnál azonban teljes
          kockázatmentesség nem garantálható, ezért
          a visszajelzésben nem szabad jelszót, API-kulcsot
          vagy más bizalmas adatot elküldeni.
        </p>

        <p className={paragraphClass}>
          A tájékoztató a szolgáltatás vagy a
          jogszabályi környezet változása esetén
          frissíthető. Az aktuális változat mindig ezen
          az oldalon érhető el.
        </p>
      </section>
    </LegalPageLayout>
  );
}
