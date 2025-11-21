# GEO Optimized Blog

A Next.js 14 blog website optimized for **Generative AI Engine Optimization (GEO)** and traditional SEO. Built with semantic HTML, structured data (JSON-LD), and AI crawler accessibility in mind.

## ✨ Features

- **🤖 AI-Friendly**: Optimized for ChatGPT, Claude, Gemini, and other LLM crawlers
- **📊 Rich Structured Data**: JSON-LD implementation for BlogPosting, FAQPage, WebSite, and Organization schemas
- **🎯 Semantic HTML**: Proper HTML5 semantic elements throughout (`<article>`, `<section>`, `<nav>`, etc.)
- **⚡ SSG/SSR**: All content visible in initial HTML—no JavaScript required for crawlers
- **♿ Accessible**: WCAG-compliant with proper heading hierarchy and ARIA labels
- **🔍 SEO Optimized**: OpenGraph tags, Twitter cards, canonical URLs, and sitemap.xml
- **📝 Markdown Support**: Write blog posts in Markdown with rich frontmatter
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see your blog.

### Build for Production

```bash
# Create static export
npm run build

# Preview production build
npm start
```

## 📝 Adding a New Blog Post

1. Create a new `.md` file in `content/posts/`
2. Add frontmatter with all required fields
3. Write your content in Markdown

### Frontmatter Template

```yaml
---
title: "Your Blog Post Title"
description: "A compelling description for SEO and social sharing"
slug: "your-blog-post-slug"
publishedAt: "2025-11-20"
updatedAt: "2025-11-20"
author:
  name: "Your Name"
  url: "https://yourwebsite.com"
tags:
  - "Tag 1"
  - "Tag 2"
  - "Tag 3"
faq:
  - question: "What is this about?"
    answer: "This is a comprehensive answer that will be included in JSON-LD FAQPage schema."
  - question: "Why does this matter?"
    answer: "Another detailed answer that helps both users and AI understand your content."
---

# Your Content Starts Here

Write your blog post content in Markdown...
```

### Required Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | The blog post title (used for h1 and meta title) |
| `description` | string | Post description (used for meta description and OpenGraph) |
| `slug` | string | URL-friendly identifier (e.g., "my-blog-post") |
| `publishedAt` | string | Publication date in YYYY-MM-DD format |
| `updatedAt` | string | Last update date in YYYY-MM-DD format |
| `author.name` | string | Author's full name |
| `author.url` | string | Link to author's profile or website |
| `tags` | array | List of relevant tags for categorization |
| `faq` | array | (Optional) FAQ items with question and answer fields |

## 🏗️ Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with navigation and footer
│   ├── page.tsx             # Homepage with latest posts
│   ├── globals.css          # Global styles and typography
│   ├── robots.ts            # Robots.txt configuration
│   ├── sitemap.ts           # Dynamic sitemap generation
│   └── blog/
│       ├── page.tsx         # Blog index page (all posts)
│       └── [slug]/
│           └── page.tsx     # Individual blog post page
├── content/
│   └── posts/               # Markdown blog posts
│       ├── post-1.md
│       └── post-2.md
├── lib/
│   ├── posts.ts             # Post loading and parsing utilities
│   ├── structured-data.ts   # JSON-LD schema generators
│   └── markdown.ts          # Markdown to HTML converter
├── public/                  # Static assets
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 Customization

### Change Site Name and URL

Edit `lib/structured-data.ts`:

```typescript
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
const SITE_NAME = 'Your Blog Name';
```

Or set environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Modify Styling

All styles use Tailwind CSS. Key files:

- `app/globals.css` - Global styles and prose typography
- `tailwind.config.ts` - Tailwind configuration
- Component files - Inline Tailwind classes

### Add Social Links

Edit the Organization schema in `lib/structured-data.ts`:

```typescript
sameAs: [
  'https://twitter.com/yourhandle',
  'https://linkedin.com/company/yourcompany',
  'https://github.com/yourusername',
],
```

## 🤖 AI Crawler Configuration

### Robots.txt

The site explicitly allows major AI crawlers in `app/robots.ts`:

- GPTBot (OpenAI)
- ChatGPT-User
- Google-Extended (Google Gemini)
- anthropic-ai (Anthropic)
- ClaudeBot (Anthropic)

### Sitemap

Automatically generated at `/sitemap.xml` including:

- Homepage
- Blog index
- All blog posts with last modified dates

## 📊 Structured Data

Each page includes appropriate JSON-LD schemas:

### Homepage & Layout
- **WebSite** - Site-level information
- **Organization** - Brand and social profiles

### Blog Posts
- **BlogPosting** - Article metadata (author, dates, keywords)
- **FAQPage** - FAQ structured data (when FAQ is provided in frontmatter)

### How to Verify

1. View page source and look for `<script type="application/ld+json">` tags
2. Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
3. Use [Schema.org Validator](https://validator.schema.org/)

## 🎯 GEO Best Practices Implemented

✅ **Server-Side Rendering** - All content visible without JavaScript  
✅ **Semantic HTML** - Proper use of article, section, header, nav, time elements  
✅ **Heading Hierarchy** - Single h1, proper h2/h3 structure  
✅ **Structured Data** - Comprehensive JSON-LD on all pages  
✅ **Canonical URLs** - Explicit canonical tags  
✅ **Meta Tags** - OpenGraph and Twitter Card support  
✅ **AI Crawler Access** - Explicit robots.txt allowances  
✅ **Sitemap** - Dynamic sitemap with lastmod dates  
✅ **Accessibility** - ARIA labels, focus states, keyboard navigation  
✅ **FAQ Schema** - Structured Q&A for AI extraction  

## 🧪 Testing AI Crawlability

### Disable JavaScript Test

1. Disable JavaScript in your browser
2. Visit your blog
3. Verify all content is still visible

### View Source Test

1. Right-click → "View Page Source"
2. Confirm your content appears in the raw HTML
3. Check for JSON-LD script tags

### Text-Only Browser

Use a text browser like Lynx to see what AI crawlers see:

```bash
lynx http://localhost:3000
```

### Server Logs

Monitor your server logs for AI crawler user agents:

```
GPTBot
ClaudeBot
Google-Extended
ChatGPT-User
anthropic-ai
```

## 🚢 Deployment

### Static Export

This project is configured for static export (`output: 'export'` in `next.config.js`).

Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Connect your Git repo
- **GitHub Pages**: Use GitHub Actions
- **AWS S3**: Upload the `out/` directory
- **Any static host**: Upload the `out/` directory after `npm run build`

### Environment Variables

Set these for production:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📈 Monitoring

Track AI crawler activity:

1. **Server Logs** - Look for AI crawler user agents
2. **Analytics** - Monitor referrals from AI platforms
3. **Search Console** - Track impressions from AI-enhanced search

## 🤝 Contributing

This is a reference implementation of GEO best practices. Feel free to:

- Fork and customize for your needs
- Submit issues for bugs or suggestions
- Share your GEO optimization results

## 📚 Resources

- [Schema.org Documentation](https://schema.org/)
- [Google's Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [OpenAI GPTBot Documentation](https://platform.openai.com/docs/gptbot)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

## 📄 License

MIT License - Feel free to use this as a foundation for your own GEO-optimized blog.

---

**Built with ❤️ for the age of AI-powered discovery**

