import type {
  AdcInputConfig,
  BinarySensorConfig,
  BoardOption,
  FeedbackCreateInput,
  FeedbackCreateResponse,
  GenerateResponse,
  GenerationStats,
  NetworkSettingsConfig,
  PwmOutputConfig,
  RelayConfig,
  StatusLedConfig,
  SystemFeaturesConfig,
} from "@/types/esphome";

export const ESPHOME_API_URL = "/backend-api";

export type GenerateProjectInput = {
  deviceName: string;
  friendlyName: string;
  board: string;
  includeFallbackAp: boolean;
  networkSettings: NetworkSettingsConfig;
  systemFeatures: SystemFeaturesConfig;
  statusLed: StatusLedConfig | null;
  pwmOutputs: PwmOutputConfig[];
  adcInputs: AdcInputConfig[];
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

export async function submitFeedback({
  category,
  message,
  email = "",
  website = "",
}: FeedbackCreateInput): Promise<FeedbackCreateResponse> {
  const response = await fetch(
    `${ESPHOME_API_URL}/api/feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category,
        message: message.trim(),
        email: email.trim() || null,
        website: website.trim(),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "A visszajelz\u00e9s elk\u00fcld\u00e9se sikertelen",
      ),
    );
  }

  return (
    await response.json()
  ) as FeedbackCreateResponse;
}

export async function fetchGenerationStats(
  signal?: AbortSignal,
): Promise<GenerationStats> {
  const response = await fetch(
    `${ESPHOME_API_URL}/api/stats`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "A statisztika lek\u00e9r\u00e9se sikertelen",
      ),
    );
  }

  return (await response.json()) as GenerationStats;
}

export async function generateEsphomeProject({
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
        wifi_use_secrets: networkSettings.wifiUseSecrets,
        wifi_ssid: networkSettings.wifiSsid.trim(),
        wifi_password: networkSettings.wifiPassword,
        use_static_ip: networkSettings.useStaticIp,
        static_ip: networkSettings.useStaticIp
          ? networkSettings.staticIp.trim()
          : null,
        gateway: networkSettings.useStaticIp
          ? networkSettings.gateway.trim()
          : null,
        subnet: networkSettings.useStaticIp
          ? networkSettings.subnet.trim()
          : null,
        dns1: networkSettings.dns1.trim() || null,
        dns2: networkSettings.dns2.trim() || null,
        fallback_ap_ssid:
          networkSettings.fallbackApSsid.trim() || null,
        fallback_ap_password:
          networkSettings.fallbackApPassword || null,
        api_encryption_enabled:
          networkSettings.apiEncryptionEnabled,
        ota_enabled: networkSettings.otaEnabled,
        logger_level: networkSettings.loggerLevel,
        include_uptime_sensor:
          systemFeatures.includeUptimeSensor,
        include_wifi_signal_sensor:
          systemFeatures.includeWifiSignalSensor,
        include_restart_button:
          systemFeatures.includeRestartButton,
        status_led: statusLed
          ? {
              pin: statusLed.pin,
              inverted: statusLed.inverted,
            }
          : null,
        pwm_outputs: pwmOutputs.map((output) => ({
          name: output.name.trim(),
          pin: output.pin,
          inverted: output.inverted,
          frequency_hz: output.frequencyHz,
        })),
        adc_inputs: adcInputs.map((input) => ({
          name: input.name.trim(),
          pin: input.pin,
          update_interval_s: input.updateIntervalS,
          attenuation: input.attenuation,
        })),
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
