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

/**
 * IMPORTANT: To ensure AI crawlers discover your site:
 * 
 * 1. Submit sitemap to Google Search Console:
 *    - Go to https://search.google.com/search-console
 *    - Add property: ${SITE_URL}
 *    - Submit sitemap: ${SITE_URL}/sitemap.xml
 * 
 * 2. Submit sitemap to Bing Webmaster Tools:
 *    - Go to https://www.bing.com/webmasters
 *    - Add site and submit sitemap
 * 
 * 3. Verify site is crawlable:
 *    - Test robots.txt: ${SITE_URL}/robots.txt
 *    - Test sitemap: ${SITE_URL}/sitemap.xml
 *    - Test llms.txt: ${SITE_URL}/llms.txt
 * 
 * 4. For AI-specific discovery:
 *    - Ensure llms.txt is accessible: ${SITE_URL}/llms.txt
 *    - Verify structured data with Google Rich Results Test
 *    - Monitor AI crawler visits in your analytics
 */

