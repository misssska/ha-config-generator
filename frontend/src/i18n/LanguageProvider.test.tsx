
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import LanguageSelector from "@/components/LanguageSelector";
import {
  LanguageProvider,
  useLanguage,
} from "@/i18n/LanguageProvider";
import {
  LANGUAGE_STORAGE_KEY,
} from "@/i18n/translations";

function TestConsumer() {
  const {
    language,
    t,
  } = useLanguage();

  return (
    <div data-testid="current-language">
      {language}:{t("workspace.generate")}
    </div>
  );
}

function renderLanguageControls() {
  render(
    <LanguageProvider>
      <LanguageSelector />
      <TestConsumer />
    </LanguageProvider>,
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "hu";
  });

  it("magyar nyelvet használ alapértelmezetten", async () => {
    renderLanguageControls();

    const selector =
      screen.getByRole("combobox");

    expect(selector).toHaveValue("hu");
    expect(
      screen.getByTestId("current-language"),
    ).toHaveTextContent(
      "hu:Generálás",
    );

    await waitFor(() => {
      expect(document.documentElement.lang).toBe(
        "hu",
      );

      expect(
        window.localStorage.getItem(
          LANGUAGE_STORAGE_KEY,
        ),
      ).toBe("hu");
    });
  });

  it("betölti és megőrzi az angol nyelvet", async () => {
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      "en",
    );

    renderLanguageControls();

    const selector =
      screen.getByRole("combobox");

    await waitFor(() => {
      expect(selector).toHaveValue("en");

      expect(
        screen.getByTestId("current-language"),
      ).toHaveTextContent(
        "en:Generate",
      );

      expect(document.documentElement.lang).toBe(
        "en",
      );
    });

    fireEvent.change(selector, {
      target: {
        value: "hu",
      },
    });

    await waitFor(() => {
      expect(
        window.localStorage.getItem(
          LANGUAGE_STORAGE_KEY,
        ),
      ).toBe("hu");
    });
  });
});
