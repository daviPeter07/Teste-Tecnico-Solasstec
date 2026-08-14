import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  outputFileTracingRoot: path.join(__dirname, ".."),
  reactCompiler: true,
};

export default nextConfig;
