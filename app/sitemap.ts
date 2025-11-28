/**
 * Sitemap Configuration
 * 
 * Generates XML sitemap for search engines and AI crawlers.
 * Includes all blog posts and static pages.
 */

import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getAllPosts } from "@/lib/posts";

/**
 * Get the current site URL dynamically based on the request host
 * This ensures sitemap URLs match the domain where the sitemap is hosted
 */
async function getSiteUrl(): Promise<string> {
  try {
    // Try to get the host from headers (works in production)
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || 
                     headersList.get("x-forwarded-protocol") || 
                     (host?.includes("localhost") ? "http" : "https");
    
    if (host && !host.includes("localhost")) {
      // Use the actual request host (but not localhost for production)
      return `${protocol === "https" ? "https" : "http"}://${host}`;
    }
  } catch (error) {
    // Headers might not be available in all contexts
    console.warn("Could not get host from headers:", error);
  }
  
  // Fallback to environment variable or default
  return process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = await getSiteUrl();
  const posts = getAllPosts();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/feed.xml`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}

