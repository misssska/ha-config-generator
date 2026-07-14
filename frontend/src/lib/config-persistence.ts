import type {
  AdcAttenuation,
  BinaryDeviceClass,
  BoardOption,
  EsphomeFormSnapshot,
  LoggerLevel,
  PullMode,
  RestoreMode,
} from "@/types/esphome";

export const CONFIG_STORAGE_KEY =
  "ha-config-generator.form.v1";

export const CONFIG_FILE_FORMAT =
  "ha-config-generator";

export const CONFIG_FILE_VERSION = 1;

type ConfigurationFileV1 = {
  format: typeof CONFIG_FILE_FORMAT;
  version: typeof CONFIG_FILE_VERSION;
  exportedAt: string;
  config: EsphomeFormSnapshot;
};

const LOGGER_LEVELS = new Set<LoggerLevel>([
  "NONE",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "VERBOSE",
  "VERY_VERBOSE",
]);

const RESTORE_MODES = new Set<RestoreMode>([
  "ALWAYS_OFF",
  "ALWAYS_ON",
  "RESTORE_DEFAULT_OFF",
  "RESTORE_DEFAULT_ON",
]);

const PULL_MODES = new Set<PullMode>([
  "NONE",
  "PULLUP",
  "PULLDOWN",
]);

const DEVICE_CLASSES = new Set<BinaryDeviceClass>([
  "",
  "door",
  "window",
  "garage_door",
  "opening",
  "motion",
  "occupancy",
  "safety",
  "problem",
  "smoke",
  "moisture",
  "gas",
  "vibration",
  "tamper",
  "running",
]);

