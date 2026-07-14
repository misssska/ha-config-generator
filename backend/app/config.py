import os
from urllib.parse import urlsplit


DEFAULT_CORS_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)


def _normalize_origin(value: str) -> str:
    candidate = value.strip()
    parsed = urlsplit(candidate)

    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.netloc
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError(
            f"Érvénytelen CORS origin: {candidate!r}"
        )

    return f"{parsed.scheme}://{parsed.netloc}"


def get_cors_origins() -> list[str]:
    origins = list(DEFAULT_CORS_ORIGINS)
    configured_origins = os.getenv("CORS_ORIGINS", "")

    for value in configured_origins.split(","):
        if value.strip():
            origins.append(_normalize_origin(value))

    return list(dict.fromkeys(origins))
