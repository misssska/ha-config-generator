"use client";

import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";
import type {
  BoardOption,
  PwmOutputConfig,
} from "@/types/esphome";

type PwmOutputEditorProps = {
  currentBoard: BoardOption | undefined;
  pwmOutputs: PwmOutputConfig[];
  onAdd: () => void;
  onRemove: (clientId: number) => void;
  onUpdate: (
    clientId: number,
    updates: Partial<Omit<PwmOutputConfig, "clientId">>,
  ) => void;
};

export default function PwmOutputEditor({
  currentBoard,
  pwmOutputs,
  onAdd,
  onRemove,
  onUpdate,
}: PwmOutputEditorProps) {
  const pwmPins =
    currentBoard?.pins.filter(
      (pinOption) => pinOption.supports_pwm,
    ) ?? [];

  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center text-xl font-semibold">
            PWM-kimenetek
            <HelpPopover {...HELP.pwmOutput} />
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Fényerő, fordulatszám vagy más teljesítményszint
            fokozatmentes vezérléséhez.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={
            pwmOutputs.length >= 8 ||
            !currentBoard ||
            pwmPins.length === 0
          }
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + PWM-kimenet
        </button>
      </div>

      {currentBoard && pwmPins.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          A kiválasztott alaplapon nincs használható
          PWM-kimenet.
        </div>
      )}

      {pwmOutputs.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center text-sm text-slate-500">
          Nincs hozzáadott PWM-kimenet.
        </div>
      )}

      <div className="space-y-4">
        {pwmOutputs.map((output, index) => {
          const pinProfile = currentBoard?.pins.find(
            (pinOption) => pinOption.number === output.pin,
          );

          return (
            <article
              key={output.clientId}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-cyan-300">
                  PWM-kimenet {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => onRemove(output.clientId)}
                  className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  Törlés
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`pwm-name-${output.clientId}`}
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                  >
                    Home Assistant-név
                    <HelpPopover {...HELP.pwmName} />
                  </label>

                  <input
                    id={`pwm-name-${output.clientId}`}
                    value={output.name}
                    onChange={(event) =>
                      onUpdate(output.clientId, {
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
                    htmlFor={`pwm-pin-${output.clientId}`}
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                  >
                    PWM GPIO-kimenet
                    <HelpPopover {...HELP.pwmPin} />
                  </label>

                  <select
                    id={`pwm-pin-${output.clientId}`}
                    value={output.pin}
                    onChange={(event) =>
                      onUpdate(output.clientId, {
                        pin: Number(event.target.value),
                      })
                    }
                    disabled={!currentBoard}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500 disabled:opacity-60"
                  >
                    {pwmPins.map((pinOption) => (
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
                    htmlFor={`pwm-frequency-${output.clientId}`}
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                  >
                    PWM-frekvencia
                    <HelpPopover {...HELP.pwmFrequency} />
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      id={`pwm-frequency-${output.clientId}`}
                      type="number"
                      value={output.frequencyHz}
                      min={10}
                      max={40000}
                      step={1}
                      required
                      onChange={(event) =>
                        onUpdate(output.clientId, {
                          frequencyHz: Number(
                            event.target.value,
                          ),
                        })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                    />

                    <span className="text-sm text-slate-400">
                      Hz
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Engedélyezett tartomány: 10–40000 Hz.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <input
                    type="checkbox"
                    checked={output.inverted}
                    onChange={(event) =>
                      onUpdate(output.clientId, {
                        inverted: event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span>
                    <span className="flex items-center text-sm font-medium">
                      Fordított PWM-működés
                      <HelpPopover {...HELP.pwmInverted} />
                    </span>

                    <span className="block text-xs text-slate-500">
                      Megfordítja a 0 és 100 százalékos
                      kimeneti szintet.
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
