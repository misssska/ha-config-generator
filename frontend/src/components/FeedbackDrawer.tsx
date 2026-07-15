"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  useLanguage,
} from "@/i18n/LanguageProvider";
import {
  submitFeedback,
} from "@/lib/esphome-api";
import type {
  FeedbackCategory,
} from "@/types/esphome";

type FeedbackDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const CATEGORY_OPTIONS = [
  {
    value: "bug",
    labelKey: "feedback.category.bug",
  },
  {
    value: "idea",
    labelKey: "feedback.category.idea",
  },
  {
    value: "other",
    labelKey: "feedback.category.other",
  },
] as const;

export default function FeedbackDrawer({
  open,
  onClose,
}: FeedbackDrawerProps) {
  const { t } = useLanguage();

  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  const [category, setCategory] =
    useState<FeedbackCategory>("idea");

  const [message, setMessage] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const handleClose = useCallback(() => {
    setSubmitted(false);
    setErrorMessage(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      previouslyFocusedElement?.focus();
    };
  }, [open, handleClose]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedMessage = message.trim();

    setSubmitted(false);
    setErrorMessage(null);

    if (normalizedMessage.length < 10) {
      setErrorMessage(
        t("feedback.validation.message"),
      );
      return;
    }

    try {
      setSubmitting(true);

      await submitFeedback({
        category,
        message: normalizedMessage,
        email,
        website,
      });

      setSubmitted(true);
      setCategory("idea");
      setMessage("");
      setEmail("");
      setWebsite("");
    } catch {
      setErrorMessage(
        t("feedback.error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t("feedback.dialogLabel")}
    >
      <button
        type="button"
        aria-label={t("feedback.closeDialog")}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-slate-700 bg-slate-950 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              {t("feedback.title")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {t("feedback.subtitle")}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            {t("feedback.close")}
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <div>
              <label
                htmlFor="feedback-category"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                {t("feedback.category")}
              </label>

              <select
                id="feedback-category"
                value={category}
                disabled={submitting}
                onChange={(event) => {
                  setCategory(
                    event.target.value as FeedbackCategory,
                  );
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="feedback-message"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                {t("feedback.message")}
              </label>

              <textarea
                id="feedback-message"
                value={message}
                required
                minLength={10}
                maxLength={4000}
                rows={8}
                disabled={submitting}
                aria-describedby="feedback-message-hint feedback-privacy"
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
              />

              <p
                id="feedback-message-hint"
                className="mt-2 text-xs text-slate-500"
              >
                {t("feedback.messageHint")}
              </p>
            </div>

            <div>
              <label
                htmlFor="feedback-email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                {t("feedback.email")}
              </label>

              <input
                id="feedback-email"
                type="email"
                value={email}
                maxLength={254}
                disabled={submitting}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-500">
                {t("feedback.emailHint")}
              </p>
            </div>

            <div
              className="hidden"
              aria-hidden="true"
            >
              <label htmlFor="feedback-website">
                Website
              </label>

              <input
                id="feedback-website"
                type="text"
                value={website}
                tabIndex={-1}
                autoComplete="off"
                onChange={(event) => {
                  setWebsite(event.target.value);
                }}
              />
            </div>

            <p
              id="feedback-privacy"
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100/80"
            >
              {t("feedback.privacy")}{" "}
              <Link
                href="/adatkezeles"
                className="font-semibold text-amber-200 underline decoration-amber-400/40 underline-offset-4 hover:text-amber-100"
              >
                {t("feedback.privacyLink")}
              </Link>
            </p>

            {submitted && (
              <p
                role="status"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
              >
                {t("feedback.success")}
              </p>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? t("feedback.submitting")
                : t("feedback.submit")}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
