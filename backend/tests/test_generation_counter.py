import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.main import (
    generate_esphome,
    read_generation_stats,
)
from app.schemas import ESPHomeGenerateRequest


class GenerationCounterTests(unittest.TestCase):
    def create_request(self) -> ESPHomeGenerateRequest:
        return ESPHomeGenerateRequest(
            device_name="counter-test",
            friendly_name="Counter test",
            board="esp32dev",
        )

    def test_successful_generation_increments_counter(
        self,
    ) -> None:
        with patch(
            "app.main.increment_successful_generations",
            return_value=1,
        ) as increment:
            response = generate_esphome(
                self.create_request()
            )

        self.assertEqual(len(response.files), 2)
        increment.assert_called_once_with()

    def test_counter_failure_does_not_break_generation(
        self,
    ) -> None:
        with patch(
            "app.main.increment_successful_generations",
            side_effect=RuntimeError("database unavailable"),
        ):
            with self.assertLogs(
                "app.main",
                level="ERROR",
            ):
                response = generate_esphome(
                    self.create_request()
                )

        self.assertEqual(len(response.files), 2)

    def test_stats_endpoint_returns_count(self) -> None:
        with patch(
            "app.main.get_successful_generations",
            return_value=42,
        ):
            response = read_generation_stats()

        self.assertEqual(
            response.successful_generations,
            42,
        )

    def test_stats_endpoint_returns_503_on_database_error(
        self,
    ) -> None:
        with patch(
            "app.main.get_successful_generations",
            side_effect=RuntimeError("database unavailable"),
        ):
            with self.assertLogs(
                "app.main",
                level="ERROR",
            ):
                with self.assertRaises(
                    HTTPException
                ) as context:
                    read_generation_stats()

        self.assertEqual(
            context.exception.status_code,
            503,
        )


if __name__ == "__main__":
    unittest.main()
