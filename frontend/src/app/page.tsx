"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type GPIOPinOption = {
  number: number;
  label: string;
  can_input: boolean;
  can_output: boolean;
  supports_pullup: boolean;
  supports_pulldown: boolean;
  warning: string | null;
};

type BoardOption = {
  id: string;
  label: string;
  platform: "esp32" | "esp8266";
  pins: GPIOPinOption[];
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

type PullMode = "NONE" | "PULLUP" | "PULLDOWN";

type BinaryDeviceClass =
  | ""
  | "door"
  | "window"
  | "garage_door"
  | "opening"
  | "motion"
  | "occupancy"
  | "safety"
  | "problem"
  | "smoke"
  | "moisture"
  | "gas"
  | "vibration"
  | "tamper"
  | "running";

type RelayConfig = {
  clientId: number;
  name: string;
  pin: number;
  inverted: boolean;
  restoreMode: RestoreMode;
};

type BinarySensorConfig = {
  clientId: number;
  name: string;
  pin: number;
  inverted: boolean;
  pullMode: PullMode;
  deviceClass: BinaryDeviceClass;
  delayedOnMs: number;
  delayedOffMs: number;
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
    label: "Előző állapot, alapból KI",
  },
  {
    value: "RESTORE_DEFAULT_ON",
    label: "Előző állapot, alapból BE",
  },
];

const PULL_OPTIONS: {
  value: PullMode;
  label: string;
}[] = [
  {
    value: "NONE",
    label: "Nincs belső ellenállás",
  },
  {
    value: "PULLUP",
    label: "Belső felhúzás – PULLUP",
  },
  {
    value: "PULLDOWN",
    label: "Belső lehúzás – PULLDOWN",
  },
];

