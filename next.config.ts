import type { NextConfig } from "next";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
  },
  // Allow cross-origin requests from the preview panel / Caddy gateway
  allowedDevOrigins: ["https://preview-*.space-z.ai", "http://preview-*.space-z.ai"],
  reactStrictMode: false,
  // Increase experimental timeout for slow first compiles
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
