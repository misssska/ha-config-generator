"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { fetchBoards } from "@/lib/esphome-api";
import type { BoardOption } from "@/types/esphome";

type UseEsphomeBoardsOptions = {
  onError: (message: string) => void;
};

export type BoardConnectionState =
  | "loading"
  | "waking"
  | "ready"
  | "error";

const MAX_LOAD_ATTEMPTS = 12;
const RETRY_DELAY_MS = 5_000;
const WAKE_NOTICE_DELAY_MS = 2_500;

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    error.name === "AbortError"
  );
}

export function useEsphomeBoards({
  onError,
}: UseEsphomeBoardsOptions) {
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [boardsLoading, setBoardsLoading] =
    useState(true);

  const [
    boardConnectionState,
    setBoardConnectionState,
  ] = useState<BoardConnectionState>("loading");

  const [reloadVersion, setReloadVersion] =
    useState(0);

  const retryBoards = useCallback(() => {
    setReloadVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    let disposed = false;
    let wakeTimer: number | null = null;
    let retryTimer: number | null = null;

    function clearWakeTimer() {
      if (wakeTimer !== null) {
        window.clearTimeout(wakeTimer);
        wakeTimer = null;
      }
    }

    function waitBeforeRetry(): Promise<void> {
      return new Promise((resolve) => {
        retryTimer = window.setTimeout(
          resolve,
          RETRY_DELAY_MS,
        );
      });
    }

    async function loadBoards() {
      setBoards([]);
      setBoardsLoading(true);
      setBoardConnectionState("loading");
      onError("");

      wakeTimer = window.setTimeout(() => {
        if (!disposed) {
          setBoardConnectionState("waking");
        }
      }, WAKE_NOTICE_DELAY_MS);

      for (
        let attempt = 0;
        attempt < MAX_LOAD_ATTEMPTS;
        attempt += 1
      ) {
        if (disposed || controller.signal.aborted) {
          return;
        }

        try {
          const data = await fetchBoards(
            controller.signal,
          );

          if (disposed) {
            return;
          }

          clearWakeTimer();
          setBoards(data);
          setBoardConnectionState("ready");
          setBoardsLoading(false);
          return;
        } catch (loadError) {
          if (
            isAbortError(loadError) ||
            disposed ||
            controller.signal.aborted
          ) {
            return;
          }

          const isFinalAttempt =
            attempt === MAX_LOAD_ATTEMPTS - 1;

          if (isFinalAttempt) {
            clearWakeTimer();
            setBoardConnectionState("error");
            setBoardsLoading(false);

            onError(
              loadError instanceof Error
                ? loadError.message
                : "Ismeretlen hiba történt.",
            );

            return;
          }

          setBoardConnectionState("waking");
          await waitBeforeRetry();
          retryTimer = null;
        }
      }
    }

    void loadBoards();

    return () => {
      disposed = true;
      controller.abort();
      clearWakeTimer();

      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [onError, reloadVersion]);

  return {
    boards,
    boardsLoading,
    boardConnectionState,
    retryBoards,
  };
}
