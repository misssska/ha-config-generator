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

import WorkspaceNavigation from "@/components/WorkspaceNavigation";

describe("WorkspaceNavigation", () => {
  it("megjeleníti az állapotot és az eredménygombot", () => {
    render(
      <WorkspaceNavigation
        activeTab="outputs"
        deviceName="muhely-vezerlo"
        boardLabel="ESP32 DevKit"
        persistenceReady
        generating={false}
        generationDisabled={false}
        generatedFileCount={2}
        error=""
        relayCount={2}
        binarySensorCount={3}
        pwmCount={1}
        adcCount={2}
        onTabChange={vi.fn()}
        onOpenResults={vi.fn()}
      />,
    );

    expect(
      screen.getByText("muhely-vezerlo"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Eredmény (2)",
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: "Generálás",
      }),
    ).toBeEnabled();
  });

  it("megnyitja az eredménypanelt", () => {
    const onOpenResults = vi.fn();

    render(
      <WorkspaceNavigation
        activeTab="device"
        deviceName="teszt"
        boardLabel="ESP32"
        persistenceReady
        generating={false}
        generationDisabled={false}
        generatedFileCount={0}
        error=""
        relayCount={1}
        binarySensorCount={1}
        pwmCount={0}
        adcCount={0}
        onTabChange={vi.fn()}
        onOpenResults={onOpenResults}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Eredmény (0)",
      }),
    );

    expect(onOpenResults).toHaveBeenCalledOnce();
  });

  it("megjeleníti a hibát", () => {
    render(
      <WorkspaceNavigation
        activeTab="inputs"
        deviceName="teszt"
        boardLabel="ESP32"
        persistenceReady
        generating
        generationDisabled
        generatedFileCount={0}
        error="GPIO-ütközés található."
        relayCount={0}
        binarySensorCount={1}
        pwmCount={0}
        adcCount={0}
        onTabChange={vi.fn()}
        onOpenResults={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "GPIO-ütközés található.",
    );
  });
});
