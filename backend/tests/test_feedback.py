import unittest
from unittest.mock import patch

from fastapi import HTTPException
from pydantic import ValidationError

from app.main import submit_feedback
from app.schemas import FeedbackCreateRequest


class FeedbackTests(unittest.TestCase):
    def test_feedback_is_saved(self) -> None:
        request = FeedbackCreateRequest(
            category="idea",
            message="  Please add another board type.  ",
            email=" user@example.com ",
        )

        with patch(
            "app.main.save_feedback_message",
            return_value=1,
        ) as save:
            response = submit_feedback(request)

        self.assertTrue(response.accepted)

        save.assert_called_once_with(
            category="idea",
            message="Please add another board type.",
            email="user@example.com",
        )

    def test_email_is_optional(self) -> None:
        request = FeedbackCreateRequest(
            category="bug",
            message="The board list did not load.",
            email="   ",
        )

        self.assertIsNone(request.email)

    def test_honeypot_submission_is_not_saved(
        self,
    ) -> None:
        request = FeedbackCreateRequest(
            category="other",
            message="Automated spam submission.",
            website="https://spam.example",
        )

        with patch(
            "app.main.save_feedback_message",
        ) as save:
            response = submit_feedback(request)

        self.assertTrue(response.accepted)
        save.assert_not_called()

    def test_database_error_returns_503(self) -> None:
        request = FeedbackCreateRequest(
            category="bug",
            message="Generation failed unexpectedly.",
        )

        with patch(
            "app.main.save_feedback_message",
            side_effect=RuntimeError(
                "database unavailable"
            ),
        ):
            with self.assertLogs(
                "app.main",
                level="ERROR",
            ):
                with self.assertRaises(
                    HTTPException
                ) as context:
                    submit_feedback(request)

        self.assertEqual(
            context.exception.status_code,
            503,
        )

    def test_whitespace_message_is_rejected(
        self,
    ) -> None:
        with self.assertRaises(ValidationError):
            FeedbackCreateRequest(
                category="bug",
                message="             ",
            )


if __name__ == "__main__":
    unittest.main()
