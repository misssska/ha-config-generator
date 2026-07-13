import unittest

from app.board_profiles import get_pin_profile
from app.services.esphome_generator import get_board_options


class BoardCapabilityTests(unittest.TestCase):
    def test_esp32_pwm_and_adc_capabilities(self) -> None:
        output_pin = get_pin_profile("esp32dev", 23)
        analog_output_pin = get_pin_profile("esp32dev", 32)
        input_only_adc_pin = get_pin_profile("esp32dev", 34)

        self.assertIsNotNone(output_pin)
        self.assertIsNotNone(analog_output_pin)
        self.assertIsNotNone(input_only_adc_pin)

        assert output_pin is not None
        assert analog_output_pin is not None
        assert input_only_adc_pin is not None

        self.assertTrue(output_pin["supports_pwm"])
        self.assertFalse(output_pin["supports_adc"])

        self.assertTrue(analog_output_pin["supports_pwm"])
        self.assertTrue(analog_output_pin["supports_adc"])

        self.assertFalse(input_only_adc_pin["supports_pwm"])
        self.assertTrue(input_only_adc_pin["supports_adc"])
        self.assertFalse(input_only_adc_pin["can_output"])

    def test_esp32_variant_adc_ranges(self) -> None:
        c3_adc = get_pin_profile(
            "esp32-c3-devkitm-1",
            5,
        )
        c3_non_adc = get_pin_profile(
            "esp32-c3-devkitm-1",
            6,
        )
        s3_adc = get_pin_profile(
            "esp32-s3-devkitc-1",
            20,
        )
        s3_non_adc = get_pin_profile(
            "esp32-s3-devkitc-1",
            21,
        )

        assert c3_adc is not None
        assert c3_non_adc is not None
        assert s3_adc is not None
        assert s3_non_adc is not None

        self.assertTrue(c3_adc["supports_adc"])
        self.assertFalse(c3_non_adc["supports_adc"])
        self.assertTrue(s3_adc["supports_adc"])
        self.assertFalse(s3_non_adc["supports_adc"])

    def test_esp8266_a0_is_analog_only(self) -> None:
        analog_pin = get_pin_profile("d1_mini", 17)

        self.assertIsNotNone(analog_pin)
        assert analog_pin is not None

        self.assertEqual(
            analog_pin["label"],
            "A0 / GPIO17 – analóg bemenet",
        )
        self.assertTrue(analog_pin["supports_adc"])
        self.assertFalse(analog_pin["supports_pwm"])
        self.assertFalse(analog_pin["can_input"])
        self.assertFalse(analog_pin["can_output"])

    def test_board_api_exposes_capability_fields(self) -> None:
        boards = get_board_options()

        self.assertGreater(len(boards), 0)

        for board in boards:
            for pin in board.pins:
                self.assertIsInstance(
                    pin.supports_pwm,
                    bool,
                )
                self.assertIsInstance(
                    pin.supports_adc,
                    bool,
                )


if __name__ == "__main__":
    unittest.main()
