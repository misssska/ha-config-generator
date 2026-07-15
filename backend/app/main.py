import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_cors_origins
from app.database import (
    get_successful_generations,
    increment_successful_generations,
    save_feedback_message,
)
from app.schemas import (
    BoardOption,
    ESPHomeGenerateRequest,
    ESPHomeGenerateResponse,
    FeedbackCreateRequest,
    FeedbackCreateResponse,
    GenerationStatsResponse,
)
from app.services.esphome_generator import (
    build_esphome_project,
    get_board_options,
)


logger = logging.getLogger(__name__)


app = FastAPI(
    title="HA Config Generator API",
    description="Home Assistant és ESPHome konfigurációgeneráló backend.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
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
    "/api/feedback",
    response_model=FeedbackCreateResponse,
    status_code=201,
)
def submit_feedback(
    request: FeedbackCreateRequest,
) -> FeedbackCreateResponse:
    if request.website:
        return FeedbackCreateResponse()

    email = (
        str(request.email)
        if request.email is not None
        else None
    )

    try:
        save_feedback_message(
            category=request.category,
            message=request.message,
            email=email,
        )
    except Exception as error:
        logger.exception(
            "Failed to store feedback."
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Feedback submission is temporarily "
                "unavailable."
            ),
        ) from error

    return FeedbackCreateResponse()


@app.get(
    "/api/stats",
    response_model=GenerationStatsResponse,
)
def read_generation_stats() -> GenerationStatsResponse:
    try:
        count = get_successful_generations()
    except Exception as error:
        logger.exception(
            "Failed to read generation statistics."
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Generation statistics are temporarily "
                "unavailable."
            ),
        ) from error

    return GenerationStatsResponse(
        successful_generations=count,
    )


@app.post(
    "/api/esphome/generate",
    response_model=ESPHomeGenerateResponse,
)
def generate_esphome(
    request: ESPHomeGenerateRequest,
) -> ESPHomeGenerateResponse:
    response = build_esphome_project(request)

    try:
        increment_successful_generations()
    except Exception:
        logger.exception(
            "Failed to record successful generation."
        )

    return response
