import unittest

from app.schemas import ESPHomeGenerateRequest
from app.services.esphome_generator import (
    build_esphome_project,
)


class ApiGenerationTests(unittest.TestCase):
    def generate_files(
        self,
        *,
        api_encryption_enabled: bool,
    ) -> tuple[str, str]:
        request = ESPHomeGenerateRequest(
            device_name="api-teszt",
            friendly_name="API teszt",
            board="esp32dev",
            api_encryption_enabled=api_encryption_enabled,
        )

        result = build_esphome_project(request)

        yaml_content = result.files[0].content
        secrets_content = result.files[1].content

        return yaml_content, secrets_content

    def test_encrypted_api_generation(self) -> None:
        yaml_content, secrets_content = self.generate_files(
            api_encryption_enabled=True,
        )

        self.assertIn(
            "\napi:\n",
            yaml_content,
        )
        self.assertIn(
            "  encryption:",
            yaml_content,
        )
        self.assertIn(
            (
                "    key: !secret "
                "api_teszt_api_encryption_key"
            ),
            yaml_content,
        )
        self.assertIn(
            "api_teszt_api_encryption_key:",
            secrets_content,
        )

    def test_unencrypted_api_remains_enabled(self) -> None:
        yaml_content, secrets_content = self.generate_files(
            api_encryption_enabled=False,
        )

        self.assertIn(
            "\napi:\n",
            yaml_content,
        )
        self.assertNotIn(
            "  encryption:",
            yaml_content,
        )
        self.assertNotIn(
            "api_encryption_key",
            yaml_content,
        )
        self.assertNotIn(
            "api_encryption_key",
            secrets_content,
        )


if __name__ == "__main__":
    unittest.main()
