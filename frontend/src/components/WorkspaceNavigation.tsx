"use client";

import SettingsTabs from "@/components/SettingsTabs";
import type { SettingsTabId } from "@/components/BoardPinout";

type WorkspaceNavigationProps = {
  activeTab: SettingsTabId;
  deviceName: string;
  boardLabel: string | undefined;
  persistenceReady: boolean;
  generating: boolean;
  generationDisabled: boolean;
  generatedFileCount: number;
  error: string;
  relayCount: number;
  binarySensorCount: number;
  pwmCount: number;
  adcCount: number;
  onTabChange: (tabId: SettingsTabId) => void;
  onOpenResults: () => void;
};

export default function WorkspaceNavigation({
  activeTab,
  deviceName,
  boardLabel,
  persistenceReady,
  generating,
  generationDisabled,
  generatedFileCount,
  error,
  relayCount,
  binarySensorCount,
  pwmCount,
  adcCount,
  onTabChange,
  onOpenResults,
}: WorkspaceNavigationProps) {
  const outputCount = relayCount + pwmCount;
  const inputCount = binarySensorCount + adcCount;

  return (
    <section className="sticky top-2 z-30 -mx-4 border-y border-slate-700/80 bg-slate-900/95 px-3 py-3 shadow-xl shadow-slate-950/50 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={[
                "h-2.5 w-2.5 shrink-0 rounded-full",
                persistenceReady
                  ? "bg-emerald-400"
                  : "animate-pulse bg-amber-400",
              ].join(" ")}
              aria-hidden="true"
            />

            <strong className="truncate text-sm">
              {deviceName.trim() || "Névtelen eszköz"}
            </strong>
          </div>

          <p className="mt-1 truncate text-[10px] text-slate-500">
            {boardLabel ?? "Alaplap betöltése..."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-200 sm:inline-flex">
            {outputCount} kimenet
          </span>

          <span className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[9px] text-violet-200 sm:inline-flex">
            {inputCount} bemenet
          </span>

          <button
            type="button"
            onClick={onOpenResults}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            Eredmény ({generatedFileCount})
          </button>

          <button
            type="submit"
            disabled={generationDisabled}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {generating
              ? "Generálás..."
              : "Generálás"}
          </button>
        </div>
      </div>

      <SettingsTabs
        activeTab={activeTab}
        relayCount={relayCount}
        binarySensorCount={binarySensorCount}
        pwmCount={pwmCount}
        adcCount={adcCount}
        onChange={onTabChange}
      />

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
        >
          {error}
        </div>
      )}
    </section>
  );
}
