"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import GeneratedFilesPanel from "@/components/GeneratedFilesPanel";
import RelayEditor from "@/components/RelayEditor";
import BinarySensorEditor from "@/components/BinarySensorEditor";
import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";
import type {
  BinarySensorConfig,
  BoardOption,
  GeneratedFile,
  GenerateResponse,
  GPIOPinOption,
  RelayConfig,
} from "@/types/esphome";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [deviceName, setDeviceName] = useState("muhely-vezerlo");
  const [friendlyName, setFriendlyName] = useState("Műhely vezérlő");
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

  const [binarySensors, setBinarySensors] = useState<BinarySensorConfig[]>([
    {
      clientId: 1,
      name: "Műhelyajtó",
      pin: 22,
      inverted: true,
      pullMode: "PULLUP",
      deviceClass: "door",
      delayedOnMs: 20,
      delayedOffMs: 20,
    },
  ]);

  const nextRelayId = useRef(2);
  const nextBinarySensorId = useRef(2);

  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  const [boardsLoading, setBoardsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const currentBoard = boards.find(
    (boardOption) => boardOption.id === board,
  );

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

        setBoard((currentBoardId) =>
          data.some((item) => item.id === currentBoardId)
            ? currentBoardId
            : (data[0]?.id ?? currentBoardId),
        );
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

  function getPinProfile(pinNumber: number): GPIOPinOption | undefined {
    return currentBoard?.pins.find(
      (pinOption) => pinOption.number === pinNumber,
    );
  }

  function getUsedPins(): Set<number> {
    return new Set([
      ...relays.map((relay) => relay.pin),
      ...binarySensors.map((sensor) => sensor.pin),
    ]);
  }

  function findFreePin(
    pinType: "input" | "output",
  ): number | null {
    if (!currentBoard) {
      return null;
    }

    const usedPins = getUsedPins();

    const pin = currentBoard.pins.find((pinOption) => {
      const supportsType =
        pinType === "output"
          ? pinOption.can_output
          : pinOption.can_input;

      return supportsType && !usedPins.has(pinOption.number);
    });

    return pin?.number ?? null;
  }

  function handleBoardChange(nextBoardId: string) {
    const nextBoard = boards.find(
      (boardOption) => boardOption.id === nextBoardId,
    );

    if (!nextBoard) {
      return;
    }

    const usedPins = new Set<number>();
    const nextRelays: RelayConfig[] = [];
    const nextSensors: BinarySensorConfig[] = [];

    for (const relay of relays) {
      let pinProfile = nextBoard.pins.find(
        (pinOption) =>
          pinOption.number === relay.pin &&
          pinOption.can_output &&
          !usedPins.has(pinOption.number),
      );

      if (!pinProfile) {
        pinProfile = nextBoard.pins.find(
          (pinOption) =>
            pinOption.can_output &&
            !usedPins.has(pinOption.number),
        );
      }

      if (!pinProfile) {
        setError(
          `${nextBoard.label}: nincs elegendő szabad kimeneti GPIO a hozzáadott relékhez.`,
        );
        return;
      }

      usedPins.add(pinProfile.number);

      nextRelays.push({
        ...relay,
        pin: pinProfile.number,
      });
    }

    for (const sensor of binarySensors) {
      let pinProfile = nextBoard.pins.find(
        (pinOption) =>
          pinOption.number === sensor.pin &&
          pinOption.can_input &&
          !usedPins.has(pinOption.number),
      );

      if (!pinProfile) {
        pinProfile = nextBoard.pins.find(
          (pinOption) =>
            pinOption.can_input &&
            !usedPins.has(pinOption.number),
        );
      }

      if (!pinProfile) {
        setError(
          `${nextBoard.label}: nincs elegendő szabad bemeneti GPIO a hozzáadott érzékelőkhöz.`,
        );
        return;
      }

      let nextPullMode = sensor.pullMode;

      if (
        nextPullMode === "PULLUP" &&
        !pinProfile.supports_pullup
      ) {
        nextPullMode = "NONE";
      }

      if (
        nextPullMode === "PULLDOWN" &&
        !pinProfile.supports_pulldown
      ) {
        nextPullMode = "NONE";
      }

      usedPins.add(pinProfile.number);

      nextSensors.push({
        ...sensor,
        pin: pinProfile.number,
        pullMode: nextPullMode,
      });
    }

    setError("");
    setBoard(nextBoardId);
    setRelays(nextRelays);
    setBinarySensors(nextSensors);
    setGeneratedFiles([]);
  }

  function addRelay() {
    if (relays.length >= 8) {
      setError("Legfeljebb 8 relé adható egy eszközhöz.");
      return;
    }

    const freePin = findFreePin("output");

    if (freePin === null) {
      setError(
        "A kiválasztott alaplapon nincs több szabad kimeneti GPIO.",
      );
      return;
    }

    setError("");

    setRelays((currentRelays) => [
      ...currentRelays,
      {
        clientId: nextRelayId.current++,
        name: `Relé ${currentRelays.length + 1}`,
        pin: freePin,
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

  function addBinarySensor() {
    if (binarySensors.length >= 16) {
      setError(
        "Legfeljebb 16 digitális bemenet adható egy eszközhöz.",
      );
      return;
    }

    const freePin = findFreePin("input");

    if (freePin === null) {
      setError(
        "A kiválasztott alaplapon nincs több szabad bemeneti GPIO.",
      );
      return;
    }

    const pinProfile = getPinProfile(freePin);

    setError("");

    setBinarySensors((currentSensors) => [
      ...currentSensors,
      {
        clientId: nextBinarySensorId.current++,
        name: `Digitális bemenet ${currentSensors.length + 1}`,
        pin: freePin,
        inverted: true,
        pullMode: pinProfile?.supports_pullup
          ? "PULLUP"
          : "NONE",
        deviceClass: "",
        delayedOnMs: 20,
        delayedOffMs: 20,
      },
    ]);
  }

  function removeBinarySensor(clientId: number) {
    setBinarySensors((currentSensors) =>
      currentSensors.filter((sensor) => sensor.clientId !== clientId),
    );
  }

  function updateBinarySensor(
    clientId: number,
    updates: Partial<Omit<BinarySensorConfig, "clientId">>,
  ) {
    setBinarySensors((currentSensors) =>
      currentSensors.map((sensor) =>
        sensor.clientId === clientId
          ? {
              ...sensor,
              ...updates,
            }
          : sensor,
      ),
    );
  }

  function updateBinarySensorPin(
    clientId: number,
    pinNumber: number,
  ) {
    const pinProfile = getPinProfile(pinNumber);

    setBinarySensors((currentSensors) =>
      currentSensors.map((sensor) => {
        if (sensor.clientId !== clientId) {
          return sensor;
        }

        let nextPullMode = sensor.pullMode;

        if (
          nextPullMode === "PULLUP" &&
          !pinProfile?.supports_pullup
        ) {
          nextPullMode = "NONE";
        }

        if (
          nextPullMode === "PULLDOWN" &&
          !pinProfile?.supports_pulldown
        ) {
          nextPullMode = "NONE";
        }

        return {
          ...sensor,
          pin: pinNumber,
          pullMode: nextPullMode,
        };
      }),
    );
  }

  function validateHardware(): string | null {
    if (!currentBoard) {
      return "A kiválasztott alaplap GPIO-profilja nem érhető el.";
    }

    const usedPins = new Map<number, string>();

    for (const relay of relays) {
      const name = relay.name.trim();
      const pinProfile = currentBoard.pins.find(
        (pinOption) => pinOption.number === relay.pin,
      );

      if (!name) {
        return "Minden relének kötelező nevet adni.";
      }

      if (!pinProfile) {
        return `GPIO${relay.pin} nem érhető el a kiválasztott alaplapon.`;
      }

      if (!pinProfile.can_output) {
        return `GPIO${relay.pin} nem használható relékimenetként.`;
      }

      const previousUsage = usedPins.get(relay.pin);

      if (previousUsage) {
        return `A GPIO${relay.pin} többször van használva: ${previousUsage} és relé: ${name}.`;
      }

      usedPins.set(relay.pin, `relé: ${name}`);
    }

    for (const sensor of binarySensors) {
      const name = sensor.name.trim();
      const pinProfile = currentBoard.pins.find(
        (pinOption) => pinOption.number === sensor.pin,
      );

      if (!name) {
        return "Minden digitális bemenetnek kötelező nevet adni.";
      }

      if (!pinProfile) {
        return `GPIO${sensor.pin} nem érhető el a kiválasztott alaplapon.`;
      }

      if (!pinProfile.can_input) {
        return `GPIO${sensor.pin} nem használható bemenetként.`;
      }

      if (
        sensor.pullMode === "PULLUP" &&
        !pinProfile.supports_pullup
      ) {
        return `GPIO${sensor.pin} nem támogat belső PULLUP ellenállást.`;
      }

      if (
        sensor.pullMode === "PULLDOWN" &&
        !pinProfile.supports_pulldown
      ) {
        return `GPIO${sensor.pin} nem támogat belső PULLDOWN ellenállást.`;
      }

      if (
        !Number.isInteger(sensor.delayedOnMs) ||
        sensor.delayedOnMs < 0 ||
        sensor.delayedOnMs > 10000
      ) {
        return `${name}: a bekapcsolási szűrés 0 és 10000 ms közötti egész szám lehet.`;
      }

      if (
        !Number.isInteger(sensor.delayedOffMs) ||
        sensor.delayedOffMs < 0 ||
        sensor.delayedOffMs > 10000
      ) {
        return `${name}: a kikapcsolási szűrés 0 és 10000 ms közötti egész szám lehet.`;
      }

      const previousUsage = usedPins.get(sensor.pin);

      if (previousUsage) {
        return `A GPIO${sensor.pin} többször van használva: ${previousUsage} és bemenet: ${name}.`;
      }

      usedPins.set(sensor.pin, `bemenet: ${name}`);
    }

    return null;
  }

  async function readApiError(response: Response): Promise<string> {
    try {
      const data = (await response.json()) as {
        detail?:
          | string
          | {
              msg?: string;
            }[];
      };

      if (typeof data.detail === "string") {
        return data.detail;
      }

      if (Array.isArray(data.detail)) {
        const messages = data.detail
          .map((item) => item.msg)
          .filter((message): message is string => Boolean(message));

        if (messages.length > 0) {
          return messages.join(" ");
        }
      }
    } catch {
      // A válasz nem JSON-formátumú.
    }

    return `A generálás sikertelen: HTTP ${response.status}`;
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateHardware();

    if (validationError) {
      setError(validationError);
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
          binary_sensors: binarySensors.map((sensor) => ({
            name: sensor.name.trim(),
            pin: sensor.pin,
            inverted: sensor.inverted,
            pull_mode: sensor.pullMode,
            device_class:
              sensor.deviceClass === "" ? null : sensor.deviceClass,
            delayed_on_ms: sensor.delayedOnMs,
            delayed_off_ms: sensor.delayedOffMs,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
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
            Alaplapfüggő GPIO-ellenőrzéssel készíthetsz ESPHome
            konfigurációkat.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[470px_1fr]">
          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <form className="space-y-7" onSubmit={handleGenerate}>
              <section>
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
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
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
                      onChange={(event) =>
                        setFriendlyName(event.target.value)
                      }
                      minLength={1}
                      maxLength={64}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 flex items-center text-sm font-medium text-slate-300"
                      htmlFor="board"
                    >
                      Alaplap
                      <HelpPopover {...HELP.board} />
                    </label>

                    <select
                      id="board"
                      value={board}
                      onChange={(event) =>
                        handleBoardChange(event.target.value)
                      }
                      disabled={boardsLoading}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500 disabled:opacity-60"
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

                    {currentBoard && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        {currentBoard.pins.length} engedélyezett GPIO a
                        profilban.
                      </p>
                    )}
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
                      <span className="flex items-center text-sm font-medium">
                        Fallback Access Point
                        <HelpPopover {...HELP.fallbackAccessPoint} />
                      </span>

                      <span className="mt-1 block text-xs text-slate-500">
                        Hibás Wi-Fi-beállítás esetén saját hálózatot indít.
                      </span>
                    </span>
                  </label>
                </div>
              </section>
              <RelayEditor
                currentBoard={currentBoard}
                relays={relays}
                onAdd={addRelay}
                onRemove={removeRelay}
                onUpdate={updateRelay}
              />

              <BinarySensorEditor
                currentBoard={currentBoard}
                binarySensors={binarySensors}
                onAdd={addBinarySensor}
                onRemove={removeBinarySensor}
                onUpdate={updateBinarySensor}
                onUpdatePin={updateBinarySensorPin}
              />

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  generating || boardsLoading || !currentBoard
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
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

          <GeneratedFilesPanel
            generatedFiles={generatedFiles}
            onCopy={copyFile}
            onDownload={downloadFile}
          />
        </div>
      </div>
    </main>
  );
}




