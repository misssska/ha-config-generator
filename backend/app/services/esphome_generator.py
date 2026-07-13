import base64
import json
import secrets
from typing import Any

from app.board_profiles import BOARD_PROFILES

from app.schemas import (
    BoardOption,
    ESPHomeGenerateRequest,
    ESPHomeGenerateResponse,
    GeneratedFile,
    GPIOBinarySensor,
    GPIORelay,
)



def yaml_string(value: str) -> str:
    """JSON idézőjelezés, amely érvényes YAML szöveget is ad."""
    return json.dumps(value, ensure_ascii=False)


def yaml_bool(value: bool) -> str:
    return "true" if value else "false"


def generate_api_key() -> str:
    """32 bájtos, Base64-formátumú ESPHome API-kulcs."""
    return base64.b64encode(secrets.token_bytes(32)).decode("ascii")


def get_board_options() -> list[BoardOption]:
    return [
        BoardOption(
            id=board_id,
            label=board["label"],
            platform=board["platform"],
            pins=board["pins"],
        )
        for board_id, board in BOARD_PROFILES.items()
    ]


def build_platform_lines(
    board: dict[str, Any],
) -> list[str]:
    platform = board["platform"]
    esphome_board = board["esphome_board"]

    if platform == "esp32":
        return [
            "esp32:",
            f"  board: {esphome_board}",
            "  framework:",
            "    type: esp-idf",
        ]

    return [
        "esp8266:",
        f"  board: {esphome_board}",
    ]


def build_service_lines(
    request: ESPHomeGenerateRequest,
    api_secret: str,
    ota_secret: str,
) -> list[str]:
    lines = [
        "logger:",
        f"  level: {request.logger_level}",
    ]

    if request.api_encryption_enabled:
        lines.extend(
            [
                "",
                "api:",
                "  encryption:",
                f"    key: !secret {api_secret}",
            ]
        )

    if request.ota_enabled:
        lines.extend(
            [
                "",
                "ota:",
                "  - platform: esphome",
                f"    password: !secret {ota_secret}",
            ]
        )

    return lines


def build_wifi_lines(
    request: ESPHomeGenerateRequest,
    fallback_secret: str,
) -> list[str]:
    lines = ["wifi:"]

    if request.wifi_use_secrets:
        lines.extend(
            [
                "  ssid: !secret wifi_ssid",
                "  password: !secret wifi_password",
            ]
        )
    else:
        lines.extend(
            [
                (
                    "  ssid: "
                    + yaml_string(request.wifi_ssid)
                ),
                (
                    "  password: "
                    + yaml_string(request.wifi_password)
                ),
            ]
        )

    if request.use_static_ip:
        lines.extend(
            [
                "  manual_ip:",
                f"    static_ip: {request.static_ip}",
                f"    gateway: {request.gateway}",
                f"    subnet: {request.subnet}",
            ]
        )

        if request.dns1 is not None:
            lines.append(
                f"    dns1: {request.dns1}"
            )

        if request.dns2 is not None:
            lines.append(
                f"    dns2: {request.dns2}"
            )

    if request.include_fallback_ap:
        fallback_ssid = (
            request.fallback_ap_ssid
            or request.friendly_name + " Fallback"
        )

        lines.extend(
            [
                "",
                "  ap:",
                (
                    "    ssid: "
                    + yaml_string(fallback_ssid)
                ),
                (
                    "    password: !secret "
                    + fallback_secret
                ),
                "",
                "captive_portal:",
            ]
        )

    return lines


def build_secrets_lines(
    request: ESPHomeGenerateRequest,
    api_secret: str,
    ota_secret: str,
    fallback_secret: str,
) -> list[str]:
    lines: list[str] = []

    if request.wifi_use_secrets:
        lines.extend(
            [
                "# Wi-Fi adatok.",
                (
                    "wifi_ssid: "
                    + yaml_string(request.wifi_ssid)
                ),
                (
                    "wifi_password: "
                    + yaml_string(request.wifi_password)
                ),
            ]
        )

    generated_lines: list[str] = []

    if request.api_encryption_enabled:
        generated_lines.append(
            (
                f"{api_secret}: "
                + yaml_string(generate_api_key())
            )
        )

    if request.ota_enabled:
        generated_lines.append(
            (
                f"{ota_secret}: "
                + yaml_string(
                    secrets.token_urlsafe(24)
                )
            )
        )

    if request.include_fallback_ap:
        fallback_password = (
            request.fallback_ap_password
            or secrets.token_urlsafe(12)
        )

        generated_lines.append(
            (
                f"{fallback_secret}: "
                + yaml_string(fallback_password)
            )
        )

    if generated_lines:
        if lines:
            lines.append("")

        lines.append(
            "# Automatikusan generált vagy megadott "
            "eszközspecifikus kulcsok."
        )
        lines.extend(generated_lines)

    if not lines:
        lines.append(
            "# Ehhez a konfigurációhoz nincs "
            "szükség secret értékre."
        )

    return lines


