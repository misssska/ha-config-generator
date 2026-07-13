"use client";

import HelpPopover from "@/components/HelpPopover";
import {
  DEVICE_CLASS_OPTIONS,
  PULL_OPTIONS,
} from "@/lib/esphome-options";
import { HELP } from "@/lib/help-content";
import type {
  BinaryDeviceClass,
  BinarySensorConfig,
  BoardOption,
  PullMode,
} from "@/types/esphome";

type BinarySensorEditorProps = {
  currentBoard: BoardOption | undefined;
  binarySensors: BinarySensorConfig[];
  onAdd: () => void;
  onRemove: (clientId: number) => void;
  onUpdate: (
    clientId: number,
    updates: Partial<Omit<BinarySensorConfig, "clientId">>,
  ) => void;
  onUpdatePin: (clientId: number, pin: number) => void;
};

export default function BinarySensorEditor({
  currentBoard,
  binarySensors,
  onAdd,
  onRemove,
  onUpdate,
  onUpdatePin,
}: BinarySensorEditorProps) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Digitális bemenetek
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            A belső ellenállások pinfüggően választhatók.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={binarySensors.length >= 16 || !currentBoard}
          className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Bemenet
        </button>
      </div>

      {binarySensors.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center text-sm text-slate-500">
          Nincs hozzáadott digitális bemenet.
        </div>
      )}

      <div className="space-y-4">
        {binarySensors.map((sensor, index) => {
          const pinProfile = currentBoard?.pins.find(
            (pinOption) => pinOption.number === sensor.pin,
          );

          const pullOptions = PULL_OPTIONS.filter(
            (option) =>
              option.value === "NONE" ||
              (option.value === "PULLUP" &&
                pinProfile?.supports_pullup) ||
              (option.value === "PULLDOWN" &&
                pinProfile?.supports_pulldown),
          );

          return (
            <article
              key={sensor.clientId}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-violet-300">
                  Bemenet {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => onRemove(sensor.clientId)}
                  className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  Törlés
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-sm text-slate-300"
                    htmlFor={`sensor-name-${sensor.clientId}`}
                  >
                    Home Assistant-név
                  </label>

                  <input
                    id={`sensor-name-${sensor.clientId}`}
                    value={sensor.name}
                    onChange={(event) =>
                      onUpdate(sensor.clientId, {
                        name: event.target.value,
                      })
                    }
                    minLength={1}
                    maxLength={64}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                    htmlFor={`sensor-pin-${sensor.clientId}`}
                  >
                    GPIO-bemenet
                    <HelpPopover {...HELP.inputPin} />
                  </label>

                  <select
                    id={`sensor-pin-${sensor.clientId}`}
                    value={sensor.pin}
                    onChange={(event) =>
                      onUpdatePin(
                        sensor.clientId,
                        Number(event.target.value),
                      )
                    }
                    disabled={!currentBoard}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500 disabled:opacity-60"
                  >
                    {currentBoard?.pins
                      .filter((pinOption) => pinOption.can_input)
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

                <div>
                  <label
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                    htmlFor={`pull-mode-${sensor.clientId}`}
                  >
                    Belső ellenállás
                    <HelpPopover {...HELP.pullMode} />
                  </label>

                  <select
                    id={`pull-mode-${sensor.clientId}`}
                    value={sensor.pullMode}
                    onChange={(event) =>
                      onUpdate(sensor.clientId, {
                        pullMode: event.target.value as PullMode,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                  >
                    {pullOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {!pinProfile?.supports_pullup &&
                    !pinProfile?.supports_pulldown && (
                      <p className="mt-2 text-xs leading-5 text-amber-300">
                        Ez a GPIO nem támogat belső felhúzó vagy
                        lehúzó ellenállást. Szükség esetén használj
                        külső ellenállást.
                      </p>
                    )}
                </div>

                <div>
                  <label
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                    htmlFor={`device-class-${sensor.clientId}`}
                  >
                    Eszközosztály
                    <HelpPopover {...HELP.deviceClass} />
                  </label>

                  <select
                    id={`device-class-${sensor.clientId}`}
                    value={sensor.deviceClass}
                    onChange={(event) =>
                      onUpdate(sensor.clientId, {
                        deviceClass:
                          event.target.value as BinaryDeviceClass,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                  >
                    {DEVICE_CLASS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 flex items-center text-sm text-slate-300"
                      htmlFor={`delayed-on-${sensor.clientId}`}
                    >
                      Bekapcsolási szűrés
                      <HelpPopover {...HELP.delayedOn} />
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        id={`delayed-on-${sensor.clientId}`}
                        type="number"
                        min={0}
                        max={60000}
                        step={10}
                        value={sensor.delayedOnMs}
                        onChange={(event) =>
                          onUpdate(sensor.clientId, {
                            delayedOnMs: Number(event.target.value),
                          })
                        }
                        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                      />

                      <span className="text-sm text-slate-500">
                        ms
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 flex items-center text-sm text-slate-300"
                      htmlFor={`delayed-off-${sensor.clientId}`}
                    >
                      Kikapcsolási szűrés
                      <HelpPopover {...HELP.delayedOff} />
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        id={`delayed-off-${sensor.clientId}`}
                        type="number"
                        min={0}
                        max={60000}
                        step={10}
                        value={sensor.delayedOffMs}
                        onChange={(event) =>
                          onUpdate(sensor.clientId, {
                            delayedOffMs: Number(event.target.value),
                          })
                        }
                        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                      />

                      <span className="text-sm text-slate-500">
                        ms
                      </span>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <input
                    type="checkbox"
                    checked={sensor.inverted}
                    onChange={(event) =>
                      onUpdate(sensor.clientId, {
                        inverted: event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span>
                    <span className="flex items-center text-sm font-medium">
                      Fordított működés
                      <HelpPopover {...HELP.inputInverted} />
                    </span>

                    <span className="block text-xs text-slate-500">
                      Például GND-re kapcsoló PULLUP bemenethez.
                    </span>
                  </span>
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
