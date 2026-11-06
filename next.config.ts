import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The parent folder has its own package-lock.json; pin the workspace root here.
  turbopack: { root: process.cwd() },
  // The root layout sits in [lang], so unmatched URLs need a standalone 404 document.
  experimental: { globalNotFound: true },
};

export default nextConfig;
