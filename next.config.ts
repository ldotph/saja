import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["resend"],
    serverActions: {
      bodySizeLimit: "10mb"
    }
  }
};

export default nextConfig;
