import type { NextConfig } from "next";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
  },
  /* config options here */
  typescript: {
    // TODO(W244): Flipped to false, revealed ~30 pre-existing errors hidden by true.
    // Fix incrementally in future waves. Revert to false once all resolved.
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
