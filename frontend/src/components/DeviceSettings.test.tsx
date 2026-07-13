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

import DeviceSettings from "@/components/DeviceSettings";

function createProps() {
  return {
    deviceName: "muhely-vezerlo",
    friendlyName: "Műhely vezérlő",
    board: "esp32dev",
    includeFallbackAp: true,
    boards: [],
    boardsLoading: false,
    currentBoard: undefined,
    onDeviceNameChange: vi.fn(),
    onFriendlyNameChange: vi.fn(),
    onBoardChange: vi.fn(),
    onFallbackApChange: vi.fn(),
  };
}

describe("DeviceSettings", () => {
  it("megjeleníti az eszköz alapbeállításait", () => {
    render(<DeviceSettings {...createProps()} />);

    expect(
      screen.getByRole("heading", {
        name: "Eszköz beállításai",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("ESPHome eszköznév"),
    ).toHaveValue("muhely-vezerlo");

    expect(
      screen.getByLabelText("Megjelenített név"),
    ).toHaveValue("Műhely vezérlő");

    expect(
      screen.getByRole("checkbox", {
        name: /Fallback Access Point/i,
      }),
    ).toBeChecked();
  });

  it("továbbítja a mezők módosításait", () => {
    const props = createProps();

    render(<DeviceSettings {...props} />);

    fireEvent.change(
      screen.getByLabelText("ESPHome eszköznév"),
      {
        target: {
          value: "uj-eszkoz",
        },
      },
    );

    expect(
      props.onDeviceNameChange,
    ).toHaveBeenCalledWith("uj-eszkoz");

    fireEvent.change(
      screen.getByLabelText("Megjelenített név"),
      {
        target: {
          value: "Új eszköz",
        },
      },
    );

    expect(
      props.onFriendlyNameChange,
    ).toHaveBeenCalledWith("Új eszköz");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Fallback Access Point/i,
      }),
    );

    expect(
      props.onFallbackApChange,
    ).toHaveBeenCalledWith(false);
  });
});
