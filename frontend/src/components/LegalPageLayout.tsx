import Link from "next/link";
import type {
  ReactNode,
} from "react";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt?: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  eyebrow,
  title,
  intro,
  updatedAt,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="flex-1 bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        >
          ← Vissza a konfigurátorhoz
        </Link>

        <header className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">
          <p className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            {intro}
          </p>

          {updatedAt && (
            <p className="mt-4 text-xs text-slate-500">
              Utolsó frissítés: {updatedAt}
            </p>
          )}
        </header>

        <article className="mt-6 space-y-6">
          {children}
        </article>
      </div>
    </main>
  );
}
