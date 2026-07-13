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
  wifiUseSecrets: {
    title: "Wi-Fi-adatok tárolása",
    description:
      "Bekapcsolva az SSID és a Wi-Fi-jelszó a secrets.yaml fájlba kerül.",
    details:
      "Ez az ajánlott megoldás, mert a fő eszközkonfiguráció nem tartalmazza közvetlenül a hozzáférési adatokat.",
  },
  wifiSsid: {
    title: "Wi-Fi SSID",
    description:
      "Annak a 2,4 GHz-es Wi-Fi-hálózatnak a pontos neve, amelyhez az ESP-eszköz csatlakozik.",
    details:
      "A kis- és nagybetűk számítanak. Az ESP8266 és a legtöbb ESP32 nem használ 5 GHz-es Wi-Fi-hálózatot.",
  },
  wifiPassword: {
    title: "Wi-Fi-jelszó",
    description:
      "A kiválasztott Wi-Fi-hálózathoz tartozó jelszó.",
    details:
      "Legalább 8 és legfeljebb 63 karakter. Éles konfigurációban használd a secrets.yaml tárolást.",
  },
  staticIpEnabled: {
    title: "Statikus IP-cím",
    description:
      "Az eszköz DHCP helyett mindig a megadott IP-címet használja.",
    details:
      "Az IP-cím ne ütközzön más eszközzel. A legbiztonságosabb, ha a router DHCP-tartományán kívüli címet vagy DHCP-foglalást használsz.",
  },
  staticIp: {
    title: "Eszköz IP-címe",
    description:
      "Az ESPHome-eszköz állandó IPv4-címe a helyi hálózaton.",
    details:
      "Példa: 192.168.1.50. Ugyanabba az alhálózatba kell tartoznia, mint az átjárónak.",
  },
  gateway: {
    title: "Alapértelmezett átjáró",
    description:
      "Általában a helyi router IPv4-címe.",
    details:
      "Példa: 192.168.1.1. Ezen keresztül éri el az eszköz a helyi hálózaton kívüli címeket.",
  },
  subnet: {
    title: "Alhálózati maszk",
    description:
      "Meghatározza, hogy mely IP-címek tartoznak a helyi hálózathoz.",
    details:
      "Otthoni és kisebb üzemi hálózatokban leggyakrabban 255.255.255.0.",
  },
  dns1: {
    title: "Elsődleges DNS",
    description:
      "A domainnevek IP-címre fordításához elsőként használt DNS-kiszolgáló.",
    details:
      "Általában megadható a router címe. Üresen az ESPHome alapértelmezett működése érvényesül.",
  },
  dns2: {
    title: "Másodlagos DNS",
    description:
      "Tartalék DNS-kiszolgáló, ha az elsődleges nem érhető el.",
    details:
      "Példa: 1.1.1.1 vagy 8.8.8.8. A mező nem kötelező.",
  },
  fallbackApSsid: {
    title: "Fallback AP neve",
    description:
      "Annak a mentő Wi-Fi-hálózatnak a neve, amelyet az eszköz kapcsolódási hiba esetén indít.",
    details:
      "Üresen a rendszer a megjelenített névből automatikusan állítja elő.",
  },
  fallbackApPassword: {
    title: "Fallback AP jelszava",
    description:
      "A mentő Wi-Fi-hálózat hozzáférési jelszava.",
    details:
      "Üresen biztonságos véletlen jelszó készül. Saját jelszó esetén legalább 8 karakter szükséges.",
  },
  apiEncryption: {
    title: "Home Assistant API-titkosítás",
    description:
      "Titkosítja az ESPHome natív API-kommunikációját.",
    details:
      "Ajánlott bekapcsolva hagyni. A rendszer automatikusan létrehozza a szükséges titkosítási kulcsot.",
  },
  ota: {
    title: "OTA-frissítés",
    description:
      "Lehetővé teszi a firmware vezeték nélküli frissítését.",
    details:
      "Ajánlott bekapcsolva hagyni. A generátor automatikusan biztonságos OTA-jelszót készít.",
  },
  loggerLevel: {
    title: "Naplózási szint",
    description:
      "Meghatározza, mennyi diagnosztikai információt írjon ki az ESPHome.",
    details:
      "Általános használatra INFO vagy DEBUG ajánlott. A VERBOSE szintek növelhetik a memória- és processzorterhelést.",
  },
} as const;