def build_system_sensor_lines(
    request: ESPHomeGenerateRequest,
) -> list[str]:
    sensor_lines: list[str] = []

    if request.include_uptime_sensor:
        sensor_lines.extend(
            [
                "  - platform: uptime",
                "    type: seconds",
                '    name: "Üzemidő"',
                "    update_interval: 60s",
            ]
        )

    if request.include_wifi_signal_sensor:
        sensor_lines.extend(
            [
                "  - platform: wifi_signal",
                '    name: "Wi-Fi jelerősség"',
                "    update_interval: 60s",
            ]
        )

    if not sensor_lines:
        return []

    return [
        "",
        "sensor:",
        *sensor_lines,
    ]


def build_system_button_lines(
    request: ESPHomeGenerateRequest,
) -> list[str]:
    if not request.include_restart_button:
        return []

    return [
        "",
        "button:",
        "  - platform: restart",
        '    name: "Eszköz újraindítása"',
    ]


def build_relay_lines(relays: list[GPIORelay]) -> list[str]:
    if not relays:
        return []

    lines = [
        "",
        "switch:",
    ]

    for index, relay in enumerate(relays, start=1):
        lines.extend(
            [
                "  - platform: gpio",
                f"    name: {yaml_string(relay.name)}",
                f"    id: relay_{index}",
                "    pin:",
                f"      number: GPIO{relay.pin}",
                f"      inverted: {yaml_bool(relay.inverted)}",
                f"    restore_mode: {relay.restore_mode}",
            ]
        )

    return lines


def build_binary_sensor_lines(
    binary_sensors: list[GPIOBinarySensor],
) -> list[str]:
    if not binary_sensors:
        return []

    lines = [
        "",
        "binary_sensor:",
    ]

    for index, sensor in enumerate(binary_sensors, start=1):
        lines.extend(
            [
                "  - platform: gpio",
                f"    name: {yaml_string(sensor.name)}",
                f"    id: binary_input_{index}",
                "    pin:",
                f"      number: GPIO{sensor.pin}",
                f"      inverted: {yaml_bool(sensor.inverted)}",
                "      mode:",
                "        input: true",
            ]
        )

        if sensor.pull_mode == "PULLUP":
            lines.append("        pullup: true")
        elif sensor.pull_mode == "PULLDOWN":
            lines.append("        pulldown: true")

        if sensor.device_class is not None:
            lines.append(
                f"    device_class: {sensor.device_class}"
            )

        filters: list[str] = []

        if sensor.delayed_on_ms > 0:
            filters.append(
                f"      - delayed_on: {sensor.delayed_on_ms}ms"
            )

        if sensor.delayed_off_ms > 0:
            filters.append(
                f"      - delayed_off: {sensor.delayed_off_ms}ms"
            )

        if filters:
            lines.append("    filters:")
            lines.extend(filters)

    return lines


def build_esphome_project(
    request: ESPHomeGenerateRequest,
) -> ESPHomeGenerateResponse:
    board = BOARD_PROFILES[request.board]
    secret_prefix = request.device_name.replace(
        "-",
        "_",
    )

    api_secret = (
        f"{secret_prefix}_api_encryption_key"
    )
    ota_secret = (
        f"{secret_prefix}_ota_password"
    )
    fallback_secret = (
        f"{secret_prefix}_fallback_ap_password"
    )

    yaml_lines = [
        "esphome:",
        f"  name: {request.device_name}",
        (
            "  friendly_name: "
            + yaml_string(request.friendly_name)
        ),
        "",
        *build_platform_lines(board),
        "",
        *build_service_lines(
            request,
            api_secret,
            ota_secret,
        ),
        "",
        *build_wifi_lines(
            request,
            fallback_secret,
        ),
    ]

    yaml_lines.extend(
        build_system_sensor_lines(request)
    )
    yaml_lines.extend(
        build_system_button_lines(request)
    )
    yaml_lines.extend(
        build_relay_lines(request.relays)
    )
    yaml_lines.extend(
        build_binary_sensor_lines(
            request.binary_sensors
        )
    )

    yaml_content = (
        "\n".join(yaml_lines).rstrip()
        + "\n"
    )

    secrets_content = (
        "\n".join(
            build_secrets_lines(
                request,
                api_secret,
                ota_secret,
                fallback_secret,
            )
        ).rstrip()
        + "\n"
    )

    return ESPHomeGenerateResponse(
        files=[
            GeneratedFile(
                filename=(
                    f"{request.device_name}.yaml"
                ),
                content=yaml_content,
            ),
            GeneratedFile(
                filename="secrets.yaml",
                content=secrets_content,
            ),
        ]
    )
