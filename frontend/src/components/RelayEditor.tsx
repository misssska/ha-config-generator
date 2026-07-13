"use client";

import HelpPopover from "@/components/HelpPopover";
import { RESTORE_OPTIONS } from "@/lib/esphome-options";
import { HELP } from "@/lib/help-content";
import type {
  BoardOption,
  RelayConfig,
  RestoreMode,
} from "@/types/esphome";

type RelayEditorProps = {
  currentBoard: BoardOption | undefined;
  relays: RelayConfig[];
  onAdd: () => void;
  onRemove: (clientId: number) => void;
  onUpdate: (
    clientId: number,
    updates: Partial<Omit<RelayConfig, "clientId">>,
  ) => void;
};

export default function RelayEditor({
  currentBoard,
  relays,
  onAdd,
  onRemove,
  onUpdate,
}: RelayEditorProps) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">GPIO-relék</h2>

          <p className="mt-1 text-xs text-slate-500">
            Csak kimenetre alkalmas pinek választhatók.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={relays.length >= 8 || !currentBoard}
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Relé
        </button>
      </div>

      {relays.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center text-sm text-slate-500">
          Nincs hozzáadott relé.
        </div>
      )}

      <div className="space-y-4">
        {relays.map((relay, index) => {
          const pinProfile = currentBoard?.pins.find(
            (pinOption) => pinOption.number === relay.pin,
          );

          return (
            <article
              key={relay.clientId}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-emerald-300">
                  Relé {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => onRemove(relay.clientId)}
                  className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  Törlés
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-sm text-slate-300"
                    htmlFor={`relay-name-${relay.clientId}`}
                  >
                    Home Assistant-név
                  </label>

                  <input
                    id={`relay-name-${relay.clientId}`}
                    value={relay.name}
                    onChange={(event) =>
                      onUpdate(relay.clientId, {
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
                    htmlFor={`relay-pin-${relay.clientId}`}
                  >
                    GPIO-kimenet
                    <HelpPopover {...HELP.relayPin} />
                  </label>

                  <select
                    id={`relay-pin-${relay.clientId}`}
                    value={relay.pin}
                    onChange={(event) =>
                      onUpdate(relay.clientId, {
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

                <div>
                  <label
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                    htmlFor={`restore-${relay.clientId}`}
                  >
                    Indulási állapot
                    <HelpPopover {...HELP.restoreMode} />
                  </label>

                  <select
                    id={`restore-${relay.clientId}`}
                    value={relay.restoreMode}
                    onChange={(event) =>
                      onUpdate(relay.clientId, {
                        restoreMode: event.target.value as RestoreMode,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                  >
                    {RESTORE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <input
                    type="checkbox"
                    checked={relay.inverted}
                    onChange={(event) =>
                      onUpdate(relay.clientId, {
                        inverted: event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span>
                    <span className="flex items-center text-sm font-medium">
                      Fordított működés
                      <HelpPopover {...HELP.relayInverted} />
                    </span>

                    <span className="block text-xs text-slate-500">
                      Aktív alacsony relémodulhoz.
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
