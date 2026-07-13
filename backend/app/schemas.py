from typing import Literal

from pydantic import BaseModel, Field, model_validator


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


class BoardOption(BaseModel):
    id: BoardId
    label: str
    platform: Literal["esp32", "esp8266"]


class GPIORelay(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=64,
        examples=["Műhely világítás"],
    )
    pin: int = Field(
        ge=0,
        le=48,
        description="A mikrovezérlő belső GPIO-száma.",
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
        description="A mikrovezérlő belső GPIO-száma.",
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
        description="Kisbetűs eszköznév, szóköz nélkül.",
        examples=["muhely-vezerlo"],
    )
    friendly_name: str = Field(
        min_length=1,
        max_length=64,
        examples=["Műhely vezérlő"],
    )
    board: BoardId = "esp32dev"
    include_fallback_ap: bool = True
    relays: list[GPIORelay] = Field(
        default_factory=list,
        max_length=8,
    )
    binary_sensors: list[GPIOBinarySensor] = Field(
        default_factory=list,
        max_length=16,
    )

    @model_validator(mode="after")
    def validate_unique_gpio_assignments(
        self,
    ) -> "ESPHomeGenerateRequest":
        used_pins: dict[int, str] = {}

        for relay in self.relays:
            if relay.pin in used_pins:
                raise ValueError(
                    f"GPIO{relay.pin} többször van használva: "
                    f"{used_pins[relay.pin]} és relé: {relay.name}."
                )

            used_pins[relay.pin] = f"relé: {relay.name}"

        for sensor in self.binary_sensors:
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
