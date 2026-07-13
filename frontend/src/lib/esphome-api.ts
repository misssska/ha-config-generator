import type {
  BinarySensorConfig,
  BoardOption,
  GenerateResponse,
  RelayConfig,
} from "@/types/esphome";

export const ESPHOME_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type GenerateProjectInput = {
  deviceName: string;
  friendlyName: string;
  board: string;
  includeFallbackAp: boolean;
  relays: RelayConfig[];
  binarySensors: BinarySensorConfig[];
};

type ApiErrorResponse = {
  detail?:
    | string
    | {
        msg?: string;
      }[];
};

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;

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
    // A backend válasza nem JSON-formátumú.
  }

  return `${fallbackMessage}: HTTP ${response.status}`;
}

export async function fetchBoards(
  signal?: AbortSignal,
): Promise<BoardOption[]> {
  const response = await fetch(
    `${ESPHOME_API_URL}/api/esphome/boards`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Az alaplapok lekérése sikertelen: HTTP ${response.status}`,
    );
  }

  return (await response.json()) as BoardOption[];
}

export async function generateEsphomeProject({
  deviceName,
  friendlyName,
  board,
  includeFallbackAp,
  relays,
  binarySensors,
}: GenerateProjectInput): Promise<GenerateResponse> {
  const response = await fetch(
    `${ESPHOME_API_URL}/api/esphome/generate`,
    {
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
            sensor.deviceClass === ""
              ? null
              : sensor.deviceClass,
          delayed_on_ms: sensor.delayedOnMs,
          delayed_off_ms: sensor.delayedOffMs,
        })),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "A generálás sikertelen"),
    );
  }

  return (await response.json()) as GenerateResponse;
}
