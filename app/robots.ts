/**
 * robots.txt Configuration
 * 
 * Defines crawling rules for search engines and AI crawlers.
 * All content is allowed for indexing by default.
 */

import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all user agents by default
        // Allow all content (blog posts, pages) - this is the default behavior
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/newsletter/",      // Protect newsletter API route
          "/_next/",                // Next.js internal routes
          "/admin/",                // Future admin routes
          "/private/",              // Private content
        ],
      },
      {
        // Explicitly allow AI crawlers and ensure they have access
        // Grouping them for cleaner configuration
        userAgent: [
          "GPTBot",
          "ChatGPT-User", 
          "Google-Extended",
          "ClaudeBot",
          "Claude-Web",
          "CCBot",
          "PerplexityBot",
          "Meta-ExternalAgent",
          "Amazonbot",
          "Applebot",
        ],
        allow: "/", // Allow all content including blog posts
        // Disallow API/internal routes to prevent unnecessary crawling
        disallow: [
          "/api/newsletter/",
          "/_next/",
          "/admin/",
          "/private/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

