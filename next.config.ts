import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a minimal .next/standalone server (only traced files + deps) for Docker — see Dockerfile.
  output: "standalone",
};

export default nextConfig;
