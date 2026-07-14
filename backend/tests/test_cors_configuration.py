import os
import unittest
from unittest.mock import patch

from app.config import (
    DEFAULT_CORS_ORIGINS,
    get_cors_origins,
)


class CorsConfigurationTests(unittest.TestCase):
    def test_default_local_origins_are_enabled(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(
                get_cors_origins(),
                list(DEFAULT_CORS_ORIGINS),
            )

    def test_configured_origins_are_normalized_and_deduplicated(
        self,
    ) -> None:
        with patch.dict(
            os.environ,
            {
                "CORS_ORIGINS": (
                    " https://ha-config-generator.vercel.app/, "
                    "http://localhost:3000,"
                    "https://example.com "
                )
            },
            clear=True,
        ):
            self.assertEqual(
                get_cors_origins(),
                [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "https://ha-config-generator.vercel.app",
                    "https://example.com",
                ],
            )

    def test_origin_with_path_is_rejected(self) -> None:
        with patch.dict(
            os.environ,
            {
                "CORS_ORIGINS": (
                    "https://example.com/not-an-origin"
                )
            },
            clear=True,
        ):
            with self.assertRaises(ValueError):
                get_cors_origins()


if __name__ == "__main__":
    unittest.main()
