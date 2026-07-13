from ipaddress import IPv4Address
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.board_profiles import get_pin_profile


BoardId = Literal[
    "esp32dev",
    "esp32-c3-devkitm-1",
    "esp32-s3-devkitc-1",
    "nodemcuv2",
    "d1_mini",
]

RestoreMode = Literal[
    "ALWAYS_OFF",
    "ALWAYS_ON",
    "RESTORE_DEFAULT_OFF",
    "RESTORE_DEFAULT_ON",
]

InputPullMode = Literal[
    "NONE",
    "PULLUP",
    "PULLDOWN",
]

LoggerLevel = Literal[
    "NONE",
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG",
    "VERBOSE",
    "VERY_VERBOSE",
]


BinarySensorDeviceClass = Literal[
    "door",
    "window",
    "garage_door",
    "opening",
    "motion",
    "occupancy",
    "safety",
    "problem",
    "smoke",
    "moisture",
    "gas",
    "vibration",
    "tamper",
    "running",
]


class GPIOPinOption(BaseModel):
    number: int
    label: str
    can_input: bool
    can_output: bool
    supports_pullup: bool
    supports_pulldown: bool
    warning: str | None = None


class BoardOption(BaseModel):
    id: BoardId
    label: str
    platform: Literal["esp32", "esp8266"]
    pins: list[GPIOPinOption]


class GPIORelay(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=64,
        examples=["Műhely világítás"],
    )
    pin: int = Field(
        ge=0,
        le=48,
        examples=[23],
    )
    inverted: bool = True
    restore_mode: RestoreMode = "ALWAYS_OFF"


class GPIOBinarySensor(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=64,
        examples=["Műhelyajtó"],
    )
    pin: int = Field(
        ge=0,
        le=48,
        examples=[22],
    )
    inverted: bool = True
    pull_mode: InputPullMode = "PULLUP"
    device_class: BinarySensorDeviceClass | None = "door"
    delayed_on_ms: int = Field(
        default=20,
        ge=0,
        le=10000,
    )
    delayed_off_ms: int = Field(
        default=20,
        ge=0,
        le=10000,
    )


class ESPHomeGenerateRequest(BaseModel):
    device_name: str = Field(
        min_length=1,
        max_length=31,
        pattern=r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
        examples=["muhely-vezerlo"],
    )
    friendly_name: str = Field(
        min_length=1,
        max_length=64,
        examples=["Műhely vezérlő"],
    )
    board: BoardId = "esp32dev"
    wifi_use_secrets: bool = True
    wifi_ssid: str = Field(
        default="WIFI_NEVE",
        min_length=1,
        max_length=32,
    )
    wifi_password: str = Field(
        default="WIFI_JELSZO",
        min_length=8,
        max_length=63,
    )
    use_static_ip: bool = False
    static_ip: IPv4Address | None = None
    gateway: IPv4Address | None = None
    subnet: IPv4Address | None = None
    dns1: IPv4Address | None = None
    dns2: IPv4Address | None = None
    include_fallback_ap: bool = True
    fallback_ap_ssid: str | None = Field(
        default=None,
        min_length=1,
        max_length=32,
    )
    fallback_ap_password: str | None = Field(
        default=None,
        min_length=8,
        max_length=63,
    )
    api_encryption_enabled: bool = True
    ota_enabled: bool = True
    logger_level: LoggerLevel = "DEBUG"
    relays: list[GPIORelay] = Field(
        default_factory=list,
        max_length=8,
    )
    binary_sensors: list[GPIOBinarySensor] = Field(
        default_factory=list,
        max_length=16,
    )

    @model_validator(mode="after")
    def validate_gpio_assignments(
        self,
    ) -> "ESPHomeGenerateRequest":
        used_pins: dict[int, str] = {}
        if self.use_static_ip:
            missing_fields: list[str] = []

            if self.static_ip is None:
                missing_fields.append("statikus IP")
            if self.gateway is None:
                missing_fields.append("átjáró")
            if self.subnet is None:
                missing_fields.append(
                    "alhálózati maszk"
                )

            if missing_fields:
                raise ValueError(
                    "Statikus IP használatakor "
                    "kötelező megadni: "
                    + ", ".join(missing_fields)
                    + "."
                )


        for relay in self.relays:
            pin_profile = get_pin_profile(self.board, relay.pin)

            if pin_profile is None:
                raise ValueError(
                    f"GPIO{relay.pin} nem érhető el a kiválasztott "
                    f"{self.board} alaplapon."
                )

            if not pin_profile["can_output"]:
                raise ValueError(
                    f"GPIO{relay.pin} csak bemenetként használható, "
                    f"ezért nem vezérelhet relét."
                )

            if relay.pin in used_pins:
                raise ValueError(
                    f"GPIO{relay.pin} többször van használva: "
                    f"{used_pins[relay.pin]} és relé: {relay.name}."
                )

            used_pins[relay.pin] = f"relé: {relay.name}"

        for sensor in self.binary_sensors:
            pin_profile = get_pin_profile(self.board, sensor.pin)

            if pin_profile is None:
                raise ValueError(
                    f"GPIO{sensor.pin} nem érhető el a kiválasztott "
                    f"{self.board} alaplapon."
                )

            if not pin_profile["can_input"]:
                raise ValueError(
                    f"GPIO{sensor.pin} nem használható digitális bemenetként."
                )

            if (
                sensor.pull_mode == "PULLUP"
                and not pin_profile["supports_pullup"]
            ):
                raise ValueError(
                    f"GPIO{sensor.pin} nem támogat belső PULLUP ellenállást."
                )

            if (
                sensor.pull_mode == "PULLDOWN"
                and not pin_profile["supports_pulldown"]
            ):
                raise ValueError(
                    f"GPIO{sensor.pin} nem támogat belső PULLDOWN ellenállást."
                )

            if sensor.pin in used_pins:
                raise ValueError(
                    f"GPIO{sensor.pin} többször van használva: "
                    f"{used_pins[sensor.pin]} és bemenet: {sensor.name}."
                )

            used_pins[sensor.pin] = f"bemenet: {sensor.name}"

        return self


class GeneratedFile(BaseModel):
    filename: str
    content: str


class ESPHomeGenerateResponse(BaseModel):
    files: list[GeneratedFile]
