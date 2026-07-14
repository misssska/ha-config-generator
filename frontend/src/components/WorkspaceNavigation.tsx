
"use client";

import SettingsTabs from "@/components/SettingsTabs";
import type {
  SettingsTabId,
} from "@/components/BoardPinout";
import type {
  BoardConnectionState,
} from "@/hooks/useEsphomeBoards";
import {
  useLanguage,
} from "@/i18n/LanguageProvider";

type WorkspaceNavigationProps = {
  activeTab: SettingsTabId;
  deviceName: string;
  boardLabel: string | undefined;
  boardConnectionState: BoardConnectionState;
  persistenceReady: boolean;
  generating: boolean;
  generationDisabled: boolean;
  generatedFileCount: number;
  error: string;
  relayCount: number;
  binarySensorCount: number;
  pwmCount: number;
  adcCount: number;
  onTabChange: (
    tabId: SettingsTabId,
  ) => void;
  onOpenResults: () => void;
  onRetryBoards: () => void;
};

export default function WorkspaceNavigation({
  activeTab,
  deviceName,
  boardLabel,
  boardConnectionState,
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
  onRetryBoards,
}: WorkspaceNavigationProps) {
  const { t } = useLanguage();

  const outputCount =
    relayCount + pwmCount;

  const inputCount =
    binarySensorCount + adcCount;

  const boardStatus =
    boardConnectionState === "ready"
      ? boardLabel ?? t("workspace.loadingBoard")
      : boardConnectionState === "waking"
        ? t("workspace.serverWaking")
        : boardConnectionState === "error"
          ? t("workspace.serverUnavailable")
          : t("workspace.connectingServer");

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
              {deviceName.trim() ||
                t("workspace.unnamedDevice")}
            </strong>
          </div>

          <p
            className="mt-1 truncate text-[10px] text-slate-500"
            aria-live="polite"
          >
            {boardStatus}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-200 sm:inline-flex">
            {t(
              "workspace.outputCount",
              {
                count: outputCount,
              },
            )}
          </span>

          <span className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[9px] text-violet-200 sm:inline-flex">
            {t(
              "workspace.inputCount",
              {
                count: inputCount,
              },
            )}
          </span>

          <button
            type="button"
            onClick={onOpenResults}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            {t(
              "workspace.results",
              {
                count: generatedFileCount,
              },
            )}
          </button>

          <button
            type="submit"
            disabled={generationDisabled}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {generating
              ? t("workspace.generating")
              : t("workspace.generate")}
          </button>
        </div>
      </div>

      <SettingsTabs
        activeTab={activeTab}
        relayCount={relayCount}
        binarySensorCount={
          binarySensorCount
        }
        pwmCount={pwmCount}
        adcCount={adcCount}
        onChange={onTabChange}
      />

      {boardConnectionState === "waking" && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-xs text-amber-100"
        >
          <span
            className="mt-0.5 h-3 w-3 shrink-0 animate-pulse rounded-full bg-amber-400"
            aria-hidden="true"
          />

          <div>
            <strong>
              {t("workspace.serverWaking")}
            </strong>

            <p className="mt-1 leading-5 text-amber-200/80">
              {t("workspace.serverWakingDetail")}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
        >
          <span>{error}</span>

          {boardConnectionState === "error" && (
            <button
              type="button"
              onClick={onRetryBoards}
              className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-1.5 font-semibold transition hover:bg-red-500/20"
            >
              {t("workspace.retry")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
