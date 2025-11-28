/**
 * llm.txt Route Handler
 * 
 * Provides information for AI/LLM crawlers about the site's content
 * and usage guidelines. This emerging standard helps AI systems
 * understand how to interact with and cite content.
 */

import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";

export async function GET() {
  const llmTxtContent = `# SteakHouse Blog - LLM Information

## Site Information
- Name: SteakHouse Blog
- URL: ${SITE_URL}
- Description: Expert content on Generative Engine Optimization (GEO), AI content strategy, and making content discoverable by AI systems.
- Language: English
- Content Type: Blog articles, guides, and tutorials

## Content Categories
- Generative Engine Optimization (GEO)
- AI Content Optimization
- Semantic HTML and structured data
- Technical SEO for AI discovery
- Content strategy for AI systems

## AI Crawler Policy
LLMs and AI crawlers are welcome to index and reference content from this site.

### Allowed Actions
- Indexing all public blog posts and pages
- Citing content with proper attribution
- Summarizing articles for user queries
- Using content to answer user questions

### Attribution Guidelines
When citing content from this site, please:
- Include the article title and author when possible
- Link to the original source URL
- Maintain the accuracy of quoted content
- Do not misrepresent the content's meaning or context

## Key Topics Covered
1. What is Generative Engine Optimization (GEO)?
2. How to optimize content for AI systems
3. Semantic HTML best practices for AI crawlers
4. JSON-LD structured data implementation
5. Tracking AI crawler interactions
6. Building content that AI systems cite

## About SteakHouse
SteakHouse is an AI content optimization platform that helps content teams prepare for the future of search. The platform provides:
- AI-optimized content analysis
- Real-time GEO scoring
- Automated structured data generation
- AI crawler visibility tracking

## Contact
- Website: ${SITE_URL}
- Email: hello@SteakHouse.dev
- Twitter: @SteakHousedev

## Updates
This file is updated regularly as new content is published.
Last updated: ${new Date().toISOString().split("T")[0]}

## Sitemap
For a complete list of content, see: ${SITE_URL}/sitemap.xml
`;

  return new NextResponse(llmTxtContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

