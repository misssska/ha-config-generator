"use client";

import HelpPopover from "@/components/HelpPopover";
import { HELP } from "@/lib/help-content";
import type { BoardOption } from "@/types/esphome";

type DeviceSettingsProps = {
  deviceName: string;
  friendlyName: string;
  board: string;
  includeFallbackAp: boolean;
  boards: BoardOption[];
  boardsLoading: boolean;
  currentBoard: BoardOption | undefined;
  onDeviceNameChange: (value: string) => void;
  onFriendlyNameChange: (value: string) => void;
  onBoardChange: (boardId: string) => void;
  onFallbackApChange: (enabled: boolean) => void;
};

export default function DeviceSettings({
  deviceName,
  friendlyName,
  board,
  includeFallbackAp,
  boards,
  boardsLoading,
  currentBoard,
  onDeviceNameChange,
  onFriendlyNameChange,
  onBoardChange,
  onFallbackApChange,
}: DeviceSettingsProps) {
  return (
    <section>
      <h2 className="mb-5 text-xl font-semibold">
        Eszköz beállításai
      </h2>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center">
            <label
              className="text-sm font-medium text-slate-300"
              htmlFor="device-name"
            >
              ESPHome eszköznév
            </label>

            <HelpPopover {...HELP.deviceName} />
          </div>

          <input
            id="device-name"
            type="text"
            value={deviceName}
            onChange={(event) =>
              onDeviceNameChange(event.target.value)
            }
            minLength={1}
            maxLength={31}
            pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            autoComplete="off"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            Kisbetűk, számok és kötőjel használható.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center">
            <label
              className="text-sm font-medium text-slate-300"
              htmlFor="friendly-name"
            >
              Megjelenített név
            </label>

            <HelpPopover {...HELP.friendlyName} />
          </div>

          <input
            id="friendly-name"
            type="text"
            value={friendlyName}
            onChange={(event) =>
              onFriendlyNameChange(event.target.value)
            }
            minLength={1}
            maxLength={64}
            autoComplete="off"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center">
            <label
              className="text-sm font-medium text-slate-300"
              htmlFor="board"
            >
              Alaplap
            </label>

            <HelpPopover {...HELP.board} />
          </div>

          <select
            id="board"
            value={board}
            onChange={(event) =>
              onBoardChange(event.target.value)
            }
            disabled={boardsLoading}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {boardsLoading && (
              <option value="">Alaplapok betöltése...</option>
            )}

            {boards.map((boardOption) => (
              <option
                key={boardOption.id}
                value={boardOption.id}
              >
                {boardOption.label} – {boardOption.platform}
              </option>
            ))}
          </select>

          {currentBoard && (
            <p className="mt-1.5 text-xs text-slate-500">
              {currentBoard.pins.length} engedélyezett GPIO a
              profilban.
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
            htmlFor="fallback-access-point"
          >
            <input
              id="fallback-access-point"
              type="checkbox"
              checked={includeFallbackAp}
              onChange={(event) =>
                onFallbackApChange(event.target.checked)
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Fallback Access Point
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Hibás Wi-Fi-beállítás esetén saját hálózatot
                indít.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.fallbackAccessPoint} />
        </div>
      </div>
    </section>
  );
}
