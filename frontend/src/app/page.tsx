"use client";

import {
  useState,
  type FormEvent,
} from "react";

import AdcInputEditor from "@/components/AdcInputEditor";
import BinarySensorEditor from "@/components/BinarySensorEditor";
import BoardPinout, {
  type SettingsTabId,
} from "@/components/BoardPinout";
import ConfigurationManager from "@/components/ConfigurationManager";
import DeviceSettings from "@/components/DeviceSettings";
import GeneratedProjectDrawer from "@/components/GeneratedProjectDrawer";
import NetworkSystemSettings from "@/components/NetworkSystemSettings";
import PwmOutputEditor from "@/components/PwmOutputEditor";
import RelayEditor from "@/components/RelayEditor";
import StatusLedSettings from "@/components/StatusLedSettings";
import SystemFeaturesSettings from "@/components/SystemFeaturesSettings";
import WorkspaceNavigation from "@/components/WorkspaceNavigation";
import { useEsphomeBoards } from "@/hooks/useEsphomeBoards";
import { useEsphomeForm } from "@/hooks/useEsphomeForm";
import { useEsphomeGeneration } from "@/hooks/useEsphomeGeneration";
import { ESPHOME_API_URL } from "@/lib/esphome-api";

export default function Home() {
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsTabId>("device");

  const [resultsOpen, setResultsOpen] =
    useState(false);

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
    boards,
    boardsLoading,
  } = useEsphomeBoards({
    onError: setError,
  });

  const {
    deviceName,
    setDeviceName,
    friendlyName,
    setFriendlyName,
    board,
    includeFallbackAp,
    setIncludeFallbackAp,
    networkSettings,
    updateNetworkSettings,
    systemFeatures,
    updateSystemFeatures,
    statusLed,
    enableStatusLed,
    disableStatusLed,
    updateStatusLed,
    pwmOutputs,
    addPwmOutput,
    removePwmOutput,
    updatePwmOutput,
    adcInputs,
    addAdcInput,
    removeAdcInput,
    updateAdcInput,
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
    persistenceReady,
    exportConfiguration,
    importConfiguration,
    resetConfiguration,
  } = useEsphomeForm({
    boards,
    onError: setError,
    onClearGeneratedFiles: clearGeneratedFiles,
  });

  const generateProject = createGenerateHandler(
    {
      deviceName,
      friendlyName,
      board,
      includeFallbackAp,
      networkSettings,
      systemFeatures,
      statusLed,
      pwmOutputs,
      adcInputs,
      relays,
      binarySensors,
    },
    validateHardware,
  );

  function handleGenerate(
    event: FormEvent<HTMLFormElement>,
  ): void {
    setResultsOpen(true);
    void generateProject(event);
  }

  function navigateToConfigurationField(
    tabId: SettingsTabId,
    targetId: string,
  ): void {
    setActiveSettingsTab(tabId);

    window.setTimeout(() => {
      const target = document.getElementById(
        targetId,
      ) as HTMLElement | null;

      target?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      target?.focus({
        preventScroll: true,
      });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-5 text-slate-100 sm:px-5">
      <div className="mx-auto max-w-[1700px]">
        <header className="mb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                HA Config Generator
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                ESPHome konfigurációgenerátor
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Hardver, GPIO-k és automatizálások
                egyetlen munkafelületen.
              </p>
            </div>

            <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[10px] text-slate-500">
              Backend: {ESPHOME_API_URL}
            </span>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[460px_minmax(0,1fr)] xl:grid-cols-[520px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-2">
            <BoardPinout
              currentBoard={currentBoard}
              statusLed={statusLed}
              pwmOutputs={pwmOutputs}
              adcInputs={adcInputs}
              relays={relays}
              binarySensors={binarySensors}
              onNavigate={navigateToConfigurationField}
            />
          </aside>

          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-6">
            <form
              className="space-y-5"
              onSubmit={handleGenerate}
            >
              <WorkspaceNavigation
                activeTab={activeSettingsTab}
                deviceName={deviceName}
                boardLabel={currentBoard?.label}
                persistenceReady={persistenceReady}
                generating={generating}
                generationDisabled={
                  generating ||
                  boardsLoading ||
                  !currentBoard
                }
                generatedFileCount={
                  generatedFiles.length
                }
                error={error}
                relayCount={relays.length}
                binarySensorCount={
                  binarySensors.length
                }
                pwmCount={pwmOutputs.length}
                adcCount={adcInputs.length}
                onTabChange={setActiveSettingsTab}
                onOpenResults={() =>
                  setResultsOpen(true)
                }
              />

              <div
                role="tabpanel"
                className="space-y-5 pb-2 [&>section]:rounded-xl [&>section]:border [&>section]:border-slate-800/80 [&>section]:bg-slate-950/50 [&>section]:p-5 [&>section]:pt-5 [&>section]:shadow-sm"
              >
                {activeSettingsTab === "device" && (
                  <>
                    <ConfigurationManager
                      deviceName={deviceName}
                      disabled={
                        !persistenceReady ||
                        boardsLoading
                      }
                      onExport={
                        exportConfiguration
                      }
                      onImport={
                        importConfiguration
                      }
                      onReset={
                        resetConfiguration
                      }
                    />

                    <DeviceSettings
                      deviceName={deviceName}
                      friendlyName={friendlyName}
                      board={board}
                      includeFallbackAp={
                        includeFallbackAp
                      }
                      boards={boards}
                      boardsLoading={boardsLoading}
                      currentBoard={currentBoard}
                      onDeviceNameChange={
                        setDeviceName
                      }
                      onFriendlyNameChange={
                        setFriendlyName
                      }
                      onBoardChange={
                        handleBoardChange
                      }
                      onFallbackApChange={
                        setIncludeFallbackAp
                      }
                    />

                    <NetworkSystemSettings
                      settings={networkSettings}
                      includeFallbackAp={
                        includeFallbackAp
                      }
                      onChange={
                        updateNetworkSettings
                      }
                    />

                    <SystemFeaturesSettings
                      settings={systemFeatures}
                      onChange={
                        updateSystemFeatures
                      }
                    />
                  </>
                )}

                {activeSettingsTab === "outputs" && (
                  <>
                    <StatusLedSettings
                      currentBoard={currentBoard}
                      statusLed={statusLed}
                      onEnable={enableStatusLed}
                      onDisable={disableStatusLed}
                      onUpdate={updateStatusLed}
                    />

                    <PwmOutputEditor
                      currentBoard={currentBoard}
                      pwmOutputs={pwmOutputs}
                      onAdd={addPwmOutput}
                      onRemove={removePwmOutput}
                      onUpdate={updatePwmOutput}
                    />

                    <RelayEditor
                      currentBoard={currentBoard}
                      relays={relays}
                      onAdd={addRelay}
                      onRemove={removeRelay}
                      onUpdate={updateRelay}
                    />
                  </>
                )}

                {activeSettingsTab === "inputs" && (
                  <>
                    <AdcInputEditor
                      currentBoard={currentBoard}
                      adcInputs={adcInputs}
                      onAdd={addAdcInput}
                      onRemove={removeAdcInput}
                      onUpdate={updateAdcInput}
                    />

                    <BinarySensorEditor
                      currentBoard={currentBoard}
                      binarySensors={binarySensors}
                      onAdd={addBinarySensor}
                      onRemove={
                        removeBinarySensor
                      }
                      onUpdate={
                        updateBinarySensor
                      }
                      onUpdatePin={
                        updateBinarySensorPin
                      }
                    />
                  </>
                )}

                {activeSettingsTab ===
                  "automations" && (
                  <section className="rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 p-6">
                    <h2 className="text-xl font-semibold text-blue-100">
                      Automatizálások
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      A következő fejlesztési
                      csomagban ide kerül a vizuális
                      trigger–feltétel–művelet
                      szerkesztő.
                    </p>
                  </section>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>

      <GeneratedProjectDrawer
        open={resultsOpen}
        generatedFiles={generatedFiles}
        onCopy={copyFile}
        onDownload={downloadFile}
        onClose={() => setResultsOpen(false)}
      />
    </main>
  );
}
