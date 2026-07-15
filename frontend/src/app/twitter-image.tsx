import {
  ImageResponse,
} from "next/og";

import {
  SocialImageArtwork,
} from "@/components/BrandArtwork";

export const alt =
  "HA Config Generator - visual ESPHome configuration";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <SocialImageArtwork />,
    {
      ...size,
    },
  );
}
