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

import BoardPinout from "@/components/BoardPinout";
import type { BoardOption } from "@/types/esphome";

const board: BoardOption = {
  id: "esp32dev",
  label: "ESP32 DevKit",
  platform: "esp32",
  pins: [
    {
      number: 22,
      label: "GPIO22",
      can_input: true,
      can_output: true,
      supports_pullup: true,
      supports_pulldown: true,
      supports_pwm: true,
      supports_adc: false,
      warning: null,
    },
    {
      number: 23,
      label: "GPIO23",
      can_input: true,
      can_output: true,
      supports_pullup: true,
      supports_pulldown: true,
      supports_pwm: true,
      supports_adc: false,
      warning: null,
    },
    {
      number: 0,
      label: "GPIO0",
      can_input: true,
      can_output: true,
      supports_pullup: true,
      supports_pulldown: true,
      supports_pwm: true,
      supports_adc: true,
      warning: "Bootstrapping pin.",
    },
  ],
};

describe("BoardPinout", () => {
  it("minden GPIO-t és táp-pint megjelenít", () => {
    render(
      <BoardPinout
        currentBoard={board}
        statusLed={null}
        pwmOutputs={[]}
        adcInputs={[]}
        relays={[
          {
            clientId: 1,
            name: "Műhely világítás",
            pin: 23,
            inverted: true,
            restoreMode: "ALWAYS_OFF",
          },
        ]}
        binarySensors={[]}
      />,
    );

    expect(
      screen.getByText("ESP32 DevKit"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("3V3"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("VIN / 5V"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Műhely világítás"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /GPIO0.*figyelmeztetés/i,
      }),
    ).toBeDisabled();
  });

  it("a megfelelő fülhöz navigál", () => {
    const onNavigate = vi.fn();

    render(
      <BoardPinout
        currentBoard={board}
        statusLed={null}
        pwmOutputs={[]}
        adcInputs={[]}
        relays={[
          {
            clientId: 1,
            name: "Műhely világítás",
            pin: 23,
            inverted: true,
            restoreMode: "ALWAYS_OFF",
          },
        ]}
        binarySensors={[]}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /GPIO23.*Műhely világítás/i,
      }),
    );

    expect(onNavigate).toHaveBeenCalledWith(
      "outputs",
      "relay-pin-1",
    );
  });

  it("jelzi a GPIO-ütközést", () => {
    render(
      <BoardPinout
        currentBoard={board}
        statusLed={{
          pin: 23,
          inverted: true,
        }}
        pwmOutputs={[]}
        adcInputs={[]}
        relays={[
          {
            clientId: 1,
            name: "Műhely világítás",
            pin: 23,
            inverted: true,
            restoreMode: "ALWAYS_OFF",
          },
        ]}
        binarySensors={[]}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /GPIO23.*ütközés/i,
      }),
    ).toBeInTheDocument();
  });
});
