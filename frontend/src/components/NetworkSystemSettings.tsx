"use client";

import HelpPopover from "@/components/HelpPopover";
import { LOGGER_LEVEL_OPTIONS } from "@/lib/esphome-options";
import { HELP } from "@/lib/help-content";
import type {
  LoggerLevel,
  NetworkSettingsConfig,
} from "@/types/esphome";

type NetworkSystemSettingsProps = {
  settings: NetworkSettingsConfig;
  includeFallbackAp: boolean;
  onChange: (
    updates: Partial<NetworkSettingsConfig>,
  ) => void;
};

export default function NetworkSystemSettings({
  settings,
  includeFallbackAp,
  onChange,
}: NetworkSystemSettingsProps) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          Hálózat és rendszer
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Wi-Fi, IP-cím, Home Assistant API, OTA és
          naplózási beállítások.
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
            htmlFor="wifi-use-secrets"
          >
            <input
              id="wifi-use-secrets"
              type="checkbox"
              checked={settings.wifiUseSecrets}
              onChange={(event) =>
                onChange({
                  wifiUseSecrets: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Wi-Fi-adatok a secrets.yaml fájlban
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Bekapcsolva a fő konfiguráció nem tartalmazza
                közvetlenül az SSID-t és a jelszót.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.wifiUseSecrets} />
        </div>

        {!settings.wifiUseSecrets && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
            <strong>Figyelmeztetés:</strong> a Wi-Fi-jelszó
            közvetlenül bekerül a generált ESPHome YAML-fájlba.
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center">
            <label
              className="text-sm text-slate-300"
              htmlFor="wifi-ssid"
            >
              Wi-Fi SSID
            </label>

            <HelpPopover {...HELP.wifiSsid} />
          </div>

          <input
            id="wifi-ssid"
            type="text"
            value={settings.wifiSsid}
            onChange={(event) =>
              onChange({
                wifiSsid: event.target.value,
              })
            }
            minLength={1}
            maxLength={32}
            required
            autoComplete="off"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center">
            <label
              className="text-sm text-slate-300"
              htmlFor="wifi-password"
            >
              Wi-Fi-jelszó
            </label>

            <HelpPopover {...HELP.wifiPassword} />
          </div>

          <input
            id="wifi-password"
            type="password"
            value={settings.wifiPassword}
            onChange={(event) =>
              onChange({
                wifiPassword: event.target.value,
              })
            }
            minLength={8}
            maxLength={63}
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
            htmlFor="use-static-ip"
          >
            <input
              id="use-static-ip"
              type="checkbox"
              checked={settings.useStaticIp}
              onChange={(event) =>
                onChange({
                  useStaticIp: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Statikus IP-cím
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Az eszköz mindig a megadott hálózati címet
                használja.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.staticIpEnabled} />
        </div>

        {settings.useStaticIp && (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <div className="mb-1.5 flex items-center">
                <label
                  className="text-sm text-slate-300"
                  htmlFor="static-ip"
                >
                  Statikus IP
                </label>

                <HelpPopover {...HELP.staticIp} />
              </div>

              <input
                id="static-ip"
                type="text"
                inputMode="decimal"
                value={settings.staticIp}
                onChange={(event) =>
                  onChange({
                    staticIp: event.target.value,
                  })
                }
                placeholder="192.168.1.50"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center">
                <label
                  className="text-sm text-slate-300"
                  htmlFor="gateway"
                >
                  Átjáró
                </label>

                <HelpPopover {...HELP.gateway} />
              </div>

              <input
                id="gateway"
                type="text"
                inputMode="decimal"
                value={settings.gateway}
                onChange={(event) =>
                  onChange({
                    gateway: event.target.value,
                  })
                }
                placeholder="192.168.1.1"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center">
                <label
                  className="text-sm text-slate-300"
                  htmlFor="subnet"
                >
                  Alhálózati maszk
                </label>

                <HelpPopover {...HELP.subnet} />
              </div>

              <input
                id="subnet"
                type="text"
                inputMode="decimal"
                value={settings.subnet}
                onChange={(event) =>
                  onChange({
                    subnet: event.target.value,
                  })
                }
                placeholder="255.255.255.0"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center">
                  <label
                    className="text-sm text-slate-300"
                    htmlFor="dns1"
                  >
                    Elsődleges DNS
                  </label>

                  <HelpPopover {...HELP.dns1} />
                </div>

                <input
                  id="dns1"
                  type="text"
                  inputMode="decimal"
                  value={settings.dns1}
                  onChange={(event) =>
                    onChange({
                      dns1: event.target.value,
                    })
                  }
                  placeholder="192.168.1.1"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center">
                  <label
                    className="text-sm text-slate-300"
                    htmlFor="dns2"
                  >
                    Másodlagos DNS
                  </label>

                  <HelpPopover {...HELP.dns2} />
                </div>

                <input
                  id="dns2"
                  type="text"
                  inputMode="decimal"
                  value={settings.dns2}
                  onChange={(event) =>
                    onChange({
                      dns2: event.target.value,
                    })
                  }
                  placeholder="1.1.1.1"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {includeFallbackAp && (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <h3 className="font-medium text-slate-200">
                Fallback Access Point részletei
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Az Access Point kapcsoló az eszköz
                alapbeállításainál található.
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center">
                <label
                  className="text-sm text-slate-300"
                  htmlFor="fallback-ap-ssid"
                >
                  Fallback AP neve
                </label>

                <HelpPopover {...HELP.fallbackApSsid} />
              </div>

              <input
                id="fallback-ap-ssid"
                type="text"
                value={settings.fallbackApSsid}
                onChange={(event) =>
                  onChange({
                    fallbackApSsid: event.target.value,
                  })
                }
                maxLength={32}
                placeholder="Üresen automatikus név"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center">
                <label
                  className="text-sm text-slate-300"
                  htmlFor="fallback-ap-password"
                >
                  Fallback AP jelszava
                </label>

                <HelpPopover {...HELP.fallbackApPassword} />
              </div>

              <input
                id="fallback-ap-password"
                type="password"
                value={settings.fallbackApPassword}
                onChange={(event) =>
                  onChange({
                    fallbackApPassword: event.target.value,
                  })
                }
                minLength={8}
                maxLength={63}
                placeholder="Üresen automatikusan generált"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
            htmlFor="api-encryption-enabled"
          >
            <input
              id="api-encryption-enabled"
              type="checkbox"
              checked={settings.apiEncryptionEnabled}
              onChange={(event) =>
                onChange({
                  apiEncryptionEnabled:
                    event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                Home Assistant API-titkosítás
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Titkosított kapcsolat az ESPHome-eszköz és a
                Home Assistant között.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.apiEncryption} />
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <label
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
            htmlFor="ota-enabled"
          >
            <input
              id="ota-enabled"
              type="checkbox"
              checked={settings.otaEnabled}
              onChange={(event) =>
                onChange({
                  otaEnabled: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              <span className="block text-sm font-medium">
                OTA-frissítés
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Új firmware feltöltése Wi-Fi-kapcsolaton
                keresztül.
              </span>
            </span>
          </label>

          <HelpPopover {...HELP.ota} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center">
            <label
              className="text-sm text-slate-300"
              htmlFor="logger-level"
            >
              Naplózási szint
            </label>

            <HelpPopover {...HELP.loggerLevel} />
          </div>

          <select
            id="logger-level"
            value={settings.loggerLevel}
            onChange={(event) =>
              onChange({
                loggerLevel:
                  event.target.value as LoggerLevel,
              })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-blue-500"
          >
            {LOGGER_LEVEL_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
