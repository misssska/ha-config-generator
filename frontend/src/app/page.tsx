"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type BoardOption = {
  id: string;
  label: string;
  platform: "esp32" | "esp8266";
};

type GeneratedFile = {
  filename: string;
  content: string;
};

type GenerateResponse = {
  files: GeneratedFile[];
};

type RestoreMode =
  | "ALWAYS_OFF"
  | "ALWAYS_ON"
  | "RESTORE_DEFAULT_OFF"
  | "RESTORE_DEFAULT_ON";

type RelayConfig = {
  clientId: number;
  name: string;
  pin: number;
  inverted: boolean;
  restoreMode: RestoreMode;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const RESTORE_OPTIONS: {
  value: RestoreMode;
  label: string;
}[] = [
  {
    value: "ALWAYS_OFF",
    label: "Mindig kikapcsolva indul",
  },
  {
    value: "ALWAYS_ON",
    label: "Mindig bekapcsolva indul",
  },
  {
    value: "RESTORE_DEFAULT_OFF",
    label: "Előző állapot visszaállítása, alapból KI",
  },
  {
    value: "RESTORE_DEFAULT_ON",
    label: "Előző állapot visszaállítása, alapból BE",
  },
];

export default function Home() {
  const [deviceName, setDeviceName] = useState("muhely-rele");
  const [friendlyName, setFriendlyName] = useState("Műhely relé");
  const [board, setBoard] = useState("esp32dev");
  const [includeFallbackAp, setIncludeFallbackAp] = useState(true);

  const [relays, setRelays] = useState<RelayConfig[]>([
    {
      clientId: 1,
      name: "Műhely világítás",
      pin: 23,
      inverted: true,
      restoreMode: "ALWAYS_OFF",
    },
  ]);

  const nextRelayId = useRef(2);

  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  const [boardsLoading, setBoardsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBoards() {
      try {
        setBoardsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/esphome/boards`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Az alaplapok lekérése sikertelen: HTTP ${response.status}`,
          );
        }

        const data = (await response.json()) as BoardOption[];
        setBoards(data);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Ismeretlen hiba történt.",
        );
      } finally {
        setBoardsLoading(false);
      }
    }

    void loadBoards();

    return () => {
      controller.abort();
    };
  }, []);

  function addRelay() {
    if (relays.length >= 8) {
      setError("Legfeljebb 8 relé adható egy eszközhöz.");
      return;
    }

    const relayNumber = relays.length + 1;

    setError("");

    setRelays((currentRelays) => [
      ...currentRelays,
      {
        clientId: nextRelayId.current++,
        name: `Relé ${relayNumber}`,
        pin: 23,
        inverted: true,
        restoreMode: "ALWAYS_OFF",
      },
    ]);
  }

  function removeRelay(clientId: number) {
    setRelays((currentRelays) =>
      currentRelays.filter((relay) => relay.clientId !== clientId),
    );
  }

  function updateRelay(
    clientId: number,
    updates: Partial<Omit<RelayConfig, "clientId">>,
  ) {
    setRelays((currentRelays) =>
      currentRelays.map((relay) =>
        relay.clientId === clientId
          ? {
              ...relay,
              ...updates,
            }
          : relay,
      ),
    );
  }

  function validateRelays(): string | null {
    const usedPins = new Set<number>();

    for (const relay of relays) {
      if (!relay.name.trim()) {
        return "Minden relének kötelező nevet adni.";
      }

      if (!Number.isInteger(relay.pin) || relay.pin < 0 || relay.pin > 48) {
        return `${relay.name}: a GPIO csak 0 és 48 közötti egész szám lehet.`;
      }

      if (usedPins.has(relay.pin)) {
        return `A GPIO${relay.pin} több reléhez is hozzá van rendelve.`;
      }

      usedPins.add(relay.pin);
    }

    return null;
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const relayValidationError = validateRelays();

    if (relayValidationError) {
      setError(relayValidationError);
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setGeneratedFiles([]);

      const response = await fetch(`${API_URL}/api/esphome/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_name: deviceName,
          friendly_name: friendlyName,
          board,
          include_fallback_ap: includeFallbackAp,
          relays: relays.map((relay) => ({
            name: relay.name.trim(),
            pin: relay.pin,
            inverted: relay.inverted,
            restore_mode: relay.restoreMode,
          })),
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
          responseText ||
            `A generálás sikertelen: HTTP ${response.status}`,
        );
      }

      const data = (await response.json()) as GenerateResponse;
      setGeneratedFiles(data.files);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Ismeretlen hiba történt.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function copyFile(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setError("A vágólapra másolás nem sikerült.");
    }
  }

  function downloadFile(file: GeneratedFile) {
    const blob = new Blob([file.content], {
      type: "text/yaml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="mb-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            HA Config Generator MVP
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ESPHome konfigurációgenerátor
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Állítsd össze az ESPHome-eszköz konfigurációját, majd töltsd le a
            kész YAML- és secrets-fájlokat.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <form className="space-y-7" onSubmit={handleGenerate}>
              <div>
                <h2 className="mb-5 text-xl font-semibold">
                  Eszköz beállításai
                </h2>

                <div className="space-y-5">
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-300"
                      htmlFor="device-name"
                    >
                      ESPHome eszköznév
                    </label>

                    <input
                      id="device-name"
                      type="text"
                      value={deviceName}
                      onChange={(event) => setDeviceName(event.target.value)}
                      minLength={1}
                      maxLength={31}
                      pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Kisbetűk, számok és kötőjel használható.
                    </p>
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-300"
                      htmlFor="friendly-name"
                    >
                      Megjelenített név
                    </label>

                    <input
                      id="friendly-name"
                      type="text"
                      value={friendlyName}
                      onChange={(event) => setFriendlyName(event.target.value)}
                      minLength={1}
                      maxLength={64}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-300"
                      htmlFor="board"
                    >
                      Alaplap
                    </label>

                    <select
                      id="board"
                      value={board}
                      onChange={(event) => setBoard(event.target.value)}
                      disabled={boardsLoading}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-60"
                    >
                      {boardsLoading && (
                        <option value="">Alaplapok betöltése...</option>
                      )}

                      {boards.map((boardOption) => (
                        <option key={boardOption.id} value={boardOption.id}>
                          {boardOption.label} – {boardOption.platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <input
                      type="checkbox"
                      checked={includeFallbackAp}
                      onChange={(event) =>
                        setIncludeFallbackAp(event.target.checked)
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium">
                        Fallback Access Point
                      </span>

                      <span className="mt-1 block text-xs text-slate-500">
                        Hibás Wi-Fi-beállítás esetén az ESP saját hálózatot
                        indít.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">GPIO-relék</h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Legfeljebb 8 relékimenet adható hozzá.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addRelay}
                    disabled={relays.length >= 8}
                    className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + Relé
                  </button>
                </div>

                {relays.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-5 text-center text-sm text-slate-500">
                    Nincs hozzáadott relé.
                  </div>
                )}

                <div className="space-y-4">
                  {relays.map((relay, index) => (
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
                          onClick={() => removeRelay(relay.clientId)}
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
                            type="text"
                            value={relay.name}
                            onChange={(event) =>
                              updateRelay(relay.clientId, {
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
                            className="mb-1.5 block text-sm text-slate-300"
                            htmlFor={`relay-pin-${relay.clientId}`}
                          >
                            GPIO
                          </label>

                          <input
                            id={`relay-pin-${relay.clientId}`}
                            type="number"
                            value={relay.pin}
                            onChange={(event) =>
                              updateRelay(relay.clientId, {
                                pin: Number(event.target.value),
                              })
                            }
                            min={0}
                            max={48}
                            step={1}
                            required
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            className="mb-1.5 block text-sm text-slate-300"
                            htmlFor={`restore-mode-${relay.clientId}`}
                          >
                            Indulási állapot
                          </label>

                          <select
                            id={`restore-mode-${relay.clientId}`}
                            value={relay.restoreMode}
                            onChange={(event) =>
                              updateRelay(relay.clientId, {
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
                              updateRelay(relay.clientId, {
                                inverted: event.target.checked,
                              })
                            }
                            className="h-4 w-4"
                          />

                          <span>
                            <span className="block text-sm font-medium">
                              Fordított működés
                            </span>

                            <span className="block text-xs text-slate-500">
                              Aktív alacsony szintű relémodulhoz.
                            </span>
                          </span>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || boardsLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {generating
                  ? "Generálás..."
                  : "ESPHome projekt generálása"}
              </button>
            </form>

            <div className="mt-5 border-t border-slate-800 pt-4 text-xs text-slate-500">
              Backend: {API_URL}
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Generált fájlok</h2>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {generatedFiles.length} fájl
              </span>
            </div>

            {error && (
              <div className="mb-5 overflow-auto rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {generatedFiles.length === 0 && !error && (
              <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center text-slate-500">
                A generált ESPHome-fájlok itt jelennek meg.
              </div>
            )}

            <div className="space-y-6">
              {generatedFiles.map((file) => (
                <article
                  key={file.filename}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                    <h3 className="font-mono text-sm font-semibold text-emerald-300">
                      {file.filename}
                    </h3>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void copyFile(file.content)}
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-xs transition hover:bg-slate-800"
                      >
                        Másolás
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadFile(file)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium transition hover:bg-emerald-500"
                      >
                        Letöltés
                      </button>
                    </div>
                  </div>

                  <pre className="max-h-[620px] overflow-auto p-4 text-sm leading-6 text-slate-300">
                    <code>{file.content}</code>
                  </pre>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
