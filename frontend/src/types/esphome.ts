export type GPIOPinOption = {
  number: number;
  label: string;
  can_input: boolean;
  can_output: boolean;
  supports_pullup: boolean;
  supports_pulldown: boolean;
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
