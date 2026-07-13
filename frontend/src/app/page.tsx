"use client";

import { type FormEvent, useEffect, useState } from "react";

import GeneratedFilesPanel from "@/components/GeneratedFilesPanel";
import RelayEditor from "@/components/RelayEditor";
import BinarySensorEditor from "@/components/BinarySensorEditor";
import DeviceSettings from "@/components/DeviceSettings";
import { useEsphomeForm } from "@/hooks/useEsphomeForm";
import type {
  BoardOption,
  GeneratedFile,
  GenerateResponse,
} from "@/types/esphome";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  const [boardsLoading, setBoardsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const {
    deviceName,
    setDeviceName,
    friendlyName,
    setFriendlyName,
    board,
    setBoard,
    includeFallbackAp,
    setIncludeFallbackAp,
    relays,
    binarySensors,
    currentBoard,
    handleBoardChange,
    addRelay,
    removeRelay,
    updateRelay,
    addBinarySensor,
    removeBinarySensor,
    updateBinarySensor,
    updateBinarySensorPin,
    validateHardware,
  } = useEsphomeForm({
    boards,
    onError: setError,
    onClearGeneratedFiles: () => setGeneratedFiles([]),
  });


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
  }, [setBoard]);

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
              <DeviceSettings
                deviceName={deviceName}
                friendlyName={friendlyName}
                board={board}
                includeFallbackAp={includeFallbackAp}
                boards={boards}
                boardsLoading={boardsLoading}
                currentBoard={currentBoard}
                onDeviceNameChange={setDeviceName}
                onFriendlyNameChange={setFriendlyName}
                onBoardChange={handleBoardChange}
                onFallbackApChange={setIncludeFallbackAp}
              />
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




