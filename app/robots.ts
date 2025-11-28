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
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",      // Protect API routes
          "/_next/",    // Next.js internal routes
          "/admin/",    // Future admin routes
        ],
      },
      {
        // Explicitly allow AI crawlers (for clarity and documentation)
        // GPTBot - OpenAI's crawler for ChatGPT
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        // ChatGPT-User - Direct ChatGPT browsing
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        // Google-Extended - Google's AI training crawler
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        // ClaudeBot - Anthropic's crawler
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        // Claude-Web - Claude's browsing feature
        userAgent: "Claude-Web",
        allow: "/",
      },
      {
        // CCBot - Common Crawl (used by many AI systems)
        userAgent: "CCBot",
        allow: "/",
      },
      {
        // PerplexityBot - Perplexity AI's crawler
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        // Meta-ExternalAgent - Meta's AI crawler
        userAgent: "Meta-ExternalAgent",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

