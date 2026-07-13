import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  generateEsphomeProject,
} from "@/lib/esphome-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("generateEsphomeProject", () => {
  it("elküldi a státusz-LED, PWM és ADC beállításokat", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        files: [],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await generateEsphomeProject({
      deviceName: "gpio-teszt",
      friendlyName: "GPIO teszt",
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
      statusLed: {
        pin: 2,
        inverted: true,
      },
      pwmOutputs: [
        {
          clientId: 1,
          name: " LED-szalag ",
          pin: 25,
          inverted: false,
          frequencyHz: 1220,
        },
      ],
      adcInputs: [
        {
          clientId: 1,
          name: " Analóg érzékelő ",
          pin: 34,
          updateIntervalS: 30,
          attenuation: "auto",
        },
      ],
      relays: [],
      binarySensors: [],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    const requestBody = JSON.parse(
      String(requestInit.body),
    ) as Record<string, unknown>;

    expect(requestBody.status_led).toEqual({
      pin: 2,
      inverted: true,
    });

    expect(requestBody.pwm_outputs).toEqual([
      {
        name: "LED-szalag",
        pin: 25,
        inverted: false,
        frequency_hz: 1220,
      },
    ]);

    expect(requestBody.adc_inputs).toEqual([
      {
        name: "Analóg érzékelő",
        pin: 34,
        update_interval_s: 30,
        attenuation: "auto",
      },
    ]);
  });
});
