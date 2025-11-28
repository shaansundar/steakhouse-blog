/**
 * RSS Feed Route
 * 
 * Generates RSS feed for blog posts to help with indexing and discovery.
 * RSS feeds are crawled by search engines and can help with faster indexing.
 */

import { NextResponse } from "next/server";
import { getAllPosts, getAuthorName } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";
const SITE_NAME = "SteakHouse Blog";

export async function GET() {
  const posts = getAllPosts().slice(0, 20); // Latest 20 posts

  const rssItems = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      const updatedDate = post.updatedAt
        ? new Date(post.updatedAt).toUTCString()
        : pubDate;

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <author>${getAuthorName(post.author)}</author>
      <pubDate>${pubDate}</pubDate>
      <updated>${updatedDate}</updated>
      <category>${post.tags.join(", ")}</category>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Expert insights on Generative Engine Optimization (GEO), AI content strategy, and making content discoverable by AI systems.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-default.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

