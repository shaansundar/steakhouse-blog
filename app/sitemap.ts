/**
 * Sitemap Configuration
 * 
 * Generates XML sitemap for search engines and AI crawlers.
 * Includes all blog posts and static pages.
 */

import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

/**
 * Get the canonical site URL
 * Uses NEXT_PUBLIC_SITE_URL environment variable for canonical domain
 * Falls back to blog.trysteakhouse.com for blog-specific content
 */
function getSiteUrl(): string {
  // Use canonical blog domain from environment variable
  // Should be set to https://blog.trysteakhouse.com in production
  return process.env.NEXT_PUBLIC_SITE_URL || "https://blog.trysteakhouse.com";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const SITE_URL = getSiteUrl();
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
      url: `${SITE_URL}/geo-hub`,
      lastModified: new Date(),
      changeFrequency: "weekly",
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

