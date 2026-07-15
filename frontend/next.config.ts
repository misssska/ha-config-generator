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

const PRODUCTION_BACKEND_API_URL =
  "https://ha-config-generator-api.onrender.com";
const DEVELOPMENT_BACKEND_API_URL =
  "http://127.0.0.1:8000";

function getBackendApiUrl(): string {
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_BACKEND_API_URL
    : DEVELOPMENT_BACKEND_API_URL;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),

  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${getBackendApiUrl()}/:path*`,
      },
    ];
  },
};

export default nextConfig;
