import {
  act,
  renderHook,
} from "@testing-library/react";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  useEsphomeBoards,
} from "@/hooks/useEsphomeBoards";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useEsphomeBoards", () => {
  it("sikeres betoltes utan ready allapotba kerul", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal("fetch", fetchMock);

    const onError = vi.fn();

    const { result } = renderHook(() =>
      useEsphomeBoards({
        onError,
      }),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(
      result.current.boardConnectionState,
    ).toBe("ready");
    expect(result.current.boardsLoading).toBe(false);
  });

  it("kapcsolati hiba utan automatikusan ujraprobalja", async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(
        new TypeError("Failed to fetch"),
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    vi.stubGlobal("fetch", fetchMock);

    const onError = vi.fn();

    const { result } = renderHook(() =>
      useEsphomeBoards({
        onError,
      }),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      result.current.boardConnectionState,
    ).toBe("waking");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      result.current.boardConnectionState,
    ).toBe("ready");
    expect(result.current.boardsLoading).toBe(false);
  });
});
