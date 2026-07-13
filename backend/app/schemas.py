from typing import Literal

from pydantic import BaseModel, Field


BoardId = Literal[
    "esp32dev",
    "esp32-c3-devkitm-1",
    "esp32-s3-devkitc-1",
    "nodemcuv2",
    "d1_mini",
]


class BoardOption(BaseModel):
    id: BoardId
    label: str
    platform: Literal["esp32", "esp8266"]


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


class GeneratedFile(BaseModel):
    filename: str
    content: str


class ESPHomeGenerateResponse(BaseModel):
    files: list[GeneratedFile]
