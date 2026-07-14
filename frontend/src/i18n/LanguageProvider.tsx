
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguage,
  translate,
  type Language,
  type TranslationKey,
} from "@/i18n/translations";

type TranslationVariables = Record<
  string,
  string | number
>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (
    key: TranslationKey,
    variables?: TranslationVariables,
  ) => string;
};

const defaultContextValue: LanguageContextValue = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  t: (key, variables) =>
    translate(
      DEFAULT_LANGUAGE,
      key,
      variables,
    ),
};

const LanguageContext =
  createContext<LanguageContextValue>(
    defaultContextValue,
  );

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);

  const [persistenceReady, setPersistenceReady] =
    useState(false);

  /*
   * A localStorage csak a kliensoldali indulás után
   * olvasható biztonságosan.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const storedLanguage =
      window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      );

    const initialLanguage = isLanguage(
      storedLanguage,
    )
      ? storedLanguage
      : DEFAULT_LANGUAGE;

    setLanguage(initialLanguage);
    setPersistenceReady(true);
    document.documentElement.lang =
      initialLanguage;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!persistenceReady) {
      return;
    }

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      language,
    );

    document.documentElement.lang = language;
  }, [language, persistenceReady]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, variables) =>
        translate(language, key, variables),
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
