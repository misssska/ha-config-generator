import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fetchGenerationStats,
  generateEsphomeProject,
  submitFeedback,
} from "@/lib/esphome-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("submitFeedback", () => {
  it("sends only the feedback form fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accepted: true,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await submitFeedback({
      category: "idea",
      message: "  Please add another board.  ",
      email: " user@example.com ",
    });

    expect(result).toEqual({
      accepted: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    expect(url).toContain("/api/feedback");
    expect(requestInit.method).toBe("POST");

    expect(
      JSON.parse(String(requestInit.body)),
    ).toEqual({
      category: "idea",
      message: "Please add another board.",
      email: "user@example.com",
      website: "",
    });
  });
});

describe("fetchGenerationStats", () => {
  it("lek\u00e9ri a sikeres gener\u00e1l\u00e1sok sz\u00e1m\u00e1t", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        successful_generations: 37,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchGenerationStats();

    expect(result).toEqual({
      successful_generations: 37,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/stats"),
      {
        signal: undefined,
      },
    );
  });
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
