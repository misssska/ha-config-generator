"use client";

import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";
import type { SystemFeaturesConfig } from "@/types/esphome";

type SystemFeaturesSettingsProps = {
  settings: SystemFeaturesConfig;
  onChange: (
    updates: Partial<SystemFeaturesConfig>,
  ) => void;
};

export default function SystemFeaturesSettings({
  settings,
  onChange,
}: SystemFeaturesSettingsProps) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          Rendszerfunkciók
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Diagnosztikai szenzorok és távoli karbantartási funkciók.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            htmlFor="include-uptime-sensor"
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
          >
            <input
              id="include-uptime-sensor"
              type="checkbox"
              checked={settings.includeUptimeSensor}
              onChange={(event) =>
                onChange({
                  includeUptimeSensor: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Üzemidő szenzor
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Megmutatja, hány másodperce működik újraindítás nélkül az eszköz.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.uptimeSensor} />
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            htmlFor="include-wifi-signal-sensor"
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
          >
            <input
              id="include-wifi-signal-sensor"
              type="checkbox"
              checked={settings.includeWifiSignalSensor}
              onChange={(event) =>
                onChange({
                  includeWifiSignalSensor: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Wi-Fi-jelerősség szenzor
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                A vezeték nélküli kapcsolat erősségét jelzi dBm értékben.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.wifiSignalSensor} />
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            htmlFor="include-restart-button"
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
          >
            <input
              id="include-restart-button"
              type="checkbox"
              checked={settings.includeRestartButton}
              onChange={(event) =>
                onChange({
                  includeRestartButton: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Újraindítás gomb
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Home Assistantból távolról újraindítható az ESPHome-eszköz.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.restartButton} />
        </div>
      </div>
    </section>
  );
}
