"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  fetchGenerationStats,
} from "@/lib/esphome-api";

type GenerationCounterProps = {
  refreshToken: number;
  label: string;
  loadingLabel: string;
  unavailableLabel: string;
};

export default function GenerationCounter({
  refreshToken,
  label,
  loadingLabel,
  unavailableLabel,
}: GenerationCounterProps) {
  const [count, setCount] =
    useState<number | null>(null);

  const [unavailable, setUnavailable] =
    useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void fetchGenerationStats(controller.signal)
      .then((stats) => {
        if (!active) {
          return;
        }

        setCount(stats.successful_generations);
        setUnavailable(false);
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (active) {
          setUnavailable(true);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshToken]);

  const displayValue =
    count === null
      ? unavailable
        ? unavailableLabel
        : loadingLabel
      : String(count);

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
      <span className="block text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <span
        className="mt-0.5 block text-sm font-semibold text-emerald-300"
        aria-live="polite"
        title={
          unavailable
            ? unavailableLabel
            : undefined
        }
      >
        {displayValue}
      </span>
    </div>
  );
}
