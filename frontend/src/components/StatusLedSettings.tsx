"use client";

import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";
import type {
  BoardOption,
  StatusLedConfig,
} from "@/types/esphome";

type StatusLedSettingsProps = {
  currentBoard: BoardOption | undefined;
  statusLed: StatusLedConfig | null;
  onEnable: () => void;
  onDisable: () => void;
  onUpdate: (updates: Partial<StatusLedConfig>) => void;
};

export default function StatusLedSettings({
  currentBoard,
  statusLed,
  onEnable,
  onDisable,
  onUpdate,
}: StatusLedSettingsProps) {
  const pinProfile = currentBoard?.pins.find(
    (pinOption) => pinOption.number === statusLed?.pin,
  );

  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          Státusz-LED
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Az ESPHome kapcsolódási és hibaállapotát jelző LED.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            htmlFor="status-led-enabled"
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
          >
            <input
              id="status-led-enabled"
              type="checkbox"
              checked={statusLed !== null}
              onChange={(event) => {
                if (event.target.checked) {
                  onEnable();
                } else {
                  onDisable();
                }
              }}
              disabled={!currentBoard}
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Státusz-LED engedélyezése
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Villogással jelzi a Wi-Fi-, API- és belső
                hibaállapotokat.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.statusLed} />
        </div>

        {statusLed && (
          <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div>
              <label
                htmlFor="status-led-pin"
                className="mb-1.5 flex items-center text-sm text-slate-300"
              >
                LED GPIO-kimenet
                <HelpPopover {...HELP.statusLedPin} />
              </label>

              <select
                id="status-led-pin"
                value={statusLed.pin}
                onChange={(event) =>
                  onUpdate({
                    pin: Number(event.target.value),
                  })
                }
                disabled={!currentBoard}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500 disabled:opacity-60"
              >
                {currentBoard?.pins
                  .filter((pinOption) => pinOption.can_output)
                  .map((pinOption) => (
                    <option
                      key={pinOption.number}
                      value={pinOption.number}
                    >
                      {pinOption.label}
                      {pinOption.warning ? " ⚠" : ""}
                    </option>
                  ))}
              </select>

              {pinProfile?.warning && (
                <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
                  <strong>Figyelmeztetés:</strong>{" "}
                  {pinProfile.warning}
                </div>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
              <input
                type="checkbox"
                checked={statusLed.inverted}
                onChange={(event) =>
                  onUpdate({
                    inverted: event.target.checked,
                  })
                }
                className="h-4 w-4"
              />

              <span>
                <span className="flex items-center text-sm font-medium">
                  Fordított LED-működés
                  <HelpPopover {...HELP.statusLedInverted} />
                </span>

                <span className="block text-xs text-slate-500">
                  Aktív LOW bekötésű vagy alaplapi LEDhez.
                </span>
              </span>
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
