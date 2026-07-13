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

import SystemFeaturesSettings from "@/components/SystemFeaturesSettings";
import type { SystemFeaturesConfig } from "@/types/esphome";

function createSettings(
  overrides: Partial<SystemFeaturesConfig> = {},
): SystemFeaturesConfig {
  return {
    includeUptimeSensor: true,
    includeWifiSignalSensor: true,
    includeRestartButton: true,
    ...overrides,
  };
}

describe("SystemFeaturesSettings", () => {
  it("megjeleníti az alapértelmezett rendszerfunkciókat", () => {
    render(
      <SystemFeaturesSettings
        settings={createSettings()}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("checkbox", {
        name: /Üzemidő szenzor/i,
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("checkbox", {
        name: /Wi-Fi-jelerősség szenzor/i,
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("checkbox", {
        name: /Újraindítás gomb/i,
      }),
    ).toBeChecked();
  });

  it("továbbítja a Wi-Fi-jelerősség kapcsolását", () => {
    const onChange = vi.fn();

    render(
      <SystemFeaturesSettings
        settings={createSettings()}
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Wi-Fi-jelerősség szenzor/i,
      }),
    );

    expect(onChange).toHaveBeenCalledWith({
      includeWifiSignalSensor: false,
    });
  });
});
