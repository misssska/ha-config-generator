"use client";

import Link from "next/link";

import {
  useLanguage,
} from "@/i18n/LanguageProvider";

const SUPPORT_HANDLE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

type SiteFooterProps = {
  supportHandle?: string;
};

export default function SiteFooter({
  supportHandle = process.env.NEXT_PUBLIC_KOFI_HANDLE?.trim(),
}: SiteFooterProps = {}) {
  const { t } = useLanguage();

  const supportUrl =
    supportHandle &&
    SUPPORT_HANDLE_PATTERN.test(supportHandle)
      ? `https://ko-fi.com/${encodeURIComponent(supportHandle)}`
      : undefined;

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
          {supportUrl ? (
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              {t("footer.support")}
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
