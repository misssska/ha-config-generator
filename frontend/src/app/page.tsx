"use client";

import { useEffect, useState } from "react";

import GeneratedFilesPanel from "@/components/GeneratedFilesPanel";
import RelayEditor from "@/components/RelayEditor";
import BinarySensorEditor from "@/components/BinarySensorEditor";
import DeviceSettings from "@/components/DeviceSettings";
import { useEsphomeForm } from "@/hooks/useEsphomeForm";
import { useEsphomeGeneration } from "@/hooks/useEsphomeGeneration";
import {
  ESPHOME_API_URL,
  fetchBoards,
} from "@/lib/esphome-api";
import type { BoardOption } from "@/types/esphome";

export default function Home() {
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);

  const {
    generatedFiles,
    generating,
    error,
    setError,
    clearGeneratedFiles,
    createGenerateHandler,
    copyFile,
    downloadFile,
  } = useEsphomeGeneration();

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
    onClearGeneratedFiles: clearGeneratedFiles,
  });


  useEffect(() => {
    const controller = new AbortController();

    async function loadBoards() {
      try {
        setBoardsLoading(true);
        setError("");

        const data = await fetchBoards(controller.signal);

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
  }, [setBoard, setError]);

  const handleGenerate = createGenerateHandler(
    {
      deviceName,
      friendlyName,
      board,
      includeFallbackAp,
      relays,
      binarySensors,
    },
    validateHardware,
  );

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
              Backend: {ESPHOME_API_URL}
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




