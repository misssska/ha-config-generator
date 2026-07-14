
"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import {
  isLanguage,
} from "@/i18n/translations";

export default function LanguageSelector() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
      <span className="hidden sm:inline">
        {t("language.label")}
      </span>

      <select
        aria-label={t("language.label")}
        value={language}
        onChange={(event) => {
          const nextLanguage = event.target.value;

          if (isLanguage(nextLanguage)) {
            setLanguage(nextLanguage);
          }
        }}
        className="bg-transparent font-semibold text-slate-100 outline-none"
      >
        <option
          value="hu"
          className="bg-slate-900"
        >
          {t("language.hungarian")}
        </option>

        <option
          value="en"
          className="bg-slate-900"
        >
          {t("language.english")}
        </option>
      </select>
    </label>
  );
}
