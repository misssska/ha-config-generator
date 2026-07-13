import unittest

from pydantic import ValidationError

from app.schemas import ESPHomeGenerateRequest


class GPIOFeatureValidationTests(unittest.TestCase):
    def create_request(
        self,
        **overrides: object,
    ) -> ESPHomeGenerateRequest:
        request_data: dict[str, object] = {
            "device_name": "gpio-funkcio-teszt",
            "friendly_name": "GPIO funkció teszt",
            "board": "esp32dev",
        }
        request_data.update(overrides)

        return ESPHomeGenerateRequest(**request_data)

    def test_valid_esp32_gpio_features(self) -> None:
        request = self.create_request(
            status_led={
                "pin": 2,
                "inverted": True,
            },
            pwm_outputs=[
                {
                    "name": "LED-szalag",
                    "pin": 25,
                    "inverted": False,
                    "frequency_hz": 1000,
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

        self.assertEqual(request.status_led.pin, 2)
        self.assertEqual(request.pwm_outputs[0].pin, 25)
        self.assertEqual(request.adc_inputs[0].pin, 34)

    def test_valid_esp8266_a0_input(self) -> None:
        request = self.create_request(
            board="d1_mini",
            adc_inputs=[
                {
                    "name": "A0 feszültség",
                    "pin": 17,
                    "update_interval_s": 60,
                }
            ],
        )

        self.assertEqual(request.adc_inputs[0].pin, 17)

    def test_status_led_rejects_input_only_pin(self) -> None:
        with self.assertRaisesRegex(
            ValidationError,
            "státusz-LED kimenetként",
        ):
            self.create_request(
                status_led={
                    "pin": 34,
                    "inverted": False,
                },
            )

    def test_pwm_rejects_non_pwm_pin(self) -> None:
        with self.assertRaisesRegex(
            ValidationError,
            "nem támogat PWM-kimenetet",
        ):
            self.create_request(
                pwm_outputs=[
                    {
                        "name": "Hibás PWM",
                        "pin": 34,
                    }
                ],
            )

    def test_adc_rejects_non_adc_pin(self) -> None:
        with self.assertRaisesRegex(
            ValidationError,
            "nem támogat ADC-bemenetet",
        ):
            self.create_request(
                adc_inputs=[
                    {
                        "name": "Hibás ADC",
                        "pin": 23,
                    }
                ],
            )

    def test_gpio_collision_is_rejected(self) -> None:
        with self.assertRaisesRegex(
            ValidationError,
            "GPIO23 többször van használva",
        ):
            self.create_request(
                relays=[
                    {
                        "name": "Teszt relé",
                        "pin": 23,
                    }
                ],
                status_led={
                    "pin": 23,
                    "inverted": True,
                },
            )


if __name__ == "__main__":
    unittest.main()
