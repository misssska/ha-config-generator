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

import AdcInputEditor from "@/components/AdcInputEditor";
import type { BoardOption } from "@/types/esphome";

const esp32Board: BoardOption = {
  id: "esp32dev",
  label: "ESP32 DevKit",
  platform: "esp32",
  pins: [
    {
      number: 25,
      label: "GPIO25",
      can_input: true,
      can_output: true,
      supports_pullup: true,
      supports_pulldown: true,
      supports_pwm: true,
      supports_adc: true,
      warning: null,
    },
    {
      number: 34,
      label: "GPIO34",
      can_input: true,
      can_output: false,
      supports_pullup: false,
      supports_pulldown: false,
      supports_pwm: false,
      supports_adc: true,
      warning: "Csak bemenetként használható.",
    },
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
  ],
};

const esp8266Board: BoardOption = {
  id: "d1_mini",
  label: "Wemos D1 Mini",
  platform: "esp8266",
  pins: [
    {
      number: 17,
      label: "A0",
      can_input: true,
      can_output: false,
      supports_pullup: false,
      supports_pulldown: false,
      supports_pwm: false,
      supports_adc: true,
      warning: null,
    },
  ],
};

describe("AdcInputEditor", () => {
  it("hozzáad egy ADC-bemenetet", () => {
    const onAdd = vi.fn();

    render(
      <AdcInputEditor
        currentBoard={esp32Board}
        adcInputs={[]}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "+ ADC-bemenet",
      }),
    );

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("módosítja és törli az ESP32 ADC-bemenetet", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <AdcInputEditor
        currentBoard={esp32Board}
        adcInputs={[
          {
            clientId: 9,
            name: "Analóg érzékelő",
            pin: 34,
            updateIntervalS: 60,
            attenuation: "auto",
          },
        ]}
        onAdd={vi.fn()}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />,
    );

    expect(
      screen.getByText("Csak bemenetként használható."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "GPIO25",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "GPIO34 ⚠",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", {
        name: "GPIO22",
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /Home Assistant-név/i,
      }),
      {
        target: {
          value: "Nyomásérzékelő",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith(
      9,
      {
        name: "Nyomásérzékelő",
      },
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: /ADC GPIO-bemenet/i,
      }),
      {
        target: {
          value: "25",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith(
      9,
      {
        pin: 25,
      },
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: /Frissítési idő/i,
      }),
      {
        target: {
          value: "30",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith(
      9,
      {
        updateIntervalS: 30,
      },
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: /ADC-csillapítás/i,
      }),
      {
        target: {
          value: "12db",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith(
      9,
      {
        attenuation: "12db",
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Törlés",
      }),
    );

    expect(onRemove).toHaveBeenCalledWith(9);
  });

  it("ESP8266 esetén elrejti a csillapítást", () => {
    render(
      <AdcInputEditor
        currentBoard={esp8266Board}
        adcInputs={[
          {
            clientId: 11,
            name: "A0 feszültség",
            pin: 17,
            updateIntervalS: 60,
            attenuation: "auto",
          },
        ]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        /ESP8266 esetén az analóg mérés az A0 bemenetet használja/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "A0",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("combobox", {
        name: /ADC-csillapítás/i,
      }),
    ).not.toBeInTheDocument();
  });
});
