"use client";

import Link from "next/link";

import {
  useLanguage,
} from "@/i18n/LanguageProvider";

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-6 text-slate-400 sm:px-6">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            HA Config Generator
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {t("footer.note")}
          </p>
        </div>

        <nav
          aria-label={t("footer.navigation")}
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
        >
          <Link
            href="/"
            className="transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            {t("footer.home")}
          </Link>

          <Link
            href="/adatkezeles"
            className="transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            {t("footer.privacy")}
          </Link>

          <Link
            href="/felhasznalasi-feltetelek"
            className="transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            {t("footer.terms")}
          </Link>

          <Link
            href="/kapcsolat"
            className="transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
