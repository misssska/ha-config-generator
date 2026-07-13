from typing import Literal

from pydantic import BaseModel, Field


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


class ESPHomeGenerateRequest(BaseModel):
    device_name: str = Field(
        min_length=1,
        max_length=31,
        pattern=r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
        description="Kisbetűs eszköznév, szóköz nélkül.",
        examples=["muhely-rele"],
    )
    friendly_name: str = Field(
        min_length=1,
        max_length=64,
        examples=["Műhely relé"],
    )
    board: BoardId = "esp32dev"
    include_fallback_ap: bool = True
    relays: list[GPIORelay] = Field(
        default_factory=list,
        max_length=8,
    )


class GeneratedFile(BaseModel):
    filename: str
    content: str


class ESPHomeGenerateResponse(BaseModel):
    files: list[GeneratedFile]
