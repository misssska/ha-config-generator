from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    BoardOption,
    ESPHomeGenerateRequest,
    ESPHomeGenerateResponse,
)
from app.services.esphome_generator import (
    build_esphome_project,
    get_board_options,
)


app = FastAPI(
    title="HA Config Generator API",
    description="Home Assistant és ESPHome konfigurációgeneráló backend.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=(
        r"^http://(?:"
        r"10(?:\.\d{1,3}){3}|"
        r"192\.168(?:\.\d{1,3}){2}|"
        r"172\.(?:1[6-9]|2\d|3[01])"
        r"(?:\.\d{1,3}){2}"
        r"):3000$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get(
    "/api/esphome/boards",
    response_model=list[BoardOption],
)
def list_esphome_boards() -> list[BoardOption]:
    return get_board_options()


@app.post(
    "/api/esphome/generate",
    response_model=ESPHomeGenerateResponse,
)
def generate_esphome(
    request: ESPHomeGenerateRequest,
) -> ESPHomeGenerateResponse:
    return build_esphome_project(request)
