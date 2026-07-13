import unittest

from app.schemas import ESPHomeGenerateRequest
from app.services.esphome_generator import (
    build_esphome_project,
)


class GPIOFeatureGenerationTests(unittest.TestCase):
    def generate_yaml(
        self,
        **overrides: object,
    ) -> str:
        request_data: dict[str, object] = {
            "device_name": "gpio-generator-teszt",
            "friendly_name": "GPIO generátor teszt",
            "board": "esp32dev",
        }
        request_data.update(overrides)

        request = ESPHomeGenerateRequest(**request_data)
        result = build_esphome_project(request)

        return result.files[0].content

    def test_status_led_generation(self) -> None:
        yaml_content = self.generate_yaml(
            status_led={
                "pin": 2,
                "inverted": True,
            },
        )

        self.assertIn(
            "status_led:",
            yaml_content,
        )
        self.assertIn(
            "    number: GPIO2",
            yaml_content,
        )
        self.assertIn(
            "    inverted: true",
            yaml_content,
        )

    def test_esp32_pwm_and_adc_generation(self) -> None:
        yaml_content = self.generate_yaml(
            pwm_outputs=[
                {
                    "name": "LED-szalag",
                    "pin": 25,
                    "inverted": False,
                    "frequency_hz": 1220,
                }
            ],
            adc_inputs=[
                {
                    "name": "Analóg érzékelő",
                    "pin": 34,
                    "update_interval_s": 30,
                    "attenuation": "auto",
                }
            ],
        )

        self.assertIn(
            "  - platform: ledc",
            yaml_content,
        )
        self.assertIn(
            "      number: GPIO25",
            yaml_content,
        )
        self.assertIn(
            "    frequency: 1220Hz",
            yaml_content,
        )
        self.assertIn(
            "  - platform: monochromatic",
            yaml_content,
        )
        self.assertIn(
            '    name: "LED-szalag"',
            yaml_content,
        )
        self.assertIn(
            "  - platform: adc",
            yaml_content,
        )
        self.assertIn(
            "    pin: GPIO34",
            yaml_content,
        )
        self.assertIn(
            "    update_interval: 30s",
            yaml_content,
        )
        self.assertIn(
            "    attenuation: auto",
            yaml_content,
        )

    def test_esp8266_pwm_and_adc_generation(self) -> None:
        yaml_content = self.generate_yaml(
            board="d1_mini",
            pwm_outputs=[
                {
                    "name": "D1 Mini PWM",
                    "pin": 5,
                    "frequency_hz": 1000,
                }
            ],
            adc_inputs=[
                {
                    "name": "A0 feszültség",
                    "pin": 17,
                    "update_interval_s": 60,
                }
            ],
        )

        self.assertIn(
            "  - platform: esp8266_pwm",
            yaml_content,
        )
        self.assertIn(
            "      number: GPIO5",
            yaml_content,
        )
        self.assertIn(
            "    pin: A0",
            yaml_content,
        )
        self.assertNotIn(
            "    attenuation:",
            yaml_content,
        )


if __name__ == "__main__":
    unittest.main()
