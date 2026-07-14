import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import ConfigurationManager from "@/components/ConfigurationManager";

describe("ConfigurationManager", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exportálja a konfigurációt", () => {
    const onExport = vi.fn(
      () => '{"format":"ha-config-generator"}',
    );

    const createObjectUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:config-test");

    const revokeObjectUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    render(
      <ConfigurationManager
        deviceName="muhely-vezerlo"
        disabled={false}
        onExport={onExport}
        onImport={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "JSON export",
      }),
    );

    expect(onExport).toHaveBeenCalledOnce();
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();

    expect(revokeObjectUrl).toHaveBeenCalledWith(
      "blob:config-test",
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "A konfigurációs fájl letöltése elindult.",
    );
  });

  it("betölti a kiválasztott JSON-fájlt", async () => {
    const onImport = vi.fn();

    render(
      <ConfigurationManager
        deviceName="muhely-vezerlo"
        disabled={false}
        onExport={vi.fn()}
        onImport={onImport}
        onReset={vi.fn()}
      />,
    );

    const content =
      '{"format":"ha-config-generator","version":1}';

    const file = new File(
      [content],
      "teszt.ha-config.json",
      {
        type: "application/json",
      },
    );

    fireEvent.change(
      screen.getByLabelText(
        "Konfigurációs JSON-fájl",
      ),
      {
        target: {
          files: [file],
        },
      },
    );

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(content);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "A konfiguráció betöltődött.",
    );
  });

  it("megerősítés után visszaállítja az alapértékeket", () => {
    const onReset = vi.fn();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <ConfigurationManager
        deviceName="muhely-vezerlo"
        disabled={false}
        onExport={vi.fn()}
        onImport={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Új konfiguráció",
      }),
    );

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Az alapértelmezett konfiguráció visszaállt.",
    );
  });
});
