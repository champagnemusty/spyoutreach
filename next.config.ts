import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "**/spy/**": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
