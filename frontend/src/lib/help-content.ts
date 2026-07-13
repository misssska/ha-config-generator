export const HELP = {
  deviceName: {
    title: "ESPHome eszköznév",
    description:
      "Az eszköz egyedi technikai azonosítója az ESPHome konfigurációban és a hálózaton.",
    details:
      "Kizárólag kisbetűt, számot és kötőjelet használj. Ne kezdődjön vagy végződjön kötőjellel. Példa: muhely-vezerlo.",
  },
  friendlyName: {
    title: "Megjelenített név",
    description:
      "Az eszköz ember számára könnyen olvasható neve, amely a Home Assistant felületén jelenik meg.",
    details:
      "Használhatsz szóközt és magyar ékezetes karaktereket is. Példa: Műhely vezérlő.",
  },
  board: {
    title: "Alaplap kiválasztása",
    description:
      "Meghatározza az ESPHome platformját és azt, hogy mely GPIO-k használhatók biztonságosan.",
    details:
      "Alaplapváltáskor a rendszer megpróbálja a reléket és bemeneteket érvényes, szabad GPIO-kra áthelyezni.",
  },
  fallbackAccessPoint: {
    title: "Fallback Access Point",
    description:
      "Ha az eszköz nem tud csatlakozni a beállított Wi-Fihez, saját ideiglenes Wi-Fi hálózatot indít.",
    details:
      "Ezen keresztül újra elérhetővé válik a konfiguráció. Éles rendszerben használj erős jelszót.",
  },
  relayPin: {
    title: "GPIO-kimenet",
    description:
      "Ez a GPIO vezérli a relémodul bemenetét.",
    details:
      "Csak kimenetre alkalmas pinek jelennek meg. A figyelmeztető jellel jelölt pinek az indulást, USB-t vagy soros kommunikációt is befolyásolhatják.",
  },
  restoreMode: {
    title: "Indulási állapot",
    description:
      "Meghatározza, milyen állapotba kerüljön a relé bekapcsolás vagy újraindítás után.",
    details:
      "Az ALWAYS_OFF általában a legbiztonságosabb. A visszaállításos módok megpróbálják megtartani a korábbi állapotot.",
  },
  relayInverted: {
    title: "Fordított relélogika",
    description:
      "Bekapcsolva az ESPHome megfordítja a GPIO logikai működését.",
    details:
      "Sok relémodul aktív LOW típusú: LOW szintnél kapcsol be. Ezeknél az invertálás általában szükséges.",
  },
  inputPin: {
    title: "GPIO-bemenet",
    description:
      "Ehhez a GPIO-hoz csatlakozik a kapcsoló, végálláskapcsoló vagy digitális érzékelő.",
    details:
      "Egyes pinek csak bemenetek, mások boot-, UART- vagy USB-funkciót is ellátnak. A rendszer ezeket külön jelzi.",
  },
  pullMode: {
    title: "Belső ellenállás",
    description:
      "Megakadályozza, hogy a bemenet bekötetlen vagy nyitott állapotban bizonytalan, lebegő jelet érzékeljen.",
    details:
      "PULLUP: alapállapot HIGH, a kapcsoló általában GND-re zár. PULLDOWN: alapállapot LOW, a kapcsoló általában 3,3 V-ra zár. Ha egyik sem támogatott, külső ellenállás szükséges.",
  },
  deviceClass: {
    title: "Home Assistant eszközosztály",
    description:
      "Megadja a Home Assistantnak, hogy milyen típusú állapotot jelent a bemenet.",
    details:
      "Ez befolyásolja az ikont és az állapot szövegét, például nyitva/zárva, mozgás/nincs mozgás vagy hiba/rendben.",
  },
  delayedOn: {
    title: "Bekapcsolási szűrés",
    description:
      "A jelnek ennyi ideig folyamatosan aktívnak kell maradnia, mielőtt a rendszer bekapcsoltnak tekinti.",
    details:
      "Mechanikus kapcsolóknál 10–50 ms gyakran megfelelő pergésmentesítés. Szenzoroknál hosszabb idővel rövid téves jelek is kiszűrhetők.",
  },
  delayedOff: {
    title: "Kikapcsolási szűrés",
    description:
      "A jelnek ennyi ideig folyamatosan inaktívnak kell maradnia, mielőtt a rendszer kikapcsoltnak tekinti.",
    details:
      "Mechanikus kapcsolóknál 10–50 ms gyakran megfelelő. Nagyobb érték késleltetett kikapcsolást eredményez.",
  },
  inputInverted: {
    title: "Fordított bemeneti logika",
    description:
      "Megfordítja a bemenet aktív és inaktív állapotát.",
    details:
      "PULLUP és GND-re záró kapcsoló esetén a fizikai aktív állapot LOW, ezért általában szükséges az invertálás.",
  },
} as const;
