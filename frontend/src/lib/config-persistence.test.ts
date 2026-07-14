import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CONFIG_FILE_FORMAT,
  CONFIG_FILE_VERSION,
  createDefaultEsphomeFormSnapshot,
  parseConfiguration,
  serializeConfiguration,
} from "@/lib/config-persistence";
import type { BoardOption } from "@/types/esphome";

const boards: BoardOption[] = [
  {
    id: "esp32dev",
    label: "ESP32 DevKit",
    platform: "esp32",
    pins: [],
  },
];

describe("config-persistence", () => {
  it("létrehozza az alapértelmezett konfigurációt", () => {
    const snapshot =
      createDefaultEsphomeFormSnapshot();

    expect(snapshot.deviceName).toBe("muhely-vezerlo");
    expect(snapshot.board).toBe("esp32dev");
    expect(snapshot.relays).toHaveLength(1);
    expect(snapshot.binarySensors).toHaveLength(1);
  });

  it("verziózott JSON-t készít és kihagyja a jelszavakat", () => {
    const snapshot =
      createDefaultEsphomeFormSnapshot();

    snapshot.networkSettings.wifiPassword =
      "titkos-wifi-jelszo";

    snapshot.networkSettings.fallbackApPassword =
      "titkos-fallback-jelszo";

    const content = serializeConfiguration(
      snapshot,
      new Date("2026-07-14T20:00:00.000Z"),
    );

    const raw = JSON.parse(content);

    expect(raw.format).toBe(CONFIG_FILE_FORMAT);
    expect(raw.version).toBe(CONFIG_FILE_VERSION);
    expect(raw.exportedAt).toBe(
      "2026-07-14T20:00:00.000Z",
    );

    expect(
      raw.config.networkSettings.wifiPassword,
    ).toBe("");

    expect(
      raw.config.networkSettings.fallbackApPassword,
    ).toBe("");

    const restored = parseConfiguration(
      content,
      boards,
    );

    expect(restored.deviceName).toBe(
      snapshot.deviceName,
    );

    expect(restored.relays).toEqual(snapshot.relays);
    expect(
      restored.networkSettings.wifiPassword,
    ).toBe("");
  });

  it("elutasítja a nem támogatott fájlverziót", () => {
    const snapshot =
      createDefaultEsphomeFormSnapshot();

    const raw = JSON.parse(
      serializeConfiguration(snapshot),
    );

    raw.version = 99;

    expect(() =>
      parseConfiguration(
        JSON.stringify(raw),
        boards,
      ),
    ).toThrow(
      "A konfigurációs fájl verziója nem támogatott.",
    );
  });

  it("elutasítja az ismeretlen alaplapot", () => {
    const snapshot =
      createDefaultEsphomeFormSnapshot();

    snapshot.board = "ismeretlen-board";

    const content = serializeConfiguration(snapshot);

    expect(() =>
      parseConfiguration(content, boards),
    ).toThrow(
      "A konfigurációban szereplő alaplap nem elérhető",
    );
  });
});
