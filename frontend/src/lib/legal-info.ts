import {
  LANGUAGE_STORAGE_KEY,
} from "@/i18n/translations";
import {
  CONFIG_STORAGE_KEY,
} from "@/lib/config-persistence";

export const DATA_CONTROLLER = {
  name: "Papp Milán",
  type: "magánszemély",
  displayName: "misssska",
  email: "misssska@gmail.com",
  location:
    "6528 Bátmonostor, Magyarország",
} as const;

export const PRIVACY_NOTICE_LAST_UPDATED =
  "2026. július 15.";

export const FEEDBACK_RETENTION_MONTHS = 12;

export const LOCAL_STORAGE_ITEMS = [
  {
    key: LANGUAGE_STORAGE_KEY,
    purpose:
      "A kiválasztott felületi nyelv megjegyzése.",
  },
  {
    key: CONFIG_STORAGE_KEY,
    purpose:
      "A folyamatban lévő ESPHome-konfiguráció helyi mentése.",
  },
] as const;
