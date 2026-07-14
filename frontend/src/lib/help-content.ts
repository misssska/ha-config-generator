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
  adcInput: {
    title: "ADC-bemenet",
    description:
      "Az analóg-digitális átalakító egy változó feszültségszintet mér és számszerű értékké alakít.",
    details:
      "Potenciométerekhez és megfelelő kimenetű analóg érzékelőkhöz használható. A bemeneti feszültség soha nem haladhatja meg az alaplap megengedett értékét.",
  },
  adcName: {
    title: "ADC-szenzor neve",
    description:
      "Ezzel a névvel jelenik meg az analóg mérés a Home Assistantban.",
    details:
      "Adj a mért fizikai mennyiségre utaló nevet, például Tartályszint, Nyomás vagy Analóg feszültség.",
  },
  adcPin: {
    title: "ADC GPIO-bemenet",
    description:
      "Ezen az analóg mérésre alkalmas bemeneten történik a feszültség mintavételezése.",
    details:
      "Csak ADC-képes pinek jelennek meg. ESP8266 esetén ez az A0 bemenet. A GPIO-t más funkció nem használhatja.",
    variant: "warning",
  },
  adcUpdateInterval: {
    title: "ADC frissítési idő",
    description:
      "Meghatározza, milyen gyakran végezzen új mérést és küldjön friss értéket az ESPHome.",
    details:
      "Gyorsan változó jelhez kisebb, lassú folyamatokhoz nagyobb érték használható. A túl gyakori frissítés növeli a hálózati és processzorterhelést.",
  },
  adcAttenuation: {
    title: "ESP32 ADC-csillapítás",
    description:
      "Az ESP32 analóg bemenetének mérési tartományát módosítja.",
    details:
      "Általános használatra az Automatikus beállítás ajánlott. A kézi értéket csak az adott ESP32 és a mérendő jel villamos jellemzőinek ismeretében állítsd be.",
    variant: "warning",
  },
  pwmOutput: {
    title: "PWM-kimenet",
    description:
      "Gyors digitális ki- és bekapcsolással szabályozható kimenetet hoz létre.",
    details:
      "Az ESPHome a PWM-kimenetből Home Assistantban szabályozható, egyszínű fény entitást készít. LEDhez, megfelelő meghajtóhoz vagy más PWM-kompatibilis elektronikához használható.",
  },
  pwmName: {
    title: "PWM-kimenet neve",
    description:
      "Ezzel a névvel jelenik meg a szabályozható kimenet a Home Assistantban.",
    details:
      "Adj egyértelmű nevet, például Műhely LED vagy Ventilátor fordulatszám.",
  },
  pwmPin: {
    title: "PWM GPIO-kimenet",
    description:
      "Ezen a GPIO-n állítja elő az ESPHome a PWM-jelet.",
    details:
      "Csak PWM-re alkalmas pinek jelennek meg. A GPIO-t más relé, bemenet, státusz-LED vagy ADC-bemenet nem használhatja.",
    variant: "warning",
  },
  pwmFrequency: {
    title: "PWM-frekvencia",
    description:
      "Megadja, hogy a PWM-jel másodpercenként hányszor ismétlődjön.",
    details:
      "LEDhez gyakran 1000 Hz megfelelő. Motorvezérlőnél, tápegységnél vagy más elektronikánál mindig a meghajtó dokumentációja szerinti frekvenciát használd.",
  },
  pwmInverted: {
    title: "Fordított PWM-logika",
    description:
      "Megfordítja a PWM kitöltési tényezőjének működését.",
    details:
      "Bekapcsolva a 0 százalék teljes kimenetet, a 100 százalék pedig kikapcsolt kimenetet jelenthet. Csak invertált meghajtású elektronikánál használd.",
  },
  statusLed: {
    title: "ESPHome státusz-LED",
    description:
      "Egy LED villogási mintákkal jelzi az ESPHome hálózati és hibaállapotait.",
    details:
      "Ehhez külön GPIO szükséges. Az alaplap beépített LEDje is használható, ha ismert a GPIO száma és a logikai működése.",
  },
  statusLedPin: {
    title: "Státusz-LED GPIO",
    description:
      "Az ESPHome ezen a kimeneten vezérli az állapotjelző LEDet.",
    details:
      "A LEDet megfelelő soros ellenállással használd. Boot-, UART-, USB- vagy beépített LED-funkcióval megosztott pineknél figyelj a megjelenő figyelmeztetésre.",
    variant: "warning",
  },
  statusLedInverted: {
    title: "Fordított LED-logika",
    description:
      "Megfordítja a LED be- és kikapcsolási logikai szintjét.",
    details:
      "Aktív LOW bekötésnél vagy sok alaplapi LEDnél szükséges. Ha a LED fordítva világít, módosítsd ezt a kapcsolót.",
  },
  uptimeSensor: {
    title: "Üzemidő szenzor",
    description:
      "Megmutatja, mennyi idő telt el az ESPHome-eszköz legutóbbi indulása óta.",
    details:
      "Hasznos váratlan újraindulások, tápellátási hibák és instabilitás felismeréséhez. A generált szenzor 60 másodpercenként frissül.",
  },
  wifiSignalSensor: {
    title: "Wi-Fi-jelerősség",
    description:
      "Az eszköz által érzékelt Wi-Fi-jelszintet mutatja dBm mértékegységben.",
    details:
      "A nullához közelebbi érték jobb kapcsolatot jelent. Körülbelül -50 dBm erős, míg -70 dBm már gyengébb kapcsolat.",
  },
  configurationManagement: {
    title: "Konfiguráció mentése",
    description:
      "A beállításokat a böngésző automatikusan megőrzi, illetve JSON-fájlba exportálhatod és később visszatöltheted.",
    details:
      "A jelszavakat biztonsági okból sem a böngészős mentés, sem az exportált fájl nem tartalmazza. Import után ezeket újra meg kell adni.",
  },
  restartButton: {
    title: "Távoli újraindítás",
    description:
      "Újraindító gombot hoz létre a Home Assistant felületén.",
    details:
      "Hibakeresésnél és karbantartásnál hasznos. Megnyomása azonnal újraindítja az eszközt, ezért automatizálásokban körültekintően használd.",
  },
} as const;
