import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv


_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"

load_dotenv(
    dotenv_path=_ENV_FILE,
    override=False,
)


_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS generation_stats (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    successful_generations BIGINT NOT NULL DEFAULT 0
        CHECK (successful_generations >= 0)
)
"""

_SEED_ROW_SQL = """
INSERT INTO generation_stats (
    id,
    successful_generations
)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING
"""


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL", "").strip()

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured."
        )

    return database_url


def _connect() -> psycopg.Connection:
    return psycopg.connect(
        get_database_url(),
        connect_timeout=10,
    )


def _ensure_generation_stats(
    connection: psycopg.Connection,
) -> None:
    connection.execute(_CREATE_TABLE_SQL)
    connection.execute(_SEED_ROW_SQL)


def get_successful_generations() -> int:
    with _connect() as connection:
        _ensure_generation_stats(connection)

        row = connection.execute(
            """
            SELECT successful_generations
            FROM generation_stats
            WHERE id = 1
            """
        ).fetchone()

    if row is None:
        raise RuntimeError(
            "Generation statistics row is missing."
        )

    return int(row[0])


def increment_successful_generations() -> int:
    with _connect() as connection:
        _ensure_generation_stats(connection)

        row = connection.execute(
            """
            INSERT INTO generation_stats (
                id,
                successful_generations
            )
            VALUES (1, 1)
            ON CONFLICT (id)
            DO UPDATE SET
                successful_generations =
                    generation_stats.successful_generations + 1
            RETURNING successful_generations
            """
        ).fetchone()

    if row is None:
        raise RuntimeError(
            "Generation counter update returned no value."
        )

    return int(row[0])
