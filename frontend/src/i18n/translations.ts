
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

  "feedback.open": "Visszajelz\u00e9s",
  "feedback.close": "Bez\u00e1r\u00e1s",
  "feedback.closeDialog": "Visszajelz\u00e9si panel bez\u00e1r\u00e1sa",
  "feedback.dialogLabel": "Visszajelz\u00e9s k\u00fcld\u00e9se",
  "feedback.title": "Visszajelz\u00e9s k\u00fcld\u00e9se",
  "feedback.subtitle": "Hib\u00e1t tal\u00e1lt\u00e1l vagy van egy fejleszt\u00e9si \u00f6tleted? \u00cdrd meg nek\u00fcnk.",
  "feedback.category": "Kateg\u00f3ria",
  "feedback.category.bug": "Hiba",
  "feedback.category.idea": "\u00d6tlet",
  "feedback.category.other": "Egy\u00e9b",
  "feedback.message": "Visszajelz\u00e9s",
  "feedback.messageHint": "Legal\u00e1bb 10, legfeljebb 4000 karakter.",
  "feedback.email": "E-mail-c\u00edm",
  "feedback.emailHint": "Nem k\u00f6telez\u0151. Csak akkor add meg, ha v\u00e1laszt szeretn\u00e9l.",
  "feedback.privacy": "Ne k\u00fcldj Wi-Fi-jelsz\u00f3t, API-kulcsot, teljes secrets.yaml f\u00e1jlt vagy m\u00e1s bizalmas adatot. A rendszer a konfigur\u00e1ci\u00f3dat nem csatolja automatikusan.",
  "feedback.privacyLink": "Adatkezel\u00e9si t\u00e1j\u00e9koztat\u00f3",
  "feedback.submit": "Visszajelz\u00e9s elk\u00fcld\u00e9se",
  "feedback.submitting": "K\u00fcld\u00e9s...",
  "feedback.success": "K\u00f6sz\u00f6nj\u00fck, a visszajelz\u00e9sed meg\u00e9rkezett.",
  "feedback.error": "A visszajelz\u00e9s most nem k\u00fcldhet\u0151 el. Pr\u00f3b\u00e1ld meg k\u00e9s\u0151bb.",
  "feedback.validation.message": "A visszajelz\u00e9s legyen legal\u00e1bb 10 karakter.",

  "footer.navigation": "Oldalnavig\u00e1ci\u00f3",
  "footer.home": "Konfigur\u00e1tor",
  "footer.privacy": "Adatkezel\u00e9s",
  "footer.terms": "Felhaszn\u00e1l\u00e1si felt\u00e9telek",
  "footer.contact": "Kapcsolat",
  "footer.support": "A fejleszt\u00e9s t\u00e1mogat\u00e1sa",
  "footer.note": "F\u00fcggetlen, k\u00f6z\u00f6ss\u00e9gi ESPHome-konfigur\u00e1ci\u00f3gener\u00e1tor.",

  "safety.title": "Fontos biztons\u00e1gi figyelmeztet\u00e9s",
  "safety.description": "A gener\u00e1lt konfigur\u00e1ci\u00f3t, GPIO-kioszt\u00e1st \u00e9s elektromos bek\u00f6t\u00e9st telep\u00edt\u00e9s el\u0151tt mindig ellen\u0151rizd.",
  "safety.link": "Biztons\u00e1gi felt\u00e9telek",

  "app.title": "ESPHome konfigurációgenerátor",
  "app.subtitle":
    "Hardver, GPIO-k és automatizálások egyetlen munkafelületen.",
  "app.backend": "Backend",
  "app.generationCount": "Sikeres generálások",
  "app.generationCountLoading": "Betöltés...",
  "app.generationCountUnavailable": "Nem érhető el",
  "app.automations.title": "Automatizálások",
  "app.automations.description":
    "A következő fejlesztési csomagban ide kerül a vizuális trigger–feltétel–művelet szerkesztő.",

  "workspace.unnamedDevice": "Névtelen eszköz",
  "workspace.loadingBoard": "Alaplap betöltése...",
  "workspace.connectingServer": "Kapcsolódás a szerverhez...",
  "workspace.serverWaking": "A szerver ébred...",
  "workspace.serverWakingDetail":
    "Az ingyenes szerver tétlenség után leállhat. Automatikusan újrapróbáljuk, nincs teendőd.",
  "workspace.serverUnavailable": "A szerver nem érhető el.",
  "workspace.retry": "Újrapróbálás",
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

  "feedback.open": "Feedback",
  "feedback.close": "Close",
  "feedback.closeDialog": "Close feedback panel",
  "feedback.dialogLabel": "Send feedback",
  "feedback.title": "Send feedback",
  "feedback.subtitle": "Found a bug or have an improvement idea? Send us a message.",
  "feedback.category": "Category",
  "feedback.category.bug": "Bug",
  "feedback.category.idea": "Idea",
  "feedback.category.other": "Other",
  "feedback.message": "Feedback",
  "feedback.messageHint": "At least 10 and at most 4000 characters.",
  "feedback.email": "Email address",
  "feedback.emailHint": "Optional. Add it only if you would like a reply.",
  "feedback.privacy": "Do not send Wi-Fi passwords, API keys, complete secrets.yaml files, or other confidential information. Your configuration is not attached automatically.",
  "feedback.privacyLink": "Privacy notice",
  "feedback.submit": "Send feedback",
  "feedback.submitting": "Sending...",
  "feedback.success": "Thank you. Your feedback has been received.",
  "feedback.error": "Feedback cannot be sent right now. Please try again later.",
  "feedback.validation.message": "Feedback must contain at least 10 characters.",

  "footer.navigation": "Site navigation",
  "footer.home": "Configurator",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms of use",
  "footer.contact": "Contact",
  "footer.support": "Support development",
  "footer.note": "Independent community ESPHome configuration generator.",

  "safety.title": "Important safety notice",
  "safety.description": "Always verify the generated configuration, GPIO assignments, and electrical wiring before installation.",
  "safety.link": "Safety terms",

  "app.title": "ESPHome configuration generator",
  "app.subtitle":
    "Hardware, GPIOs and automations in a single workspace.",
  "app.backend": "Backend",
  "app.generationCount": "Successful generations",
  "app.generationCountLoading": "Loading...",
  "app.generationCountUnavailable": "Unavailable",
  "app.automations.title": "Automations",
  "app.automations.description":
    "A visual trigger-condition-action editor will be added here in a future development package.",

  "workspace.unnamedDevice": "Unnamed device",
  "workspace.loadingBoard": "Loading board...",
  "workspace.connectingServer": "Connecting to the server...",
  "workspace.serverWaking": "The server is waking up...",
  "workspace.serverWakingDetail":
    "The free server may stop after inactivity. Connection is retried automatically; no action is needed.",
  "workspace.serverUnavailable": "The server is unavailable.",
  "workspace.retry": "Retry",
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
