import {
  ImageResponse,
} from "next/og";

import {
  BrandIconArtwork,
} from "@/components/BrandArtwork";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <BrandIconArtwork compact />,
    {
      ...size,
    },
  );
}
