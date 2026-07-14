"use client";

import {
  useEffect,
} from "react";

import GeneratedFilesPanel from "@/components/GeneratedFilesPanel";
import type {
  GeneratedFile,
} from "@/types/esphome";

type GeneratedProjectDrawerProps = {
  open: boolean;
  generatedFiles: GeneratedFile[];
  onCopy: (
    content: string,
  ) => void | Promise<void>;
  onDownload: (file: GeneratedFile) => void;
  onClose: () => void;
};

export default function GeneratedProjectDrawer({
  open,
  generatedFiles,
  onCopy,
  onDownload,
  onClose,
}: GeneratedProjectDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Generált ESPHome projekt"
    >
      <button
        type="button"
        aria-label="Eredménypanel bezárása"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      <aside className="relative z-10 flex h-full w-full max-w-5xl flex-col border-l border-slate-700 bg-slate-950 shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              Generált ESPHome projekt
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {generatedFiles.length} fájl készült
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800"
          >
            Bezárás
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <GeneratedFilesPanel
            generatedFiles={generatedFiles}
            onCopy={onCopy}
            onDownload={onDownload}
          />
        </div>
      </aside>
    </div>
  );
}