const DEVICE_CLASS_OPTIONS: {
  value: BinaryDeviceClass;
  label: string;
}[] = [
  { value: "", label: "Nincs megadva" },
  { value: "door", label: "Ajtó" },
  { value: "window", label: "Ablak" },
  { value: "garage_door", label: "Garázsajtó" },
  { value: "opening", label: "Nyílás" },
  { value: "motion", label: "Mozgás" },
  { value: "occupancy", label: "Jelenlét" },
  { value: "safety", label: "Biztonsági érzékelő" },
  { value: "problem", label: "Hiba" },
  { value: "smoke", label: "Füst" },
  { value: "moisture", label: "Nedvesség" },
  { value: "gas", label: "Gáz" },
  { value: "vibration", label: "Rezgés" },
  { value: "tamper", label: "Szabotázs" },
  { value: "running", label: "Üzemelés" },
];

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

        if (!data.some((item) => item.id === board) && data.length > 0) {
          setBoard(data[0].id);
        }
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
                      className="mb-2 block text-sm font-medium text-slate-300"
                      htmlFor="board"
                    >
                      Alaplap
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
                      <span className="block text-sm font-medium">
                        Fallback Access Point
                      </span>

                      <span className="mt-1 block text-xs text-slate-500">
                        Hibás Wi-Fi-beállítás esetén saját hálózatot indít.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

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
                    onClick={addRelay}
                    disabled={relays.length >= 8 || !currentBoard}
                    className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 disabled:opacity-40"
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
                    const pinProfile = getPinProfile(relay.pin);

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
                            onClick={() => removeRelay(relay.clientId)}
                            className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300"
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
                                updateRelay(relay.clientId, {
                                  name: event.target.value,
                                })
                              }
                              required
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label
                              className="mb-1.5 block text-sm text-slate-300"
                              htmlFor={`relay-pin-${relay.clientId}`}
                            >
                              GPIO-kimenet
                            </label>

                            <select
                              id={`relay-pin-${relay.clientId}`}
                              value={relay.pin}
                              onChange={(event) =>
                                updateRelay(relay.clientId, {
                                  pin: Number(event.target.value),
                                })
                              }
                              disabled={!currentBoard}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                            >
                              {currentBoard?.pins
                                .filter(
                                  (pinOption) => pinOption.can_output,
                                )
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
                              className="mb-1.5 block text-sm text-slate-300"
                              htmlFor={`restore-${relay.clientId}`}
                            >
                              Indulási állapot
                            </label>

                            <select
                              id={`restore-${relay.clientId}`}
                              value={relay.restoreMode}
                              onChange={(event) =>
                                updateRelay(relay.clientId, {
                                  restoreMode:
                                    event.target.value as RestoreMode,
                                })
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none"
                            >
                              {RESTORE_OPTIONS.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
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
                    onClick={addBinarySensor}
                    disabled={
                      binarySensors.length >= 16 || !currentBoard
                    }
                    className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 disabled:opacity-40"
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
                    const pinProfile = getPinProfile(sensor.pin);

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
                            onClick={() =>
                              removeBinarySensor(sensor.clientId)
                            }
                            className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300"
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
                                updateBinarySensor(sensor.clientId, {
                                  name: event.target.value,
                                })
                              }
                              required
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label
                              className="mb-1.5 block text-sm text-slate-300"
                              htmlFor={`sensor-pin-${sensor.clientId}`}
                            >
                              GPIO-bemenet
                            </label>

                            <select
                              id={`sensor-pin-${sensor.clientId}`}
                              value={sensor.pin}
                              onChange={(event) =>
                                updateBinarySensorPin(
                                  sensor.clientId,
                                  Number(event.target.value),
                                )
                              }
                              disabled={!currentBoard}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                            >
                              {currentBoard?.pins
                                .filter(
                                  (pinOption) => pinOption.can_input,
                                )
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
                              className="mb-1.5 block text-sm text-slate-300"
                              htmlFor={`pull-mode-${sensor.clientId}`}
                            >
                              Belső ellenállás
                            </label>

                            <select
                              id={`pull-mode-${sensor.clientId}`}
                              value={sensor.pullMode}
                              onChange={(event) =>
                                updateBinarySensor(sensor.clientId, {
                                  pullMode:
                                    event.target.value as PullMode,
                                })
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none"
                            >
                              {pullOptions.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            {pinProfile &&
                              !pinProfile.supports_pullup &&
                              !pinProfile.supports_pulldown && (
                                <p className="mt-2 text-xs text-slate-500">
                                  Ehhez a GPIO-hoz külső felhúzó vagy
                                  lehúzó ellenállás szükséges.
                                </p>
                              )}
                          </div>

                          <div>
                            <label
                              className="mb-1.5 block text-sm text-slate-300"
                              htmlFor={`device-class-${sensor.clientId}`}
                            >
                              Eszközosztály
                            </label>

                            <select
                              id={`device-class-${sensor.clientId}`}
                              value={sensor.deviceClass}
                              onChange={(event) =>
                                updateBinarySensor(sensor.clientId, {
                                  deviceClass:
                                    event.target
                                      .value as BinaryDeviceClass,
                                })
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none"
                            >
                              {DEVICE_CLASS_OPTIONS.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                className="mb-1.5 block text-sm text-slate-300"
                                htmlFor={`delayed-on-${sensor.clientId}`}
                              >
                                Bekapcsolási szűrés
                              </label>

                              <div className="relative">
                                <input
                                  id={`delayed-on-${sensor.clientId}`}
                                  type="number"
                                  value={sensor.delayedOnMs}
                                  onChange={(event) =>
                                    updateBinarySensor(
                                      sensor.clientId,
                                      {
                                        delayedOnMs: Number(
                                          event.target.value,
                                        ),
                                      },
                                    )
                                  }
                                  min={0}
                                  max={10000}
                                  step={1}
                                  required
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-10 outline-none"
                                />

                                <span className="absolute right-3 top-2 text-sm text-slate-500">
                                  ms
                                </span>
                              </div>
                            </div>

                            <div>
                              <label
                                className="mb-1.5 block text-sm text-slate-300"
                                htmlFor={`delayed-off-${sensor.clientId}`}
                              >
                                Kikapcsolási szűrés
                              </label>

                              <div className="relative">
                                <input
                                  id={`delayed-off-${sensor.clientId}`}
                                  type="number"
                                  value={sensor.delayedOffMs}
                                  onChange={(event) =>
                                    updateBinarySensor(
                                      sensor.clientId,
                                      {
                                        delayedOffMs: Number(
                                          event.target.value,
                                        ),
                                      },
                                    )
                                  }
                                  min={0}
                                  max={10000}
                                  step={1}
                                  required
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-10 outline-none"
                                />

                                <span className="absolute right-3 top-2 text-sm text-slate-500">
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
                                updateBinarySensor(sensor.clientId, {
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
                                Például GND-re kapcsoló PULLUP
                                bemenethez.
                              </span>
                            </span>
                          </label>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

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

          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Generált fájlok</h2>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {generatedFiles.length} fájl
              </span>
            </div>

            {generatedFiles.length === 0 && (
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
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                      >
                        Másolás
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadFile(file)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500"
                      >
                        Letöltés
                      </button>
                    </div>
                  </div>

                  <pre className="max-h-[720px] overflow-auto p-4 text-sm leading-6 text-slate-300">
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

