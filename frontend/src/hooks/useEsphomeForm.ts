"use client";

import { useRef, useState } from "react";

import type {
  BinarySensorConfig,
  BoardOption,
  GPIOPinOption,
  RelayConfig,
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
        onError(
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
        onError(
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

    onError("");
    setBoard(nextBoardId);
    setRelays(nextRelays);
    setBinarySensors(nextSensors);
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

  return {
    deviceName,
    setDeviceName,
    friendlyName,
    setFriendlyName,
    board: resolvedBoard,
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
  };
}
