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

import PwmOutputEditor from "@/components/PwmOutputEditor";
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
    {
      number: 34,
      label: "GPIO34",
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

describe("PwmOutputEditor", () => {
  it("hozzáad egy PWM-kimenetet", () => {
    const onAdd = vi.fn();

    render(
      <PwmOutputEditor
        currentBoard={board}
        pwmOutputs={[]}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "+ PWM-kimenet",
      }),
    );

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("módosítja és törli a PWM-kimenetet", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <PwmOutputEditor
        currentBoard={board}
        pwmOutputs={[
          {
            clientId: 7,
            name: "Műhely világítás",
            pin: 2,
            frequencyHz: 1000,
            inverted: false,
          },
        ]}
        onAdd={vi.fn()}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />,
    );

    expect(
      screen.getByText("Bootstrapping pin."),
    ).toBeInTheDocument();

    const pinSelect = screen.getByRole("combobox", {
      name: /PWM GPIO-kimenet/i,
    });

    expect(
      screen.getByRole("option", {
        name: "GPIO2 ⚠",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "GPIO4",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", {
        name: "GPIO34",
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /Home Assistant-név/i,
      }),
      {
        target: {
          value: "Ventilátor",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith(
      7,
      {
        name: "Ventilátor",
      },
    );

    fireEvent.change(pinSelect, {
      target: {
        value: "4",
      },
    });

    expect(onUpdate).toHaveBeenCalledWith(
      7,
      {
        pin: 4,
      },
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: /PWM-frekvencia/i,
      }),
      {
        target: {
          value: "5000",
        },
      },
    );

    expect(onUpdate).toHaveBeenCalledWith(
      7,
      {
        frequencyHz: 5000,
      },
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Fordított PWM-működés/i,
      }),
    );

    expect(onUpdate).toHaveBeenCalledWith(
      7,
      {
        inverted: true,
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Törlés",
      }),
    );

    expect(onRemove).toHaveBeenCalledWith(7);
  });
});
