import unittest
from unittest.mock import MagicMock, patch

from fastapi import HTTPException
from pydantic import ValidationError

from app.database import save_feedback_message
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

    def test_expired_feedback_is_deleted_before_insert(
        self,
    ) -> None:
        connection = MagicMock()
        insert_result = MagicMock()
        insert_result.fetchone.return_value = (42,)

        def execute(
            sql: str,
            parameters: object = None,
        ) -> MagicMock:
            del parameters

            normalized_sql = " ".join(
                sql.split()
            )

            if normalized_sql.startswith(
                "INSERT INTO feedback_messages"
            ):
                return insert_result

            return MagicMock()

        connection.execute.side_effect = execute

        context_manager = MagicMock()
        context_manager.__enter__.return_value = (
            connection
        )
        context_manager.__exit__.return_value = False

        with patch(
            "app.database._connect",
            return_value=context_manager,
        ):
            identifier = save_feedback_message(
                category="idea",
                message="Please add another board.",
                email=None,
            )

        self.assertEqual(identifier, 42)

        executed_sql = [
            " ".join(call.args[0].split())
            for call in (
                connection.execute.call_args_list
            )
        ]

        delete_index = next(
            index
            for index, sql in enumerate(
                executed_sql
            )
            if sql.startswith(
                "DELETE FROM feedback_messages"
            )
        )

        insert_index = next(
            index
            for index, sql in enumerate(
                executed_sql
            )
            if sql.startswith(
                "INSERT INTO feedback_messages"
            )
        )

        self.assertLess(
            delete_index,
            insert_index,
        )

        self.assertIn(
            "INTERVAL '12 months'",
            executed_sql[delete_index],
        )


if __name__ == "__main__":
    unittest.main()
