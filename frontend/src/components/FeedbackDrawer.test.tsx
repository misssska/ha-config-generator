import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FeedbackDrawer from "@/components/FeedbackDrawer";
import {
  submitFeedback,
} from "@/lib/esphome-api";

vi.mock("@/lib/esphome-api", () => ({
  submitFeedback: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("FeedbackDrawer", () => {
  it("does not render while closed", () => {
    render(
      <FeedbackDrawer
        open={false}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  it("submits the entered feedback", async () => {
    const user = userEvent.setup();

    vi.mocked(
      submitFeedback,
    ).mockResolvedValue({
      accepted: true,
    });

    render(
      <FeedbackDrawer
        open
        onClose={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText(
        "Kategória",
      ),
      "bug",
    );

    await user.type(
      screen.getByLabelText(
        "Visszajelzés",
      ),
      "A generálás közben hiba jelent meg.",
    );

    await user.type(
      screen.getByLabelText(
        "E-mail-cím",
      ),
      "user@example.com",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Visszajelzés elküldése",
      }),
    );

    await waitFor(() => {
      expect(
        submitFeedback,
      ).toHaveBeenCalledWith({
        category: "bug",
        message:
          "A generálás közben hiba jelent meg.",
        email: "user@example.com",
        website: "",
      });
    });

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent(
      "Köszönjük",
    );
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();

    render(
      <FeedbackDrawer
        open
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
