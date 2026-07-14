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

import GeneratedProjectDrawer from "@/components/GeneratedProjectDrawer";

describe("GeneratedProjectDrawer", () => {
  it("zárt állapotban nem jelenik meg", () => {
    render(
      <GeneratedProjectDrawer
        open={false}
        generatedFiles={[]}
        onCopy={vi.fn()}
        onDownload={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  it("megjelenik és bezárható", () => {
    const onClose = vi.fn();

    render(
      <GeneratedProjectDrawer
        open
        generatedFiles={[
          {
            filename: "teszt.yaml",
            content: "esphome:",
          },
        ]}
        onCopy={vi.fn()}
        onDownload={vi.fn()}
        onClose={onClose}
      />,
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("teszt.yaml"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Bezárás",
      }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });
});
