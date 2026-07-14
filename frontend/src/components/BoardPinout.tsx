"use client";

import type {
  AdcInputConfig,
  BinarySensorConfig,
  BoardOption,
  GPIOPinOption,
  PwmOutputConfig,
  RelayConfig,
  StatusLedConfig,
} from "@/types/esphome";

export type SettingsTabId =
  | "device"
  | "outputs"
  | "inputs"
  | "automations";

type PinUsageKind =
  | "relay"
  | "binary"
  | "status"
  | "pwm"
  | "adc";

type PinUsage = {
  kind: PinUsageKind;
  label: string;
  targetId: string;
  tabId: SettingsTabId;
};

type AuxiliaryPin = {
  key: string;
  label: string;
  description: string;
};

type VisualPin =
  | {
      type: "gpio";
      key: string;
      pin: GPIOPinOption;
    }
  | {
      type: "auxiliary";
      key: string;
      pin: AuxiliaryPin;
    };

type BoardPinoutProps = {
  currentBoard: BoardOption | undefined;
  statusLed: StatusLedConfig | null;
  pwmOutputs: PwmOutputConfig[];
  adcInputs: AdcInputConfig[];
  relays: RelayConfig[];
  binarySensors: BinarySensorConfig[];
  onNavigate?: (
    tabId: SettingsTabId,
    targetId: string,
  ) => void;
};

const PIN_KIND_STYLES: Record<
  PinUsageKind,
  string
> = {
  relay:
    "border-emerald-400 bg-emerald-500/25 text-emerald-100",
  binary:
    "border-violet-400 bg-violet-500/25 text-violet-100",
  status:
    "border-amber-400 bg-amber-500/25 text-amber-100",
  pwm:
    "border-cyan-400 bg-cyan-500/25 text-cyan-100",
  adc:
    "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100",
};

const LEGEND_ITEMS: Array<{
  kind: PinUsageKind;
  label: string;
}> = [
  {
    kind: "relay",
    label: "Relé",
  },
  {
    kind: "binary",
    label: "Digitális",
  },
  {
    kind: "status",
    label: "LED",
  },
  {
    kind: "pwm",
    label: "PWM",
  },
  {
    kind: "adc",
    label: "ADC",
  },
];

const AUXILIARY_PINS: Record<
  string,
  AuxiliaryPin[]
> = {
  esp32dev: [
    {
      key: "3v3",
      label: "3V3",
      description: "3,3 V",
    },
    {
      key: "en",
      label: "EN",
      description: "Reset",
    },
    {
      key: "vin",
      label: "VIN / 5V",
      description: "Táp",
    },
    {
      key: "gnd-1",
      label: "GND",
      description: "Föld",
    },
    {
      key: "gnd-2",
      label: "GND",
      description: "Föld",
    },
  ],
  "esp32-c3-devkitm-1": [
    {
      key: "5v",
      label: "5V",
      description: "Táp",
    },
    {
      key: "3v3",
      label: "3V3",
      description: "3,3 V",
    },
    {
      key: "rst",
      label: "RST",
      description: "Reset",
    },
    {
      key: "gnd-1",
      label: "GND",
      description: "Föld",
    },
    {
      key: "gnd-2",
      label: "GND",
      description: "Föld",
    },
  ],
  "esp32-s3-devkitc-1": [
    {
      key: "5v",
      label: "5V",
      description: "Táp",
    },
    {
      key: "3v3",
      label: "3V3",
      description: "3,3 V",
    },
    {
      key: "en",
      label: "EN",
      description: "Reset",
    },
    {
      key: "gnd-1",
      label: "GND",
      description: "Föld",
    },
    {
      key: "gnd-2",
      label: "GND",
      description: "Föld",
    },
  ],
  nodemcuv2: [
    {
      key: "vin",
      label: "VIN",
      description: "Táp",
    },
    {
      key: "3v3",
      label: "3V3",
      description: "3,3 V",
    },
    {
      key: "en",
      label: "EN",
      description: "Engedélyezés",
    },
    {
      key: "rst",
      label: "RST",
      description: "Reset",
    },
    {
      key: "gnd-1",
      label: "GND",
      description: "Föld",
    },
    {
      key: "gnd-2",
      label: "GND",
      description: "Föld",
    },
  ],
  d1_mini: [
    {
      key: "5v",
      label: "5V",
      description: "Táp",
    },
    {
      key: "3v3",
      label: "3V3",
      description: "3,3 V",
    },
    {
      key: "rst",
      label: "RST",
      description: "Reset",
    },
    {
      key: "gnd",
      label: "GND",
      description: "Föld",
    },
  ],
};

