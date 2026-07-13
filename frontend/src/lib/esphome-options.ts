import type {
  BinaryDeviceClass,
  PullMode,
  RestoreMode,
} from "@/types/esphome";

export const RESTORE_OPTIONS: {
  value: RestoreMode;
  label: string;
}[] = [
  {
    value: "ALWAYS_OFF",
    label: "Mindig kikapcsolva indul",
  },
  {
    value: "ALWAYS_ON",
    label: "Mindig bekapcsolva indul",
  },
  {
    value: "RESTORE_DEFAULT_OFF",
    label: "Előző állapot, alapból KI",
  },
  {
    value: "RESTORE_DEFAULT_ON",
    label: "Előző állapot, alapból BE",
  },
];

export const PULL_OPTIONS: {
  value: PullMode;
  label: string;
}[] = [
  {
    value: "NONE",
    label: "Nincs belső ellenállás",
  },
  {
    value: "PULLUP",
    label: "Belső felhúzás – PULLUP",
  },
  {
    value: "PULLDOWN",
    label: "Belső lehúzás – PULLDOWN",
  },
];

export const DEVICE_CLASS_OPTIONS: {
  value: BinaryDeviceClass;
  label: string;
}[] = [
  { value: "", label: "Nincs megadva" },
  { value: "door", label: "Ajtó" },
  { value: "window", label: "Ablak" },
  { value: "garage_door", label: "Garázsajtó" },
  { value: "opening", label: "Nyílás" },
  { value: "motion", label: "Mozgás" },
  { value: "occupancy", label: "Jelenlét" },
  { value: "safety", label: "Biztonsági érzékelő" },
  { value: "problem", label: "Hiba" },
  { value: "smoke", label: "Füst" },
  { value: "moisture", label: "Nedvesség" },
  { value: "gas", label: "Gáz" },
  { value: "vibration", label: "Rezgés" },
  { value: "tamper", label: "Szabotázs" },
  { value: "running", label: "Üzemelés" },
];


export const LOGGER_LEVEL_OPTIONS = [
  { value: "NONE", label: "Kikapcsolva – NONE" },
  { value: "ERROR", label: "Csak hibák – ERROR" },
  { value: "WARN", label: "Figyelmeztetések – WARN" },
  { value: "INFO", label: "Információk – INFO" },
  { value: "DEBUG", label: "Hibakeresés – DEBUG" },
  { value: "VERBOSE", label: "Részletes – VERBOSE" },
  {
    value: "VERY_VERBOSE",
    label: "Nagyon részletes – VERY_VERBOSE",
  },
] as const;
