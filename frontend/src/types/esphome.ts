export type GPIOPinOption = {
  number: number;
  label: string;
  can_input: boolean;
  can_output: boolean;
  supports_pullup: boolean;
  supports_pulldown: boolean;
  supports_pwm: boolean;
  supports_adc: boolean;
  warning: string | null;
};

export type BoardOption = {
  id: string;
  label: string;
  platform: "esp32" | "esp8266";
  pins: GPIOPinOption[];
};

export type GeneratedFile = {
  filename: string;
  content: string;
};

export type GenerateResponse = {
  files: GeneratedFile[];
};

export type GenerationStats = {
  successful_generations: number;
};

export type FeedbackCategory =
  | "bug"
  | "idea"
  | "other";

export type FeedbackCreateInput = {
  category: FeedbackCategory;
  message: string;
  email?: string;
  website?: string;
};

export type FeedbackCreateResponse = {
  accepted: boolean;
};

export type RestoreMode =
  | "ALWAYS_OFF"
  | "ALWAYS_ON"
  | "RESTORE_DEFAULT_OFF"
  | "RESTORE_DEFAULT_ON";

export type PullMode = "NONE" | "PULLUP" | "PULLDOWN";

export type BinaryDeviceClass =
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

export type RelayConfig = {
  clientId: number;
  name: string;
  pin: number;
  inverted: boolean;
  restoreMode: RestoreMode;
};

export type BinarySensorConfig = {
  clientId: number;
  name: string;
  pin: number;
  inverted: boolean;
  pullMode: PullMode;
  deviceClass: BinaryDeviceClass;
  delayedOnMs: number;
  delayedOffMs: number;
};


export type StatusLedConfig = {
  pin: number;
  inverted: boolean;
};

export type PwmOutputConfig = {
  clientId: number;
  name: string;
  pin: number;
  inverted: boolean;
  frequencyHz: number;
};

export type AdcAttenuation =
  | "auto"
  | "0db"
  | "2.5db"
  | "6db"
  | "12db";

export type AdcInputConfig = {
  clientId: number;
  name: string;
  pin: number;
  updateIntervalS: number;
  attenuation: AdcAttenuation;
};

export type LoggerLevel =
  | "NONE"
  | "ERROR"
  | "WARN"
  | "INFO"
  | "DEBUG"
  | "VERBOSE"
  | "VERY_VERBOSE";

export type NetworkSettingsConfig = {
  wifiUseSecrets: boolean;
  wifiSsid: string;
  wifiPassword: string;
  useStaticIp: boolean;
  staticIp: string;
  gateway: string;
  subnet: string;
  dns1: string;
  dns2: string;
  fallbackApSsid: string;
  fallbackApPassword: string;
  apiEncryptionEnabled: boolean;
  otaEnabled: boolean;
  loggerLevel: LoggerLevel;
};

export type SystemFeaturesConfig = {
  includeUptimeSensor: boolean;
  includeWifiSignalSensor: boolean;
  includeRestartButton: boolean;
};


export type EsphomeFormSnapshot = {
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
