"use client";

import { useRef, useState } from "react";

import type {
  AdcInputConfig,
  BinarySensorConfig,
  BoardOption,
  GPIOPinOption,
  NetworkSettingsConfig,
  PwmOutputConfig,
  RelayConfig,
  StatusLedConfig,
  SystemFeaturesConfig,
} from "@/types/esphome";

type UseEsphomeFormOptions = {
  boards: BoardOption[];
  onError: (message: string) => void;
  onClearGeneratedFiles: () => void;
};

export function useEsphomeForm({
  boards,
  onError,
  onClearGeneratedFiles,
}: UseEsphomeFormOptions) {
  const [deviceName, setDeviceName] = useState("muhely-vezerlo");
  const [friendlyName, setFriendlyName] =
    useState("Műhely vezérlő");
  const [board, setBoard] = useState("esp32dev");
  const [includeFallbackAp, setIncludeFallbackAp] =
    useState(true);

  const [networkSettings, setNetworkSettings] =
    useState<NetworkSettingsConfig>({
      wifiUseSecrets: true,
      wifiSsid: "WIFI_NEVE",
      wifiPassword: "WIFI_JELSZO",
      useStaticIp: false,
      staticIp: "",
      gateway: "",
      subnet: "255.255.255.0",
      dns1: "",
      dns2: "",
      fallbackApSsid: "",
      fallbackApPassword: "",
      apiEncryptionEnabled: true,
      otaEnabled: true,
      loggerLevel: "DEBUG",
    });

  const [systemFeatures, setSystemFeatures] =
    useState<SystemFeaturesConfig>({
      includeUptimeSensor: true,
      includeWifiSignalSensor: true,
      includeRestartButton: true,
    });

  const [statusLed, setStatusLed] =
    useState<StatusLedConfig | null>(null);

  const [pwmOutputs, setPwmOutputs] = useState<
    PwmOutputConfig[]
  >([]);

  const [adcInputs, setAdcInputs] = useState<
    AdcInputConfig[]
  >([]);

  const [relays, setRelays] = useState<RelayConfig[]>([
    {
      clientId: 1,
      name: "Műhely világítás",
      pin: 23,
      inverted: true,
      restoreMode: "ALWAYS_OFF",
    },
  ]);

  const [binarySensors, setBinarySensors] = useState<
    BinarySensorConfig[]
  >([
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
  const nextPwmOutputId = useRef(1);
  const nextAdcInputId = useRef(1);

  const resolvedBoard =
    boards.some(
      (boardOption) => boardOption.id === board,
    )
      ? board
      : (boards[0]?.id ?? board);

  const currentBoard = boards.find(
    (boardOption) => boardOption.id === resolvedBoard,
  );

  function getPinProfile(
    pinNumber: number,
  ): GPIOPinOption | undefined {
    return currentBoard?.pins.find(
      (pinOption) => pinOption.number === pinNumber,
    );
  }

  function getUsedPins(): Set<number> {
    return new Set([
      ...relays.map((relay) => relay.pin),
      ...binarySensors.map((sensor) => sensor.pin),
      ...(statusLed ? [statusLed.pin] : []),
      ...pwmOutputs.map((output) => output.pin),
      ...adcInputs.map((input) => input.pin),
    ]);
  }

  function findFreePin(
    pinType: "input" | "output" | "pwm" | "adc",
  ): number | null {
    if (!currentBoard) {
      return null;
    }

    const usedPins = getUsedPins();

    const pin = currentBoard.pins.find((pinOption) => {
      const supportsType = {
        input: pinOption.can_input,
        output: pinOption.can_output,
        pwm: pinOption.supports_pwm,
        adc: pinOption.supports_adc,
      }[pinType];

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

    const targetBoard = nextBoard;
    const usedPins = new Set<number>();

    function findCompatiblePin(
      currentPin: number,
      predicate: (pinOption: GPIOPinOption) => boolean,
    ): GPIOPinOption | undefined {
      return (
        targetBoard.pins.find(
          (pinOption) =>
            pinOption.number === currentPin &&
            predicate(pinOption) &&
            !usedPins.has(pinOption.number),
        ) ??
        targetBoard.pins.find(
          (pinOption) =>
            predicate(pinOption) &&
            !usedPins.has(pinOption.number),
        )
      );
    }

    const nextRelays: RelayConfig[] = [];

    for (const relay of relays) {
      const pinProfile = findCompatiblePin(
        relay.pin,
        (pinOption) => pinOption.can_output,
      );

      if (!pinProfile) {
        onError(
          `${targetBoard.label}: nincs elegendő szabad kimeneti GPIO a hozzáadott relékhez.`,
        );
        return;
      }

      usedPins.add(pinProfile.number);

      nextRelays.push({
        ...relay,
        pin: pinProfile.number,
      });
    }

    const nextSensors: BinarySensorConfig[] = [];

    for (const sensor of binarySensors) {
      const pinProfile = findCompatiblePin(
        sensor.pin,
        (pinOption) => pinOption.can_input,
      );

      if (!pinProfile) {
        onError(
          `${targetBoard.label}: nincs elegendő szabad bemeneti GPIO a hozzáadott érzékelőkhöz.`,
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

    let nextStatusLed = statusLed;

    if (statusLed) {
      const pinProfile = findCompatiblePin(
        statusLed.pin,
        (pinOption) => pinOption.can_output,
      );

      if (!pinProfile) {
        onError(
          `${targetBoard.label}: nincs szabad kimeneti GPIO a státusz-LED számára.`,
        );
        return;
      }

      usedPins.add(pinProfile.number);

      nextStatusLed = {
        ...statusLed,
        pin: pinProfile.number,
      };
    }

    const nextPwmOutputs: PwmOutputConfig[] = [];

    for (const output of pwmOutputs) {
      const pinProfile = findCompatiblePin(
        output.pin,
        (pinOption) => pinOption.supports_pwm,
      );

      if (!pinProfile) {
        onError(
          `${targetBoard.label}: nincs elegendő szabad PWM-kimenet.`,
        );
        return;
      }

      usedPins.add(pinProfile.number);

      nextPwmOutputs.push({
        ...output,
        pin: pinProfile.number,
      });
    }

    const nextAdcInputs: AdcInputConfig[] = [];

    for (const input of adcInputs) {
      const pinProfile = findCompatiblePin(
        input.pin,
        (pinOption) => pinOption.supports_adc,
      );

      if (!pinProfile) {
        onError(
          `${targetBoard.label}: nincs elegendő szabad ADC-bemenet.`,
        );
        return;
      }

      usedPins.add(pinProfile.number);

      nextAdcInputs.push({
        ...input,
        pin: pinProfile.number,
      });
    }

    onError("");
    setBoard(nextBoardId);
    setRelays(nextRelays);
    setBinarySensors(nextSensors);
    setStatusLed(nextStatusLed);
    setPwmOutputs(nextPwmOutputs);
    setAdcInputs(nextAdcInputs);
    onClearGeneratedFiles();
  }

  function enableStatusLed() {
    if (statusLed) {
      return;
    }

    const freePin = findFreePin("output");

    if (freePin === null) {
      onError(
        "A kiválasztott alaplapon nincs szabad GPIO a státusz-LED számára.",
      );
      return;
    }

    onError("");
    setStatusLed({
      pin: freePin,
      inverted: true,
    });
    onClearGeneratedFiles();
  }

  function disableStatusLed() {
    setStatusLed(null);
    onError("");
    onClearGeneratedFiles();
  }

  function updateStatusLed(
    updates: Partial<StatusLedConfig>,
  ) {
    setStatusLed((currentStatusLed) =>
      currentStatusLed
        ? {
            ...currentStatusLed,
            ...updates,
          }
        : currentStatusLed,
    );

    onClearGeneratedFiles();
  }

  function addPwmOutput() {
    if (pwmOutputs.length >= 8) {
      onError(
        "Legfeljebb 8 PWM-kimenet adható egy eszközhöz.",
      );
      return;
    }

    const freePin = findFreePin("pwm");

    if (freePin === null) {
      onError(
        "A kiválasztott alaplapon nincs több szabad PWM-kimenet.",
      );
      return;
    }

    onError("");

    setPwmOutputs((currentOutputs) => [
      ...currentOutputs,
      {
        clientId: nextPwmOutputId.current++,
        name: `PWM kimenet ${currentOutputs.length + 1}`,
        pin: freePin,
        inverted: false,
        frequencyHz: 1000,
      },
    ]);

    onClearGeneratedFiles();
  }

  function removePwmOutput(clientId: number) {
    setPwmOutputs((currentOutputs) =>
      currentOutputs.filter(
        (output) => output.clientId !== clientId,
      ),
    );

    onClearGeneratedFiles();
  }

  function updatePwmOutput(
    clientId: number,
    updates: Partial<Omit<PwmOutputConfig, "clientId">>,
  ) {
    setPwmOutputs((currentOutputs) =>
      currentOutputs.map((output) =>
        output.clientId === clientId
          ? {
              ...output,
              ...updates,
            }
          : output,
      ),
    );

    onClearGeneratedFiles();
  }

  function addAdcInput() {
    if (adcInputs.length >= 8) {
      onError(
        "Legfeljebb 8 ADC-bemenet adható egy eszközhöz.",
      );
      return;
    }

    const freePin = findFreePin("adc");

    if (freePin === null) {
      onError(
        "A kiválasztott alaplapon nincs több szabad ADC-bemenet.",
      );
      return;
    }

    onError("");

    setAdcInputs((currentInputs) => [
      ...currentInputs,
      {
        clientId: nextAdcInputId.current++,
        name: `ADC bemenet ${currentInputs.length + 1}`,
        pin: freePin,
        updateIntervalS: 60,
        attenuation: "auto",
      },
    ]);

    onClearGeneratedFiles();
  }

  function removeAdcInput(clientId: number) {
    setAdcInputs((currentInputs) =>
      currentInputs.filter(
        (input) => input.clientId !== clientId,
      ),
    );

    onClearGeneratedFiles();
  }

  function updateAdcInput(
    clientId: number,
    updates: Partial<Omit<AdcInputConfig, "clientId">>,
  ) {
    setAdcInputs((currentInputs) =>
      currentInputs.map((input) =>
        input.clientId === clientId
          ? {
              ...input,
              ...updates,
            }
          : input,
      ),
    );

    onClearGeneratedFiles();
  }

  function addRelay() {
    if (relays.length >= 8) {
      onError("Legfeljebb 8 relé adható egy eszközhöz.");
      return;
    }

    const freePin = findFreePin("output");

    if (freePin === null) {
      onError(
        "A kiválasztott alaplapon nincs több szabad kimeneti GPIO.",
      );
      return;
    }

    onError("");

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
      currentRelays.filter(
        (relay) => relay.clientId !== clientId,
      ),
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
      onError(
        "Legfeljebb 16 digitális bemenet adható egy eszközhöz.",
      );
      return;
    }

    const freePin = findFreePin("input");

    if (freePin === null) {
      onError(
        "A kiválasztott alaplapon nincs több szabad bemeneti GPIO.",
      );
      return;
    }

    const pinProfile = getPinProfile(freePin);

    onError("");

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
      currentSensors.filter(
        (sensor) => sensor.clientId !== clientId,
      ),
    );
  }

  function updateBinarySensor(
    clientId: number,
    updates: Partial<
      Omit<BinarySensorConfig, "clientId">
    >,
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

  function updateSystemFeatures(
    updates: Partial<SystemFeaturesConfig>,
  ) {
    setSystemFeatures((currentSettings) => ({
      ...currentSettings,
      ...updates,
    }));

    onClearGeneratedFiles();
  }

  function updateNetworkSettings(
    updates: Partial<NetworkSettingsConfig>,
  ) {
    setNetworkSettings((currentSettings) => ({
      ...currentSettings,
      ...updates,
    }));

    onClearGeneratedFiles();
  }

  function validateHardware(): string | null {
    if (!currentBoard) {
      return "A kiválasztott alaplap GPIO-profilja nem érhető el.";
    }

    if (!networkSettings.wifiSsid.trim()) {
      return "A Wi-Fi SSID megadása kötelező.";
    }

    if (
      networkSettings.wifiPassword.length < 8 ||
      networkSettings.wifiPassword.length > 63
    ) {
      return "A Wi-Fi-jelszó 8 és 63 karakter közötti lehet.";
    }

    if (
      includeFallbackAp &&
      networkSettings.fallbackApPassword.length > 0 &&
      networkSettings.fallbackApPassword.length < 8
    ) {
      return "A fallback AP jelszava legalább 8 karakter legyen.";
    }

    if (networkSettings.useStaticIp) {
      const requiredIpValues = [
        networkSettings.staticIp,
        networkSettings.gateway,
        networkSettings.subnet,
      ];

      if (
        requiredIpValues.some(
          (value) => !value.trim(),
        )
      ) {
        return "Statikus IP használatakor az IP-cím, az átjáró és az alhálózati maszk kötelező.";
      }
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

    if (statusLed) {
      const pinProfile = currentBoard.pins.find(
        (pinOption) => pinOption.number === statusLed.pin,
      );

      if (!pinProfile) {
        return `GPIO${statusLed.pin} nem érhető el a kiválasztott alaplapon.`;
      }

      if (!pinProfile.can_output) {
        return `GPIO${statusLed.pin} nem használható státusz-LED kimenetként.`;
      }

      const previousUsage = usedPins.get(statusLed.pin);

      if (previousUsage) {
        return `A GPIO${statusLed.pin} többször van használva: ${previousUsage} és státusz-LED.`;
      }

      usedPins.set(statusLed.pin, "státusz-LED");
    }

    for (const output of pwmOutputs) {
      const name = output.name.trim();
      const pinProfile = currentBoard.pins.find(
        (pinOption) => pinOption.number === output.pin,
      );

      if (!name) {
        return "Minden PWM-kimenetnek kötelező nevet adni.";
      }

      if (!pinProfile) {
        return `GPIO${output.pin} nem érhető el a kiválasztott alaplapon.`;
      }

      if (!pinProfile.supports_pwm) {
        return `GPIO${output.pin} nem támogat PWM-kimenetet.`;
      }

      if (
        !Number.isInteger(output.frequencyHz) ||
        output.frequencyHz < 10 ||
        output.frequencyHz > 40000
      ) {
        return `${name}: a PWM-frekvencia 10 és 40000 Hz közötti egész szám lehet.`;
      }

      const previousUsage = usedPins.get(output.pin);

      if (previousUsage) {
        return `A GPIO${output.pin} többször van használva: ${previousUsage} és PWM-kimenet: ${name}.`;
      }

      usedPins.set(output.pin, `PWM-kimenet: ${name}`);
    }

    for (const input of adcInputs) {
      const name = input.name.trim();
      const pinProfile = currentBoard.pins.find(
        (pinOption) => pinOption.number === input.pin,
      );

      if (!name) {
        return "Minden ADC-bemenetnek kötelező nevet adni.";
      }

      if (!pinProfile) {
        return `GPIO${input.pin} nem érhető el a kiválasztott alaplapon.`;
      }

      if (!pinProfile.supports_adc) {
        return `GPIO${input.pin} nem támogat ADC-bemenetet.`;
      }

      if (
        !Number.isInteger(input.updateIntervalS) ||
        input.updateIntervalS < 1 ||
        input.updateIntervalS > 3600
      ) {
        return `${name}: a frissítési idő 1 és 3600 másodperc közötti egész szám lehet.`;
      }

      const previousUsage = usedPins.get(input.pin);

      if (previousUsage) {
        return `A GPIO${input.pin} többször van használva: ${previousUsage} és ADC-bemenet: ${name}.`;
      }

      usedPins.set(input.pin, `ADC-bemenet: ${name}`);
    }

    return null;
  }

  return {
    deviceName,
    setDeviceName,
    friendlyName,
    setFriendlyName,
    board: resolvedBoard,
    setBoard,
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
  };
}
