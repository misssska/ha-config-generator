
"use client";

import type {
  SettingsTabId,
} from "@/components/BoardPinout";
import {
  useLanguage,
} from "@/i18n/LanguageProvider";
import type {
  TranslationKey,
} from "@/i18n/translations";

type SettingsTabsProps = {
  activeTab: SettingsTabId;
  relayCount: number;
  binarySensorCount: number;
  pwmCount: number;
  adcCount: number;
  onChange: (
    tabId: SettingsTabId,
  ) => void;
};

const TAB_ITEMS: Array<{
  id: SettingsTabId;
  labelKey: TranslationKey;
}> = [
  {
    id: "device",
    labelKey: "tabs.deviceNetwork",
  },
  {
    id: "outputs",
    labelKey: "tabs.outputs",
  },
  {
    id: "inputs",
    labelKey: "tabs.inputs",
  },
  {
    id: "automations",
    labelKey: "tabs.automations",
  },
];

export default function SettingsTabs({
  activeTab,
  relayCount,
  binarySensorCount,
  pwmCount,
  adcCount,
  onChange,
}: SettingsTabsProps) {
  const { t } = useLanguage();

  function getCount(
    tabId: SettingsTabId,
  ): number | null {
    if (tabId === "outputs") {
      return relayCount + pwmCount;
    }

    if (tabId === "inputs") {
      return (
        binarySensorCount + adcCount
      );
    }

    return null;
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div
        role="tablist"
        aria-label={t("tabs.ariaLabel")}
        className="grid min-w-[650px] grid-cols-4 gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 p-2 sm:min-w-0"
      >
        {TAB_ITEMS.map((tab) => {
          const selected =
            activeTab === tab.id;

          const count =
            getCount(tab.id);

          const label =
            t(tab.labelKey);

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={
                count === null
                  ? label
                  : `${label} ${count}`
              }
              onClick={() =>
                onChange(tab.id)
              }
              className={[
                "flex min-h-10 items-center justify-between gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-left text-xs font-medium transition sm:text-sm",
                selected
                  ? "border-blue-400 bg-blue-500/20 text-blue-100"
                  : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200",
              ].join(" ")}
            >
              <span>{label}</span>

              {count !== null && (
                <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
