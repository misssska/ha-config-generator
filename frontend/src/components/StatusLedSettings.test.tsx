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

import StatusLedSettings from "@/components/StatusLedSettings";
import type { BoardOption } from "@/types/esphome";

const board: BoardOption = {
  id: "esp32dev",
  label: "ESP32 DevKit",
  platform: "esp32",
  pins: [
    {
      number: 2,
      label: "GPIO2",
      can_input: true,
      can_output: true,
      supports_pullup: true,
      supports_pulldown: true,
      supports_pwm: true,
      supports_adc: true,
      warning: "Bootstrapping pin.",
    },
    {
      number: 4,
      label: "GPIO4",
      can_input: true,
      can_output: true,
      supports_pullup: true,
      supports_pulldown: true,
      supports_pwm: true,
      supports_adc: true,
      warning: null,
    },
  ],
};

describe("StatusLedSettings", () => {
  it("engedélyezi a státusz-LED funkciót", () => {
    const onEnable = vi.fn();

    render(
      <StatusLedSettings
        currentBoard={board}
        statusLed={null}
        onEnable={onEnable}
        onDisable={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Státusz-LED engedélyezése/i,
      }),
    );

    expect(onEnable).toHaveBeenCalledTimes(1);
  });

  it("továbbítja a GPIO és invertálás módosítását", () => {
    const onUpdate = vi.fn();

    render(
      <StatusLedSettings
        currentBoard={board}
        statusLed={{
          pin: 2,
          inverted: true,
        }}
        onEnable={vi.fn()}
        onDisable={vi.fn()}
        onUpdate={onUpdate}
      />,
    );

    expect(
      screen.getByText("Bootstrapping pin."),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("combobox", {
        name: /LED GPIO-kimenet/i,
      }),
      {
        target: {
          value: "4",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith({
      pin: 4,
    });

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Fordított LED-működés/i,
      }),
    );

    expect(onUpdate).toHaveBeenCalledWith({
      inverted: false,
    });
  });
});