const ADC_ATTENUATIONS = new Set<AdcAttenuation>([
  "auto",
  "0db",
  "2.5db",
  "6db",
  "12db",
]);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${label}: érvénytelen objektum.`);
  }

  return value;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  label: string,
): string {
  const value = object[key];

  if (typeof value !== "string") {
    throw new Error(`${label}: szöveges érték szükséges.`);
  }

  return value;
}

function requireBoolean(
  object: Record<string, unknown>,
  key: string,
  label: string,
): boolean {
  const value = object[key];

  if (typeof value !== "boolean") {
    throw new Error(`${label}: logikai érték szükséges.`);
  }

  return value;
}

function requireInteger(
  object: Record<string, unknown>,
  key: string,
  label: string,
  minimum: number,
  maximum: number,
): number {
  const value = object[key];

  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new Error(
      `${label}: ${minimum} és ${maximum} közötti ` +
        "egész szám szükséges.",
    );
  }

  return value as number;
}

function requireArray(
  object: Record<string, unknown>,
  key: string,
  label: string,
  maximumLength: number,
): unknown[] {
  const value = object[key];

  if (!Array.isArray(value)) {
    throw new Error(`${label}: lista szükséges.`);
  }

  if (value.length > maximumLength) {
    throw new Error(
      `${label}: legfeljebb ${maximumLength} elem lehet.`,
    );
  }

  return value;
}

function requireEnum<T extends string>(
  value: string,
  allowedValues: Set<T>,
  label: string,
): T {
  if (!allowedValues.has(value as T)) {
    throw new Error(`${label}: nem támogatott érték.`);
  }

  return value as T;
}

function validateClientIds(
  values: Array<{ clientId: number }>,
  label: string,
): void {
  const ids = new Set<number>();

  for (const value of values) {
    if (ids.has(value.clientId)) {
      throw new Error(
        `${label}: ismétlődő belső azonosító.`,
      );
    }

    ids.add(value.clientId);
  }
}

export function createDefaultEsphomeFormSnapshot():
  EsphomeFormSnapshot {
  return {
    deviceName: "muhely-vezerlo",
    friendlyName: "Műhely vezérlő",
    board: "esp32dev",
    includeFallbackAp: true,
    networkSettings: {
      wifiUseSecrets: true,
      wifiSsid: "WIFI_NEVE",
      wifiPassword: "WIFI_JELSZO",
      useStaticIp: false,
      staticIp: "",
      gateway: "",
      subnet: "255.255.255.0",
      dns1: "",
      dns2: "",
      fallbackApSsid: "",
      fallbackApPassword: "",
      apiEncryptionEnabled: true,
      otaEnabled: true,
      loggerLevel: "DEBUG",
    },
    systemFeatures: {
      includeUptimeSensor: true,
      includeWifiSignalSensor: true,
      includeRestartButton: true,
    },
    statusLed: null,
    pwmOutputs: [],
    adcInputs: [],
    relays: [
      {
        clientId: 1,
        name: "Műhely világítás",
        pin: 23,
        inverted: true,
        restoreMode: "ALWAYS_OFF",
      },
    ],
    binarySensors: [
      {
        clientId: 1,
        name: "Műhelyajtó",
        pin: 22,
        inverted: true,
        pullMode: "PULLUP",
        deviceClass: "door",
        delayedOnMs: 20,
        delayedOffMs: 20,
      },
    ],
  };
}

export function sanitizeConfiguration(
  snapshot: EsphomeFormSnapshot,
): EsphomeFormSnapshot {
  return {
    ...snapshot,
    networkSettings: {
      ...snapshot.networkSettings,
      wifiPassword: "",
      fallbackApPassword: "",
    },
    systemFeatures: {
      ...snapshot.systemFeatures,
    },
    statusLed: snapshot.statusLed
      ? {
          ...snapshot.statusLed,
        }
      : null,
    pwmOutputs: snapshot.pwmOutputs.map((output) => ({
      ...output,
    })),
    adcInputs: snapshot.adcInputs.map((input) => ({
      ...input,
    })),
    relays: snapshot.relays.map((relay) => ({
      ...relay,
    })),
    binarySensors: snapshot.binarySensors.map(
      (sensor) => ({
        ...sensor,
      }),
    ),
  };
}

export function serializeConfiguration(
  snapshot: EsphomeFormSnapshot,
  exportedAt = new Date(),
): string {
  const file: ConfigurationFileV1 = {
    format: CONFIG_FILE_FORMAT,
    version: CONFIG_FILE_VERSION,
    exportedAt: exportedAt.toISOString(),
    config: sanitizeConfiguration(snapshot),
  };

  return JSON.stringify(file, null, 2);
}

export function parseConfiguration(
  content: string,
  boards: readonly BoardOption[] = [],
): EsphomeFormSnapshot {
  let rawValue: unknown;

  try {
    rawValue = JSON.parse(content);
  } catch {
    throw new Error(
      "A kiválasztott fájl nem érvényes JSON.",
    );
  }

  const file = requireRecord(
    rawValue,
    "Konfigurációs fájl",
  );

  if (file.format !== CONFIG_FILE_FORMAT) {
    throw new Error(
      "A fájl nem HA Config Generator konfiguráció.",
    );
  }

  if (file.version !== CONFIG_FILE_VERSION) {
    throw new Error(
      "A konfigurációs fájl verziója nem támogatott.",
    );
  }

  if (typeof file.exportedAt !== "string") {
    throw new Error(
      "A konfiguráció exportálási dátuma hiányzik.",
    );
  }

  const config = requireRecord(
    file.config,
    "Konfiguráció",
  );

  const deviceName = requireString(
    config,
    "deviceName",
    "ESPHome eszköznév",
  );

  if (
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
      deviceName,
    ) ||
    deviceName.length > 31
  ) {
    throw new Error(
      "Az ESPHome eszköznév formátuma érvénytelen.",
    );
  }

  const friendlyName = requireString(
    config,
    "friendlyName",
    "Megjelenített név",
  );

  if (
    friendlyName.length < 1 ||
    friendlyName.length > 64
  ) {
    throw new Error(
      "A megjelenített név hossza érvénytelen.",
    );
  }

  const board = requireString(
    config,
    "board",
    "Alaplap",
  );

  if (
    boards.length > 0 &&
    !boards.some((option) => option.id === board)
  ) {
    throw new Error(
      `A konfigurációban szereplő alaplap nem elérhető: ${board}.`,
    );
  }

  const network = requireRecord(
    config.networkSettings,
    "Hálózati beállítások",
  );

  const loggerLevel = requireEnum(
    requireString(
      network,
      "loggerLevel",
      "Naplózási szint",
    ),
    LOGGER_LEVELS,
    "Naplózási szint",
  );

  const system = requireRecord(
    config.systemFeatures,
    "Rendszerfunkciók",
  );

  let statusLed = null;

  if (config.statusLed !== null) {
    const status = requireRecord(
      config.statusLed,
      "Státusz-LED",
    );

    statusLed = {
      pin: requireInteger(
        status,
        "pin",
        "Státusz-LED GPIO",
        0,
        48,
      ),
      inverted: requireBoolean(
        status,
        "inverted",
        "Státusz-LED invertálás",
      ),
    };
  }

  const pwmOutputs = requireArray(
    config,
    "pwmOutputs",
    "PWM-kimenetek",
    8,
  ).map((rawOutput, index) => {
    const output = requireRecord(
      rawOutput,
      `PWM-kimenet ${index + 1}`,
    );

    return {
      clientId: requireInteger(
        output,
        "clientId",
        "PWM belső azonosító",
        1,
        1_000_000,
      ),
      name: requireString(
        output,
        "name",
        "PWM-név",
      ),
      pin: requireInteger(
        output,
        "pin",
        "PWM GPIO",
        0,
        48,
      ),
      inverted: requireBoolean(
        output,
        "inverted",
        "PWM invertálás",
      ),
      frequencyHz: requireInteger(
        output,
        "frequencyHz",
        "PWM-frekvencia",
        10,
        40000,
      ),
    };
  });

  const adcInputs = requireArray(
    config,
    "adcInputs",
    "ADC-bemenetek",
    8,
  ).map((rawInput, index) => {
    const input = requireRecord(
      rawInput,
      `ADC-bemenet ${index + 1}`,
    );

    return {
      clientId: requireInteger(
        input,
        "clientId",
        "ADC belső azonosító",
        1,
        1_000_000,
      ),
      name: requireString(
        input,
        "name",
        "ADC-név",
      ),
      pin: requireInteger(
        input,
        "pin",
        "ADC GPIO",
        0,
        48,
      ),
      updateIntervalS: requireInteger(
        input,
        "updateIntervalS",
        "ADC frissítési idő",
        1,
        3600,
      ),
      attenuation: requireEnum(
        requireString(
          input,
          "attenuation",
          "ADC-csillapítás",
        ),
        ADC_ATTENUATIONS,
        "ADC-csillapítás",
      ),
    };
  });

  const relays = requireArray(
    config,
    "relays",
    "Relék",
    8,
  ).map((rawRelay, index) => {
    const relay = requireRecord(
      rawRelay,
      `Relé ${index + 1}`,
    );

    return {
      clientId: requireInteger(
        relay,
        "clientId",
        "Relé belső azonosító",
        1,
        1_000_000,
      ),
      name: requireString(
        relay,
        "name",
        "Relé neve",
      ),
      pin: requireInteger(
        relay,
        "pin",
        "Relé GPIO",
        0,
        48,
      ),
      inverted: requireBoolean(
        relay,
        "inverted",
        "Relé invertálás",
      ),
      restoreMode: requireEnum(
        requireString(
          relay,
          "restoreMode",
          "Relé indulási állapot",
        ),
        RESTORE_MODES,
        "Relé indulási állapot",
      ),
    };
  });

  const binarySensors = requireArray(
    config,
    "binarySensors",
    "Digitális bemenetek",
    16,
  ).map((rawSensor, index) => {
    const sensor = requireRecord(
      rawSensor,
      `Digitális bemenet ${index + 1}`,
    );

    return {
      clientId: requireInteger(
        sensor,
        "clientId",
        "Bemenet belső azonosító",
        1,
        1_000_000,
      ),
      name: requireString(
        sensor,
        "name",
        "Bemenet neve",
      ),
      pin: requireInteger(
        sensor,
        "pin",
        "Bemeneti GPIO",
        0,
        48,
      ),
      inverted: requireBoolean(
        sensor,
        "inverted",
        "Bemenet invertálás",
      ),
      pullMode: requireEnum(
        requireString(
          sensor,
          "pullMode",
          "Belső ellenállás",
        ),
        PULL_MODES,
        "Belső ellenállás",
      ),
      deviceClass: requireEnum(
        requireString(
          sensor,
          "deviceClass",
          "Eszközosztály",
        ),
        DEVICE_CLASSES,
        "Eszközosztály",
      ),
      delayedOnMs: requireInteger(
        sensor,
        "delayedOnMs",
        "Bekapcsolási szűrés",
        0,
        10000,
      ),
      delayedOffMs: requireInteger(
        sensor,
        "delayedOffMs",
        "Kikapcsolási szűrés",
        0,
        10000,
      ),
    };
  });

  validateClientIds(pwmOutputs, "PWM-kimenetek");
  validateClientIds(adcInputs, "ADC-bemenetek");
  validateClientIds(relays, "Relék");
  validateClientIds(
    binarySensors,
    "Digitális bemenetek",
  );

  return sanitizeConfiguration({
    deviceName,
    friendlyName,
    board,
    includeFallbackAp: requireBoolean(
      config,
      "includeFallbackAp",
      "Fallback AP",
    ),
    networkSettings: {
      wifiUseSecrets: requireBoolean(
        network,
        "wifiUseSecrets",
        "Wi-Fi secrets használata",
      ),
      wifiSsid: requireString(
        network,
        "wifiSsid",
        "Wi-Fi SSID",
      ),
      wifiPassword: requireString(
        network,
        "wifiPassword",
        "Wi-Fi-jelszó",
      ),
      useStaticIp: requireBoolean(
        network,
        "useStaticIp",
        "Statikus IP",
      ),
      staticIp: requireString(
        network,
        "staticIp",
        "Statikus IP-cím",
      ),
      gateway: requireString(
        network,
        "gateway",
        "Átjáró",
      ),
      subnet: requireString(
        network,
        "subnet",
        "Alhálózati maszk",
      ),
      dns1: requireString(
        network,
        "dns1",
        "Elsődleges DNS",
      ),
      dns2: requireString(
        network,
        "dns2",
        "Másodlagos DNS",
      ),
      fallbackApSsid: requireString(
        network,
        "fallbackApSsid",
        "Fallback AP neve",
      ),
      fallbackApPassword: requireString(
        network,
        "fallbackApPassword",
        "Fallback AP jelszava",
      ),
      apiEncryptionEnabled: requireBoolean(
        network,
        "apiEncryptionEnabled",
        "API-titkosítás",
      ),
      otaEnabled: requireBoolean(
        network,
        "otaEnabled",
        "OTA-frissítés",
      ),
      loggerLevel,
    },
    systemFeatures: {
      includeUptimeSensor: requireBoolean(
        system,
        "includeUptimeSensor",
        "Üzemidőszenzor",
      ),
      includeWifiSignalSensor: requireBoolean(
        system,
        "includeWifiSignalSensor",
        "Wi-Fi-jelerősség szenzor",
      ),
      includeRestartButton: requireBoolean(
        system,
        "includeRestartButton",
        "Újraindító gomb",
      ),
    },
    statusLed,
    pwmOutputs,
    adcInputs,
    relays,
    binarySensors,
  });
}

export function saveConfigurationToStorage(
  snapshot: EsphomeFormSnapshot,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CONFIG_STORAGE_KEY,
    serializeConfiguration(snapshot),
  );
}

export function loadConfigurationFromStorage(
  boards: readonly BoardOption[] = [],
): EsphomeFormSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const content = window.localStorage.getItem(
    CONFIG_STORAGE_KEY,
  );

  if (!content) {
    return null;
  }

  return parseConfiguration(content, boards);
}

export function removeConfigurationFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONFIG_STORAGE_KEY);
}
