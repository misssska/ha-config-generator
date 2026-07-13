import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import NetworkSystemSettings from "@/components/NetworkSystemSettings";
import type { NetworkSettingsConfig } from "@/types/esphome";

function createSettings(
  overrides: Partial<NetworkSettingsConfig> = {},
): NetworkSettingsConfig {
  return {
    wifiUseSecrets: true,
    wifiSsid: "MuhelyWiFi",
    wifiPassword: "biztonsagos123",
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
    ...overrides,
  };
}

describe("NetworkSystemSettings", () => {
  it("megjeleníti az alapvető hálózati beállításokat", () => {
    render(
      <NetworkSystemSettings
        settings={createSettings()}
        includeFallbackAp
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Hálózat és rendszer",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Wi-Fi SSID"),
    ).toHaveValue("MuhelyWiFi");

    expect(
      screen.getByLabelText("Wi-Fi-jelszó"),
    ).toHaveValue("biztonsagos123");

    expect(
      screen.getByRole("checkbox", {
        name: /Home Assistant API-titkosítás/i,
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("checkbox", {
        name: /OTA-frissítés/i,
      }),
    ).toBeChecked();
  });

  it("továbbítja a statikus IP kapcsolását", () => {
    const onChange = vi.fn();

    render(
      <NetworkSystemSettings
        settings={createSettings()}
        includeFallbackAp
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Statikus IP-cím/i,
      }),
    );

    expect(onChange).toHaveBeenCalledWith({
      useStaticIp: true,
    });
  });

  it("megjeleníti a statikus IP mezőket", () => {
    render(
      <NetworkSystemSettings
        settings={createSettings({
          useStaticIp: true,
          staticIp: "192.168.22.50",
          gateway: "192.168.22.1",
        })}
        includeFallbackAp
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText("Statikus IP"),
    ).toHaveValue("192.168.22.50");

    expect(
      screen.getByLabelText("Átjáró"),
    ).toHaveValue("192.168.22.1");

    expect(
      screen.getByLabelText("Alhálózati maszk"),
    ).toHaveValue("255.255.255.0");
  });
});
