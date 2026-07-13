from typing import Any


def standard_pins(
    numbers: list[int],
    *,
    aliases: dict[int, str] | None = None,
    warnings: dict[int, str] | None = None,
    input_only: set[int] | None = None,
    no_internal_pull: set[int] | None = None,
    pwm_on_outputs: bool = False,
    adc_pins: set[int] | None = None,
) -> list[dict[str, Any]]:
    aliases = aliases or {}
    warnings = warnings or {}
    input_only = input_only or set()
    no_internal_pull = no_internal_pull or set()
    adc_pins = adc_pins or set()

    return [
        {
            "number": number,
            "label": aliases.get(number, f"GPIO{number}"),
            "can_input": True,
            "can_output": number not in input_only,
            "supports_pullup": number not in no_internal_pull,
            "supports_pulldown": number not in no_internal_pull,
            "supports_pwm": (
                pwm_on_outputs and number not in input_only
            ),
            "supports_adc": number in adc_pins,
            "warning": warnings.get(number),
        }
        for number in numbers
    ]


def esp8266_pins() -> list[dict[str, Any]]:
    aliases = {
        16: "GPIO16 / D0",
        5: "GPIO5 / D1",
        4: "GPIO4 / D2",
        0: "GPIO0 / D3",
        2: "GPIO2 / D4",
        14: "GPIO14 / D5",
        12: "GPIO12 / D6",
        13: "GPIO13 / D7",
        15: "GPIO15 / D8",
        3: "GPIO3 / RX",
        1: "GPIO1 / TX",
    }

    warnings = {
        0: "Bootstrapping pin. Bekapcsoláskor megfelelő logikai szint szükséges.",
        1: "UART0 TX és rendszerüzenetek. A soros naplózással ütközhet.",
        2: "Bootstrapping pin. Bekapcsoláskor HIGH szint szükséges.",
        3: "UART0 RX. Soros kommunikációval vagy programozással ütközhet.",
        15: "Bootstrapping pin. Bekapcsoláskor LOW szint szükséges.",
        16: "Speciális GPIO: belső PULLDOWN van, belső PULLUP nincs.",
    }

    result: list[dict[str, Any]] = []

    for number in [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16]:
        result.append(
            {
                "number": number,
                "label": aliases[number],
                "can_input": True,
                "can_output": True,
                "supports_pullup": number != 16,
                "supports_pulldown": number == 16,
                "supports_pwm": True,
                "supports_adc": False,
                "warning": warnings.get(number),
            }
        )

    result.append(
        {
            "number": 17,
            "label": "A0 / GPIO17 – analóg bemenet",
            "can_input": False,
            "can_output": False,
            "supports_pullup": False,
            "supports_pulldown": False,
            "supports_pwm": False,
            "supports_adc": True,
            "warning": (
                "Kizárólag analóg bemenet. "
                "Digitális GPIO-ként nem használható."
            ),
        }
    )

    return result


ESP32_WARNINGS = {
    0: "Bootstrapping pin. A rákapcsolt áramkör befolyásolhatja az indulást.",
    1: "UART0 TX. A soros naplózással vagy programozással ütközhet.",
    2: "Bootstrapping pin. A rákapcsolt áramkör befolyásolhatja az indulást.",
    3: "UART0 RX. A soros kommunikációval ütközhet.",
    5: "Bootstrapping pin. A rákapcsolt áramkör befolyásolhatja az indulást.",
    12: "Bootstrapping pin. Hibás szint esetén az ESP32 nem indulhat el.",
    15: "Bootstrapping pin. A rákapcsolt áramkör befolyásolhatja az indulást.",
    16: "PSRAM-os ESP32-modulon foglalt lehet.",
    17: "PSRAM-os ESP32-modulon foglalt lehet.",
    34: "Csak bemenet. Nincs belső PULLUP vagy PULLDOWN.",
    35: "Csak bemenet. Nincs belső PULLUP vagy PULLDOWN.",
    36: "Csak bemenet. Nincs belső PULLUP vagy PULLDOWN.",
    39: "Csak bemenet. Nincs belső PULLUP vagy PULLDOWN.",
}

ESP32_C3_WARNINGS = {
    2: "ESP32-C3 bootstrapping pin.",
    8: "ESP32-C3 bootstrapping pin; a DevKitM-1 RGB LED-je is ezt használja.",
    9: "ESP32-C3 bootstrapping pin és BOOT gomb.",
    20: "UART0 RX. Soros kommunikációval ütközhet.",
    21: "UART0 TX. Soros naplózással ütközhet.",
}

ESP32_S3_WARNINGS = {
    0: "ESP32-S3 bootstrapping pin és BOOT funkció.",
    3: "ESP32-S3 bootstrapping pin.",
    19: "USB D-. Használata letilthatja a natív USB/JTAG kapcsolatot.",
    20: "USB D+. Használata letilthatja a natív USB/JTAG kapcsolatot.",
    45: "ESP32-S3 bootstrapping pin.",
    46: "ESP32-S3 bootstrapping pin.",
    48: "A DevKitC-1 beépített RGB LED-je ezt a GPIO-t használja.",
}


BOARD_PROFILES: dict[str, dict[str, Any]] = {
    "esp32dev": {
        "label": "ESP32 DevKit",
        "platform": "esp32",
        "esphome_board": "esp32dev",
        "pins": standard_pins(
            [
                0, 1, 2, 3, 4, 5,
                12, 13, 14, 15, 16, 17,
                18, 19, 21, 22, 23,
                25, 26, 27,
                32, 33, 34, 35, 36, 39,
            ],
            warnings=ESP32_WARNINGS,
            input_only={34, 35, 36, 39},
            no_internal_pull={34, 35, 36, 39},
            pwm_on_outputs=True,
            adc_pins={
                0, 2, 4, 12, 13, 14, 15,
                25, 26, 27, 32, 33, 34, 35, 36, 39,
            },
        ),
    },
    "esp32-c3-devkitm-1": {
        "label": "ESP32-C3 Super Mini / DevKitM-1 – közös GPIO-k",
        "platform": "esp32",
        "esphome_board": "esp32-c3-devkitm-1",
        "pins": standard_pins(
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21],
            warnings=ESP32_C3_WARNINGS,
            pwm_on_outputs=True,
            adc_pins={0, 1, 2, 3, 4, 5},
        ),
    },
    "esp32-s3-devkitc-1": {
        "label": "ESP32-S3 DevKitC-1",
        "platform": "esp32",
        "esphome_board": "esp32-s3-devkitc-1",
        "pins": standard_pins(
            [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21,
                38, 39, 40, 41, 42, 43, 44,
                45, 46, 47, 48,
            ],
            warnings=ESP32_S3_WARNINGS,
            pwm_on_outputs=True,
            adc_pins=set(range(1, 21)),
        ),
    },
    "nodemcuv2": {
        "label": "ESP8266 NodeMCU",
        "platform": "esp8266",
        "esphome_board": "nodemcuv2",
        "pins": esp8266_pins(),
    },
    "d1_mini": {
        "label": "Wemos D1 Mini",
        "platform": "esp8266",
        "esphome_board": "d1_mini",
        "pins": esp8266_pins(),
    },
}


def get_board_profile(board_id: str) -> dict[str, Any]:
    return BOARD_PROFILES[board_id]


def get_pin_profile(
    board_id: str,
    pin_number: int,
) -> dict[str, Any] | None:
    board = get_board_profile(board_id)

    return next(
        (
            pin
            for pin in board["pins"]
            if pin["number"] == pin_number
        ),
        None,
    )
