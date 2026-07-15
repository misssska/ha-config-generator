import type {
  Metadata,
} from "next";

import LegalPageLayout from "@/components/LegalPageLayout";
import {
  DATA_CONTROLLER,
  TERMS_LAST_UPDATED,
} from "@/lib/legal-info";

export const metadata: Metadata = {
  title: "Felhasználási feltételek",
  description:
    "A HA Config Generator felhasználási, felelősségi és biztonsági feltételei.",
  alternates: {
    canonical: "/felhasznalasi-feltetelek",
  },
};

const sectionClass =
  "rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8";

const headingClass =
  "text-xl font-semibold text-slate-100";

const paragraphClass =
  "mt-3 text-sm leading-7 text-slate-400";

const listClass =
  "mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-400";

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Jogi és biztonsági információk"
      title="Felhasználási feltételek"
      intro="A HA Config Generator használatával a felhasználó tudomásul veszi az alábbi működési, felelősségi és biztonsági feltételeket."
      updatedAt={TERMS_LAST_UPDATED}
    >
      <section className={sectionClass}>
        <h2 className={headingClass}>
          1. Üzemeltető és hatály
        </h2>

        <p className={paragraphClass}>
          A szolgáltatás üzemeltetője{" "}
          <strong className="text-slate-200">
            {DATA_CONTROLLER.name}
          </strong>
          {" "}
          {DATA_CONTROLLER.type}, megjelenési neve{" "}
          <strong className="text-slate-200">
            {DATA_CONTROLLER.displayName}
          </strong>
          .
        </p>

        <p className={paragraphClass}>
          Ezek a feltételek a HA Config Generator
          webalkalmazás, az általa előállított
          konfigurációs fájlok és a kapcsolódó
          funkciók használatára vonatkoznak.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          2. A szolgáltatás jellege
        </h2>

        <p className={paragraphClass}>
          A HA Config Generator egy díjmentesen,
          regisztráció nélkül használható
          segédeszköz ESPHome-konfigurációk
          elkészítéséhez.
        </p>

        <p className={paragraphClass}>
          A szolgáltatás nem helyettesíti az ESPHome
          dokumentációját, az elektronikai tervezést,
          az érintésvédelmi ellenőrzést vagy
          megfelelően képzett szakember munkáját.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          3. A generált konfiguráció ellenőrzése
        </h2>

        <p className={paragraphClass}>
          A generált YAML- és kapcsolódó fájlokat
          telepítés vagy fordítás előtt minden
          esetben ellenőrizni kell.
        </p>

        <ul className={listClass}>
          <li>
            Ellenőrizni kell az alaplap pontos típusát
            és hardverváltozatát.
          </li>
          <li>
            Ellenőrizni kell a GPIO-kiosztást,
            a bemeneti és kimeneti korlátozásokat.
          </li>
          <li>
            Ellenőrizni kell a jelszinteket, a
            tápfeszültséget, a terhelhetőséget
            és a galvanikus leválasztást.
          </li>
          <li>
            Az ESPHome fordítási figyelmeztetéseit
            és hibáit ki kell javítani.
          </li>
          <li>
            A konfigurációt először biztonságos,
            felügyelt környezetben kell kipróbálni.
          </li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          4. Elektromos és hardverbiztonság
        </h2>

        <p className={paragraphClass}>
          A hibás GPIO-kiosztás, bekötés,
          tápellátás vagy teljesítményillesztés
          eszközkárt, adatvesztést, tüzet,
          áramütést vagy más balesetet okozhat.
        </p>

        <p className={paragraphClass}>
          Hálózati feszültség, nagy teljesítményű
          fogyasztó, motor, fűtés, kazán,
          ipari gép vagy más veszélyes berendezés
          vezérlését kizárólag megfelelő
          képesítéssel, védelmi eszközökkel
          és az alkalmazandó szabályok betartásával
          szabad kialakítani.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          5. Biztonságkritikus felhasználás
        </h2>

        <p className={paragraphClass}>
          A generátor önmagában nem minősített
          biztonsági vezérlő vagy védelmi rendszer.
          Nem használható kizárólagos védelmi
          megoldásként olyan rendszerben, amelynek hibája
          emberi sérülést, tüzet, jelentős
          anyagi kárt vagy környezeti kárt okozhat.
        </p>

        <p className={paragraphClass}>
          A szükséges hardveres reteszeléseket,
          vészleállítást, túláram-,
          túlmelegedés- és egyéb védelmeket
          a szoftvertől függetlenül is meg kell valósítani.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          6. A felhasználó felelőssége
        </h2>

        <p className={paragraphClass}>
          A felhasználó felelős a megadott adatok,
          a kiválasztott hardver, a bekötés, a
          konfiguráció módosítása, telepítése
          és használata helyességéért.
        </p>

        <p className={paragraphClass}>
          A felhasználó köteles gondoskodni a biztonsági
          mentésről, a hozzáférési adatok
          védelméről és arról, hogy jelszó,
          API-kulcs vagy más titkos adat ne kerüljön
          nyilvános vagy illetéktelen személy számára
          hozzáférhető fájlba.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          7. Elérhetőség és pontosság
        </h2>

        <p className={paragraphClass}>
          Az üzemeltető törekszik a szolgáltatás
          helyes és biztonságos működésére,
          de nem garantálja, hogy az minden alaplappal,
          ESPHome-verzióval vagy felhasználási esettel
          hibamentesen működik.
        </p>

        <p className={paragraphClass}>
          A szolgáltatás karbantartás, szolgáltatói
          kiesés vagy műszaki hiba miatt ideiglenesen
          korlátozott vagy elérhetetlen lehet.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          8. Felelősség korlátozása
        </h2>

        <p className={paragraphClass}>
          Az üzemeltető a szolgáltatást jelenlegi
          állapotában biztosítja. A felhasználó
          által elvégzett bekötésből,
          telepítésből, módosításból vagy
          nem megfelelő használatból eredő károkért
          az üzemeltető a jogszabályok által megengedett
          mértékben nem vállal felelősséget.
        </p>

        <p className={paragraphClass}>
          Ez a rendelkezés nem korlátozza és nem zárja
          ki azokat a jogokat vagy felelősségi eseteket,
          amelyek korlátozását vagy kizárását
          a kötelező jogszabályi rendelkezések
          nem teszik lehetővé.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          9. Harmadik felek és függetlenség
        </h2>

        <p className={paragraphClass}>
          A HA Config Generator független projekt. Nem az
          ESPHome, a Home Assistant vagy az Open Home Foundation
          hivatalos terméke, szolgáltatása, támogatója
          vagy tanúsított partnere.
        </p>

        <p className={paragraphClass}>
          Az ESPHome, Home Assistant és egyéb termék- vagy
          márkanevek a megfelelő jogosultak tulajdonában
          állhatnak. E nevek említése kizárólag
          a rendeltetés és a kompatibilitás leírását
          szolgálja.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          10. Módosítás és kapcsolat
        </h2>

        <p className={paragraphClass}>
          Az üzemeltető a szolgáltatás vagy a
          jogszabályi környezet változása esetén
          frissítheti ezeket a feltételeket. Az aktuális
          változat ezen az oldalon érhető el.
        </p>

        <p className={paragraphClass}>
          A feltételekkel kapcsolatos kérdések a{" "}
          <a
            href={`mailto:${DATA_CONTROLLER.email}`}
            className="text-emerald-300 underline decoration-emerald-500/40 underline-offset-4 hover:text-emerald-200"
          >
            {DATA_CONTROLLER.email}
          </a>
          {" "}
          címre küldhetők.
        </p>
      </section>
    </LegalPageLayout>
  );
}
