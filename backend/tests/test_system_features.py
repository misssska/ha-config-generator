import unittest

from app.schemas import ESPHomeGenerateRequest
from app.services.esphome_generator import (
    build_esphome_project,
)


class SystemFeatureGenerationTests(unittest.TestCase):
    def generate_yaml(
        self,
        **overrides: object,
    ) -> str:
        request_data: dict[str, object] = {
            "device_name": "rendszer-teszt",
            "friendly_name": "Rendszer teszt",
            "board": "esp32dev",
        }
        request_data.update(overrides)

        request = ESPHomeGenerateRequest(
            **request_data,
        )

        result = build_esphome_project(request)

        return result.files[0].content

    def test_system_features_are_enabled_by_default(
        self,
    ) -> None:
        yaml_content = self.generate_yaml()

        self.assertIn(
            "sensor:",
            yaml_content,
        )
        self.assertIn(
            "  - platform: uptime",
            yaml_content,
        )
        self.assertIn(
            "    type: seconds",
            yaml_content,
        )
        self.assertIn(
            '    name: "Üzemidő"',
            yaml_content,
        )
        self.assertIn(
            "  - platform: wifi_signal",
            yaml_content,
        )
        self.assertIn(
            '    name: "Wi-Fi jelerősség"',
            yaml_content,
        )
        self.assertIn(
            "button:",
            yaml_content,
        )
        self.assertIn(
            "  - platform: restart",
            yaml_content,
        )
        self.assertIn(
            '    name: "Eszköz újraindítása"',
            yaml_content,
        )

    def test_system_features_can_be_disabled(
        self,
    ) -> None:
        yaml_content = self.generate_yaml(
            include_uptime_sensor=False,
            include_wifi_signal_sensor=False,
            include_restart_button=False,
        )

        self.assertNotIn(
            "platform: uptime",
            yaml_content,
        )
        self.assertNotIn(
            "platform: wifi_signal",
            yaml_content,
        )
        self.assertNotIn(
            "platform: restart",
            yaml_content,
        )

    def test_existing_gpio_generation_still_works(
        self,
    ) -> None:
        yaml_content = self.generate_yaml(
            relays=[
                {
                    "name": "Teszt relé",
                    "pin": 23,
                    "inverted": True,
                    "restore_mode": "ALWAYS_OFF",
                }
            ],
            binary_sensors=[
                {
                    "name": "Teszt bemenet",
                    "pin": 22,
                    "inverted": True,
                    "pull_mode": "PULLUP",
                    "device_class": "door",
                    "delayed_on_ms": 20,
                    "delayed_off_ms": 20,
                }
            ],
        )

        self.assertIn(
            "switch:",
            yaml_content,
        )
        self.assertIn(
            '    name: "Teszt relé"',
            yaml_content,
        )
        self.assertIn(
            "binary_sensor:",
            yaml_content,
        )
        self.assertIn(
            '    name: "Teszt bemenet"',
            yaml_content,
        )


if __name__ == "__main__":
    unittest.main()
