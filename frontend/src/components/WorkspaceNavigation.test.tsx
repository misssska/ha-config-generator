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
        boardConnectionState="ready"
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
        onRetryBoards={vi.fn()}
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
        boardConnectionState="ready"
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
        onRetryBoards={vi.fn()}
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
        boardConnectionState="ready"
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
        onRetryBoards={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "GPIO-ütközés található.",
    );
  });
  it("jelzi, amikor a szerver ebred", () => {
    render(
      <WorkspaceNavigation
        activeTab="device"
        deviceName="teszt"
        boardLabel={undefined}
        boardConnectionState="waking"
        persistenceReady
        generating={false}
        generationDisabled
        generatedFileCount={0}
        error=""
        relayCount={0}
        binarySensorCount={0}
        pwmCount={0}
        adcCount={0}
        onTabChange={vi.fn()}
        onOpenResults={vi.fn()}
        onRetryBoards={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "A szerver \u00e9bred",
    );
  });

  it("hiba utan ujrainditja a kapcsolodast", () => {
    const onRetryBoards = vi.fn();

    render(
      <WorkspaceNavigation
        activeTab="device"
        deviceName="teszt"
        boardLabel={undefined}
        boardConnectionState="error"
        persistenceReady
        generating={false}
        generationDisabled
        generatedFileCount={0}
        error="Failed to fetch"
        relayCount={0}
        binarySensorCount={0}
        pwmCount={0}
        adcCount={0}
        onTabChange={vi.fn()}
        onOpenResults={vi.fn()}
        onRetryBoards={onRetryBoards}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "\u00dajrapr\u00f3b\u00e1l\u00e1s",
      }),
    );

    expect(onRetryBoards).toHaveBeenCalledOnce();
  });

});
