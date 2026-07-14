import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return [];
  }

  try {
    const hostname = new URL(apiUrl).hostname;

    if (
      !hostname ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      return [];
    }

    return [hostname];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
