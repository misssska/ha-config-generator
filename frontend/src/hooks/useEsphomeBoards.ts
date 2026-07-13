"use client";

import { useEffect, useState } from "react";

import { fetchBoards } from "@/lib/esphome-api";
import type { BoardOption } from "@/types/esphome";

type UseEsphomeBoardsOptions = {
  onError: (message: string) => void;
};

export function useEsphomeBoards({
  onError,
}: UseEsphomeBoardsOptions) {
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBoards() {
      try {
        setBoardsLoading(true);
        onError("");

        const data = await fetchBoards(controller.signal);

        setBoards(data);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        onError(
          loadError instanceof Error
            ? loadError.message
            : "Ismeretlen hiba történt.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setBoardsLoading(false);
        }
      }
    }

    void loadBoards();

    return () => {
      controller.abort();
    };
  }, [onError]);

  return {
    boards,
    boardsLoading,
  };
}
