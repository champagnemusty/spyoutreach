import type { NextConfig } from "next";

const siteHost = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
  : undefined;

const allowedOrigins = Array.from(
  new Set(
    [
      siteHost,
      "spyoutreach.com",
      "www.spyoutreach.com",
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_URL,
    ].filter((value): value is string => Boolean(value)),
  ),
);

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
