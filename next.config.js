/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to support dynamic routes like robots.ts and sitemap.ts
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

