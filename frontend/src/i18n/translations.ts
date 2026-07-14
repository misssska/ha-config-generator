
export const LANGUAGE_STORAGE_KEY =
  "ha-config-generator.language.v1";

export const SUPPORTED_LANGUAGES = [
  "hu",
  "en",
] as const;

export type Language =
  (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "hu";

const hungarianTranslations = {
  "language.label": "Nyelv",
  "language.hungarian": "Magyar",
  "language.english": "English",

  "app.title": "ESPHome konfigurációgenerátor",
  "app.subtitle":
    "Hardver, GPIO-k és automatizálások egyetlen munkafelületen.",
  "app.backend": "Backend",
  "app.automations.title": "Automatizálások",
  "app.automations.description":
    "A következő fejlesztési csomagban ide kerül a vizuális trigger–feltétel–művelet szerkesztő.",

  "workspace.unnamedDevice": "Névtelen eszköz",
  "workspace.loadingBoard": "Alaplap betöltése...",
  "workspace.outputCount": "{count} kimenet",
  "workspace.inputCount": "{count} bemenet",
  "workspace.results": "Eredmény ({count})",
  "workspace.generating": "Generálás...",
  "workspace.generate": "Generálás",

  "tabs.deviceNetwork": "Eszköz és hálózat",
  "tabs.outputs": "Kimenetek",
  "tabs.inputs": "Bemenetek",
  "tabs.automations": "Automatizálások",
  "tabs.ariaLabel": "Konfigurációs területek",
} as const;

export type TranslationKey =
  keyof typeof hungarianTranslations;

const englishTranslations: Record<
  TranslationKey,
  string
> = {
  "language.label": "Language",
  "language.hungarian": "Magyar",
  "language.english": "English",

  "app.title": "ESPHome configuration generator",
  "app.subtitle":
    "Hardware, GPIOs and automations in a single workspace.",
  "app.backend": "Backend",
  "app.automations.title": "Automations",
  "app.automations.description":
    "A visual trigger-condition-action editor will be added here in a future development package.",

  "workspace.unnamedDevice": "Unnamed device",
  "workspace.loadingBoard": "Loading board...",
  "workspace.outputCount": "{count} outputs",
  "workspace.inputCount": "{count} inputs",
  "workspace.results": "Results ({count})",
  "workspace.generating": "Generating...",
  "workspace.generate": "Generate",

  "tabs.deviceNetwork": "Device and network",
  "tabs.outputs": "Outputs",
  "tabs.inputs": "Inputs",
  "tabs.automations": "Automations",
  "tabs.ariaLabel": "Configuration areas",
};

export const TRANSLATIONS: Record<
  Language,
  Record<TranslationKey, string>
> = {
  hu: hungarianTranslations,
  en: englishTranslations,
};

export function isLanguage(
  value: string | null,
): value is Language {
  return SUPPORTED_LANGUAGES.includes(
    value as Language,
  );
}

export function translate(
  language: Language,
  key: TranslationKey,
  variables: Record<
    string,
    string | number
  > = {},
): string {
  const template = TRANSLATIONS[language][key];

  return template.replace(
    /\{(\w+)\}/g,
    (placeholder, variableName: string) => {
      const value = variables[variableName];

      return value === undefined
        ? placeholder
        : String(value);
    },
  );
}
