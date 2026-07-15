"use client";

import Link from "next/link";

import {
  useLanguage,
} from "@/i18n/LanguageProvider";

export default function SafetyNotice() {
  const { t } = useLanguage();

  return (
    <aside
      aria-labelledby="safety-notice-title"
      className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="safety-notice-title"
            className="text-sm font-semibold text-amber-200"
          >
            {t("safety.title")}
          </h2>

          <p className="mt-1 text-xs leading-5 text-amber-100/70 sm:text-sm">
            {t("safety.description")}
          </p>
        </div>

        <Link
          href="/felhasznalasi-feltetelek"
          className="inline-flex shrink-0 self-start rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        >
          {t("safety.link")}
        </Link>
      </div>
    </aside>
  );
}
