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

import SettingsTabs from "@/components/SettingsTabs";

describe("SettingsTabs", () => {
  it("megjeleníti a füleket és az elemszámokat", () => {
    render(
      <SettingsTabs
        activeTab="outputs"
        relayCount={2}
        binarySensorCount={3}
        pwmCount={1}
        adcCount={2}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("tab", {
        name: /Kimenetek 3/i,
      }),
    ).toHaveAttribute(
      "aria-selected",
      "true",
    );

    expect(
      screen.getByRole("tab", {
        name: /Bemenetek 5/i,
      }),
    ).toBeInTheDocument();
  });

  it("átváltja az aktív fület", () => {
    const onChange = vi.fn();

    render(
      <SettingsTabs
        activeTab="device"
        relayCount={1}
        binarySensorCount={1}
        pwmCount={0}
        adcCount={0}
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Automatizálások",
      }),
    );

    expect(onChange).toHaveBeenCalledWith(
      "automations",
    );
  });
});
