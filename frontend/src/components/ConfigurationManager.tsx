"use client";

import {
  useRef,
  useState,
} from "react";

import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";

type ConfigurationManagerProps = {
  deviceName: string;
  disabled: boolean;
  onExport: () => string;
  onImport: (content: string) => void;
  onReset: () => void;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function ConfigurationManager({
  deviceName,
  disabled,
  onExport,
  onImport,
  onReset,
}: ConfigurationManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] =
    useState<StatusMessage>(null);

  function handleExport(): void {
    try {
      const content = onExport();

      const blob = new Blob([content], {
        type: "application/json;charset=utf-8",
      });

      const objectUrl = URL.createObjectURL(blob);

      const safeDeviceName =
        deviceName
          .trim()
          .replace(/[^a-zA-Z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        "esphome-konfiguracio";

      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download =
        `${safeDeviceName}.ha-config.json`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);

      setStatus({
        type: "success",
        text: "A konfigurációs fájl letöltése elindult.",
      });
    } catch (caughtError) {
      setStatus({
        type: "error",
        text:
          caughtError instanceof Error
            ? caughtError.message
            : "A konfiguráció exportálása sikertelen.",
      });
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const content = await file.text();

      onImport(content);

      setStatus({
        type: "success",
        text:
          "A konfiguráció betöltődött. A jelszavakat " +
          "biztonsági okból újra meg kell adni.",
      });
    } catch (caughtError) {
      setStatus({
        type: "error",
        text:
          caughtError instanceof Error
            ? caughtError.message
            : "A konfiguráció importálása sikertelen.",
      });
    }
  }

  function handleReset(): void {
    const confirmed = window.confirm(
      "Biztosan törlöd a jelenlegi beállításokat, " +
        "és visszaállítod az alapértelmezett konfigurációt?",
    );

    if (!confirmed) {
      return;
    }

    onReset();

    setStatus({
      type: "success",
      text: "Az alapértelmezett konfiguráció visszaállt.",
    });
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Konfiguráció kezelése
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Automatikus böngészős mentés, JSON-export és
            visszatöltés.
          </p>
        </div>

        <HelpPopover {...HELP.configurationManagement} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          disabled={disabled}
          onClick={handleExport}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          JSON export
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          JSON import
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleReset}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Új konfiguráció
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={(event) => {
          void handleFileChange(event);
        }}
        className="hidden"
        aria-label="Konfigurációs JSON-fájl"
      />

      <p className="mt-3 text-xs leading-5 text-amber-300/80">
        A Wi-Fi- és fallback AP-jelszó nem kerül a
        böngészős mentésbe vagy az exportált fájlba.
      </p>

      {status && (
        <div
          role="status"
          className={
            status.type === "success"
              ? "mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200"
              : "mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
          }
        >
          {status.text}
        </div>
      )}
    </section>
  );
}
