"use client";

import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";
import type {
  AdcAttenuation,
  AdcInputConfig,
  BoardOption,
} from "@/types/esphome";

const ATTENUATION_OPTIONS: Array<{
  value: AdcAttenuation;
  label: string;
}> = [
  {
    value: "auto",
    label: "Automatikus",
  },
  {
    value: "0db",
    label: "0 dB",
  },
  {
    value: "2.5db",
    label: "2,5 dB",
  },
  {
    value: "6db",
    label: "6 dB",
  },
  {
    value: "12db",
    label: "12 dB",
  },
];

type AdcInputEditorProps = {
  currentBoard: BoardOption | undefined;
  adcInputs: AdcInputConfig[];
  onAdd: () => void;
  onRemove: (clientId: number) => void;
  onUpdate: (
    clientId: number,
    updates: Partial<Omit<AdcInputConfig, "clientId">>,
  ) => void;
};

export default function AdcInputEditor({
  currentBoard,
  adcInputs,
  onAdd,
  onRemove,
  onUpdate,
}: AdcInputEditorProps) {
  const adcPins =
    currentBoard?.pins.filter(
      (pinOption) => pinOption.supports_adc,
    ) ?? [];

  const isEsp8266 =
    currentBoard?.platform === "esp8266";

  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center text-xl font-semibold">
            ADC-bemenetek
            <HelpPopover {...HELP.adcInput} />
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Analóg feszültség vagy analóg érzékelő
            méréséhez.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={
            adcInputs.length >= 8 ||
            !currentBoard ||
            adcPins.length === 0
          }
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + ADC-bemenet
        </button>
      </div>

      {currentBoard && adcPins.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          A kiválasztott alaplapon nincs használható
          ADC-bemenet.
        </div>
      )}

      {isEsp8266 && (
        <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs leading-5 text-blue-200">
          ESP8266 esetén az analóg mérés az A0 bemenetet
          használja. Az ESP32 csillapítási beállítása itt
          nem alkalmazható.
        </div>
      )}

      {adcInputs.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center text-sm text-slate-500">
          Nincs hozzáadott ADC-bemenet.
        </div>
      )}

      <div className="space-y-4">
        {adcInputs.map((input, index) => {
          const pinProfile = currentBoard?.pins.find(
            (pinOption) => pinOption.number === input.pin,
          );

          return (
            <article
              key={input.clientId}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-violet-300">
                  ADC-bemenet {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => onRemove(input.clientId)}
                  className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  Törlés
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`adc-name-${input.clientId}`}
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                  >
                    Home Assistant-név
                    <HelpPopover {...HELP.adcName} />
                  </label>

                  <input
                    id={`adc-name-${input.clientId}`}
                    value={input.name}
                    onChange={(event) =>
                      onUpdate(input.clientId, {
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
                    htmlFor={`adc-pin-${input.clientId}`}
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                  >
                    ADC GPIO-bemenet
                    <HelpPopover {...HELP.adcPin} />
                  </label>

                  <select
                    id={`adc-pin-${input.clientId}`}
                    value={input.pin}
                    onChange={(event) =>
                      onUpdate(input.clientId, {
                        pin: Number(event.target.value),
                      })
                    }
                    disabled={!currentBoard}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500 disabled:opacity-60"
                  >
                    {adcPins.map((pinOption) => (
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
                    htmlFor={`adc-interval-${input.clientId}`}
                    className="mb-1.5 flex items-center text-sm text-slate-300"
                  >
                    Frissítési idő
                    <HelpPopover {...HELP.adcUpdateInterval} />
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      id={`adc-interval-${input.clientId}`}
                      type="number"
                      value={input.updateIntervalS}
                      min={1}
                      max={3600}
                      step={1}
                      required
                      onChange={(event) =>
                        onUpdate(input.clientId, {
                          updateIntervalS: Number(
                            event.target.value,
                          ),
                        })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                    />

                    <span className="text-sm text-slate-400">
                      másodperc
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Engedélyezett tartomány: 1–3600 másodperc.
                  </p>
                </div>

                {!isEsp8266 && (
                  <div>
                    <label
                      htmlFor={`adc-attenuation-${input.clientId}`}
                      className="mb-1.5 flex items-center text-sm text-slate-300"
                    >
                      ADC-csillapítás
                      <HelpPopover {...HELP.adcAttenuation} />
                    </label>

                    <select
                      id={`adc-attenuation-${input.clientId}`}
                      value={input.attenuation}
                      onChange={(event) =>
                        onUpdate(input.clientId, {
                          attenuation:
                            event.target
                              .value as AdcAttenuation,
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                    >
                      {ATTENUATION_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
                  <strong>Fontos:</strong> az ESP GPIO
                  bemenetére a megengedettnél nagyobb
                  feszültséget tilos közvetlenül rákapcsolni.
                  Szükség esetén használj feszültségosztót
                  vagy megfelelő jelkondicionálást.
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
