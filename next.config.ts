import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // If the blog is served via a different domain/proxy, set ASSET_PREFIX
  // to the origin that actually hosts the build output.
  // E.g.  ASSET_PREFIX=https://blog.trysteakhouse.com
  assetPrefix: process.env.ASSET_PREFIX || "https://blog.trysteakhouse.com",
};

export default nextConfig;