export default function BoardPinout({
  currentBoard,
  statusLed,
  pwmOutputs,
  adcInputs,
  relays,
  binarySensors,
  onNavigate,
}: BoardPinoutProps) {
  const usageByPin = new Map<number, PinUsage[]>();

  function addUsage(
    pin: number,
    usage: PinUsage,
  ): void {
    const usages = usageByPin.get(pin) ?? [];

    usageByPin.set(pin, [
      ...usages,
      usage,
    ]);
  }

  for (const relay of relays) {
    addUsage(relay.pin, {
      kind: "relay",
      label: relay.name,
      targetId: `relay-pin-${relay.clientId}`,
      tabId: "outputs",
    });
  }

  for (const sensor of binarySensors) {
    addUsage(sensor.pin, {
      kind: "binary",
      label: sensor.name,
      targetId: `sensor-pin-${sensor.clientId}`,
      tabId: "inputs",
    });
  }

  if (statusLed) {
    addUsage(statusLed.pin, {
      kind: "status",
      label: "Státusz-LED",
      targetId: "status-led-pin",
      tabId: "outputs",
    });
  }

  for (const output of pwmOutputs) {
    addUsage(output.pin, {
      kind: "pwm",
      label: output.name,
      targetId: `pwm-pin-${output.clientId}`,
      tabId: "outputs",
    });
  }

  for (const input of adcInputs) {
    addUsage(input.pin, {
      kind: "adc",
      label: input.name,
      targetId: `adc-pin-${input.clientId}`,
      tabId: "inputs",
    });
  }

  function navigateToUsage(
    usage: PinUsage,
  ): void {
    if (onNavigate) {
      onNavigate(
        usage.tabId,
        usage.targetId,
      );

      return;
    }

    const target = document.getElementById(
      usage.targetId,
    ) as HTMLElement | null;

    target?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target?.focus({
      preventScroll: true,
    });
  }

  function renderVisualPin(
    visualPin: VisualPin,
    side: "left" | "right",
  ) {
    const reverse =
      side === "right"
        ? "flex-row-reverse text-right"
        : "";

    if (visualPin.type === "auxiliary") {
      return (
        <div
          key={visualPin.key}
          title={visualPin.pin.description}
          className={[
            "flex h-[30px] items-center gap-1.5",
            reverse,
          ].join(" ")}
        >
          <div className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1">
            <div className="truncate font-mono text-[10px] font-semibold leading-[11px] text-slate-200">
              {visualPin.pin.label}
            </div>

            <div className="truncate text-[8px] leading-[9px] text-slate-500">
              {visualPin.pin.description}
            </div>
          </div>

          <span className="h-px w-2.5 bg-slate-600" />

          <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-slate-500 bg-slate-700" />
        </div>
      );
    }

    const usages =
      usageByPin.get(visualPin.pin.number) ?? [];

    const firstUsage = usages[0];
    const hasConflict = usages.length > 1;

    const usageText =
      usages.length > 0
        ? usages
            .map((usage) => usage.label)
            .join(", ")
        : "Szabad";

    const styleClass = hasConflict
      ? "border-red-400 bg-red-500/25 text-red-100"
      : firstUsage
        ? PIN_KIND_STYLES[firstUsage.kind]
        : "border-slate-700 bg-slate-950/65 text-slate-500";

    return (
      <button
        key={visualPin.key}
        type="button"
        disabled={!firstUsage}
        onClick={() => {
          if (firstUsage) {
            navigateToUsage(firstUsage);
          }
        }}
        aria-label={[
          visualPin.pin.label,
          usageText,
          visualPin.pin.warning
            ? "figyelmeztetés"
            : "",
          hasConflict
            ? "ütközés"
            : "",
        ]
          .filter(Boolean)
          .join(", ")}
        title={
          visualPin.pin.warning
            ? `${usageText}
${visualPin.pin.warning}`
            : usageText
        }
        className={[
          "flex h-[30px] w-full items-center gap-1.5 text-left",
          reverse,
          firstUsage
            ? "cursor-pointer"
            : "cursor-default",
        ].join(" ")}
      >
        <div
          className={[
            "min-w-0 flex-1 rounded-md border px-2 py-1 transition",
            firstUsage
              ? "shadow-sm hover:brightness-125"
              : "",
            styleClass,
          ].join(" ")}
        >
          <div
            className={[
              "flex min-w-0 items-center gap-0.5",
              side === "right"
                ? "justify-end"
                : "",
            ].join(" ")}
          >
            <span className="truncate font-mono text-[10px] font-semibold leading-[11px]">
              {visualPin.pin.label}
            </span>

            {visualPin.pin.warning && (
              <span
                aria-hidden="true"
                className="shrink-0 text-[9px] text-amber-300"
              >
                ⚠
              </span>
            )}
          </div>

          <div className="truncate text-[8px] leading-[9px] opacity-85">
            {usageText}
          </div>
        </div>

        <span
          className={[
            "h-px w-2.5",
            firstUsage
              ? "bg-current opacity-70"
              : "bg-slate-700",
          ].join(" ")}
        />

        <span
          className={[
            "h-2.5 w-2.5 shrink-0 rounded-sm border",
            hasConflict
              ? "border-red-300 bg-red-400"
              : firstUsage
                ? "border-current bg-current"
                : "border-slate-600 bg-slate-800",
          ].join(" ")}
        />
      </button>
    );
  }

  if (!currentBoard) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
        <h2 className="text-lg font-semibold">
          Alaplap és pinek
        </h2>

        <div className="mt-3 rounded-xl border border-dashed border-slate-700 p-5 text-center text-xs text-slate-500">
          Az alaplap adatai még nem érhetők el.
        </div>
      </section>
    );
  }

  const auxiliaryPins =
    AUXILIARY_PINS[currentBoard.id] ?? [];

  const visualPins: VisualPin[] = [
    ...auxiliaryPins.map(
      (pin): VisualPin => ({
        type: "auxiliary",
        key: `aux-${pin.key}`,
        pin,
      }),
    ),
    ...currentBoard.pins.map(
      (pin): VisualPin => ({
        type: "gpio",
        key: `gpio-${pin.number}`,
        pin,
      }),
    ),
  ];

  const middleIndex = Math.ceil(
    visualPins.length / 2,
  );

  const leftPins = visualPins.slice(
    0,
    middleIndex,
  );

  const rightPins = visualPins.slice(
    middleIndex,
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">
            Alaplap és pinek
          </h2>

          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            Minden pin látható, a használt pinek
            funkció szerint kiemelve.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
          {usageByPin.size} használt
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
        <div className="text-center">
          <div className="truncate text-sm font-semibold text-blue-200">
            {currentBoard.label}
          </div>

          <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500">
            {visualPins.length} pin
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] gap-2">
          <div className="space-y-1">
            {leftPins.map((pin) =>
              renderVisualPin(pin, "left"),
            )}
          </div>

          <div className="relative overflow-hidden rounded-lg border border-blue-500/30 bg-gradient-to-b from-blue-950 via-slate-950 to-blue-950">
            <div className="absolute left-1/2 top-0 h-6 w-12 -translate-x-1/2 rounded-b-md border-x border-b border-slate-500 bg-slate-300">
              <div className="mx-auto mt-1 h-2 w-8 rounded-sm bg-slate-600" />
            </div>

            <div className="flex h-full flex-col items-center justify-center px-1 py-7 text-center">
              <div className="rounded-md border border-blue-400/30 bg-blue-500/10 px-2 py-3">
                <div className="text-[10px] font-bold text-blue-200">
                  MCU
                </div>

                <div className="mt-1 text-[8px] leading-[9px] text-slate-500">
                  {currentBoard.platform.toUpperCase()}
                </div>
              </div>

              <div className="mt-4 text-[8px] leading-[9px] text-slate-500">
                USB
                <br />
                ↓
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {rightPins.map((pin) =>
              renderVisualPin(pin, "right"),
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {LEGEND_ITEMS.map((item) => (
          <span
            key={item.kind}
            className={[
              "rounded-full border px-2 py-0.5 text-[9px]",
              PIN_KIND_STYLES[item.kind],
            ].join(" ")}
          >
            {item.label}
          </span>
        ))}

        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-200">
          ⚠ Különleges
        </span>
      </div>
    </section>
  );
}
