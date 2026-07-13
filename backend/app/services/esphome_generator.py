import base64
import json
import secrets
from typing import Any

from app.schemas import (
    BoardOption,
    ESPHomeGenerateRequest,
    ESPHomeGenerateResponse,
    GeneratedFile,
)


BOARDS: dict[str, dict[str, str]] = {
    "esp32dev": {
        "label": "ESP32 DevKit",
        "platform": "esp32",
    },
    "esp32-c3-devkitm-1": {
        "label": "ESP32-C3 Super Mini / DevKitM-1",
        "platform": "esp32",
    },
    "esp32-s3-devkitc-1": {
        "label": "ESP32-S3 DevKitC-1",
        "platform": "esp32",
    },
    "nodemcuv2": {
        "label": "ESP8266 NodeMCU",
        "platform": "esp8266",
    },
    "d1_mini": {
        "label": "Wemos D1 Mini",
        "platform": "esp8266",
    },
}


def yaml_string(value: str) -> str:
    """JSON idézőjelezés, amely érvényes YAML szöveget is ad."""
    return json.dumps(value, ensure_ascii=False)


def generate_api_key() -> str:
    """32 bájtos, Base64-formátumú ESPHome API-kulcs."""
    return base64.b64encode(secrets.token_bytes(32)).decode("ascii")


def get_board_options() -> list[BoardOption]:
    return [
        BoardOption(
            id=board_id,
            label=board["label"],
            platform=board["platform"],
        )
        for board_id, board in BOARDS.items()
    ]


def build_platform_lines(board_id: str, board: dict[str, Any]) -> list[str]:
    platform = board["platform"]

    if platform == "esp32":
        return [
            "esp32:",
            f"  board: {board_id}",
            "  framework:",
            "    type: esp-idf",
        ]

    return [
        "esp8266:",
        f"  board: {board_id}",
    ]


def build_esphome_project(
    request: ESPHomeGenerateRequest,
) -> ESPHomeGenerateResponse:
    board = BOARDS[request.board]
    secret_prefix = request.device_name.replace("-", "_")

    api_secret = f"{secret_prefix}_api_encryption_key"
    ota_secret = f"{secret_prefix}_ota_password"
    fallback_secret = f"{secret_prefix}_fallback_ap_password"

    yaml_lines = [
        "esphome:",
        f"  name: {request.device_name}",
        f"  friendly_name: {yaml_string(request.friendly_name)}",
        "",
        *build_platform_lines(request.board, board),
        "",
        "logger:",
        "",
        "api:",
        "  encryption:",
        f"    key: !secret {api_secret}",
        "",
        "ota:",
        "  - platform: esphome",
        f"    password: !secret {ota_secret}",
        "",
        "wifi:",
        "  ssid: !secret wifi_ssid",
        "  password: !secret wifi_password",
    ]

    if request.include_fallback_ap:
        yaml_lines.extend(
            [
                "",
                "  ap:",
                f"    ssid: {yaml_string(request.friendly_name + ' Fallback')}",
                f"    password: !secret {fallback_secret}",
                "",
                "captive_portal:",
            ]
        )

    yaml_content = "\n".join(yaml_lines).rstrip() + "\n"

    secrets_lines = [
        '# Töltsd ki a saját Wi-Fi adataiddal.',
        f"wifi_ssid: {yaml_string('WIFI_NEVE')}",
        f"wifi_password: {yaml_string('WIFI_JELSZO')}",
        "",
        "# Automatikusan generált, eszközspecifikus kulcsok.",
        f"{api_secret}: {yaml_string(generate_api_key())}",
        f"{ota_secret}: {yaml_string(secrets.token_urlsafe(24))}",
    ]

    if request.include_fallback_ap:
        secrets_lines.append(
            f"{fallback_secret}: {yaml_string(secrets.token_urlsafe(12))}"
        )

    secrets_content = "\n".join(secrets_lines).rstrip() + "\n"

    return ESPHomeGenerateResponse(
        files=[
            GeneratedFile(
                filename=f"{request.device_name}.yaml",
                content=yaml_content,
            ),
            GeneratedFile(
                filename="secrets.yaml",
                content=secrets_content,
            ),
        ]
    )
