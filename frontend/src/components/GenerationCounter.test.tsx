import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import GenerationCounter from "@/components/GenerationCounter";
import {
  fetchGenerationStats,
} from "@/lib/esphome-api";

vi.mock("@/lib/esphome-api", () => ({
  fetchGenerationStats: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("GenerationCounter", () => {
  it("loads and refreshes the counter", async () => {
    const fetchMock = vi.mocked(
      fetchGenerationStats,
    );

    fetchMock
      .mockResolvedValueOnce({
        successful_generations: 12,
      })
      .mockResolvedValueOnce({
        successful_generations: 13,
      });

    const { rerender } = render(
      <GenerationCounter
        refreshToken={0}
        label="Successful generations"
        loadingLabel="Loading..."
        unavailableLabel="Unavailable"
      />,
    );

    expect(
      await screen.findByText("12"),
    ).toBeInTheDocument();

    rerender(
      <GenerationCounter
        refreshToken={1}
        label="Successful generations"
        loadingLabel="Loading..."
        unavailableLabel="Unavailable"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("13"),
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows the unavailable state", async () => {
    vi.mocked(
      fetchGenerationStats,
    ).mockRejectedValue(
      new Error("unavailable"),
    );

    render(
      <GenerationCounter
        refreshToken={0}
        label="Successful generations"
        loadingLabel="Loading..."
        unavailableLabel="Unavailable"
      />,
    );

    expect(
      await screen.findByText("Unavailable"),
    ).toBeInTheDocument();
  });
});
