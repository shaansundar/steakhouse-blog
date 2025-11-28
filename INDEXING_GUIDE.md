# Indexing Guide for AI Discovery

This guide helps ensure your blog is discoverable by AI systems like ChatGPT, Claude, Google AI Overviews, and Perplexity.

## ✅ Technical Setup (Already Implemented)

Your site now has:

1. **robots.txt** - Allows all crawlers including AI bots
   - Accessible at: `https://blog.trysteakhouse.com/robots.txt`
   - Explicitly allows GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.

2. **sitemap.xml** - Complete sitemap with all pages
   - Accessible at: `https://blog.trysteakhouse.com/sitemap.xml`
   - Includes homepage, blog listing, all posts, feed.xml, and llms.txt

3. **RSS Feed** - RSS feed for faster discovery
   - Accessible at: `https://blog.trysteakhouse.com/feed.xml`
   - Helps search engines discover new content quickly

4. **llms.txt** - AI crawler guidelines
   - Accessible at: `https://blog.trysteakhouse.com/llms.txt`
   - Provides explicit permissions and guidelines for AI systems

5. **Structured Data (JSON-LD)** - Machine-readable content
   - BlogPosting schema on all posts
   - FAQPage schema on homepage
   - Organization and WebSite schemas
   - BreadcrumbList for navigation

6. **Meta Tags** - Proper indexing signals
   - `index: true, follow: true` on all pages
   - Canonical URLs
   - Open Graph and Twitter Cards

## 🚀 Action Items to Get Indexed

### 1. Submit to Google Search Console

**Critical Step**: AI systems rely on Google's index. You MUST submit your site.

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://blog.trysteakhouse.com`
3. Verify ownership (DNS, HTML file, or meta tag)
4. Submit sitemap: `https://blog.trysteakhouse.com/sitemap.xml`
5. Request indexing for homepage: `https://blog.trysteakhouse.com`

**Why this matters**: ChatGPT and Google AI Overviews primarily use Google's index. Without Google indexing, AI systems won't find your content.

### 2. Submit to Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `https://blog.trysteakhouse.com`
3. Submit sitemap: `https://blog.trysteakhouse.com/sitemap.xml`

**Why this matters**: Bing powers some AI systems and provides additional discovery paths.

### 3. Verify Crawlability

Test these URLs to ensure they're accessible:

- ✅ `https://blog.trysteakhouse.com/robots.txt`
- ✅ `https://blog.trysteakhouse.com/sitemap.xml`
- ✅ `https://blog.trysteakhouse.com/llms.txt`
- ✅ `https://blog.trysteakhouse.com/feed.xml`
- ✅ `https://blog.trysteakhouse.com/blog/[any-post-slug]`

### 4. Monitor AI Crawler Visits

Your site already tracks AI crawler visits. Check your analytics to see:
- Which AI bots are visiting
- Which pages they're accessing
- How frequently they crawl

### 5. Build External Links

AI systems also discover content through:
- Social media shares (LinkedIn, Twitter/X)
- External links from other sites
- Community mentions (Reddit, Hacker News, etc.)

### 6. Ensure Content Quality

AI systems prioritize:
- ✅ Clear, direct answers to questions
- ✅ Well-structured content (headings, lists)
- ✅ Authoritative information
- ✅ Recent, updated content
- ✅ Proper semantic HTML

## 🔍 How to Verify Indexing

### Google Indexing

1. Search: `site:blog.trysteakhouse.com`
2. Check Google Search Console for indexing status
3. Use Google Rich Results Test to verify structured data

### AI System Discovery

1. **ChatGPT**: Ask "What is Generative Engine Optimization?" and see if your content is cited
2. **Claude**: Ask similar questions and check citations
3. **Perplexity**: Search for GEO-related topics and check sources
4. **Google AI Overviews**: Search for topics you cover and see if your content appears

## ⚠️ Common Issues

### Site Not Indexed

**Problem**: Site shows as "not indexed" in Search Console

**Solutions**:
- Ensure `robots.txt` allows crawling
- Submit sitemap manually
- Request indexing for key pages
- Check for crawl errors
- Ensure site is accessible (no password protection)

### Slow Indexing

**Problem**: Content takes weeks to appear

**Solutions**:
- Submit sitemap immediately after publishing
- Use RSS feed (already implemented)
- Build external links
- Share on social media
- Update existing content regularly

### AI Systems Not Citing

**Problem**: Site is indexed but AI doesn't cite it

**Solutions**:
- Ensure content answers questions directly
- Use FAQ sections (already implemented)
- Add clear TL;DR sections
- Improve content authority signals
- Get more external links

## 📊 Monitoring

Track these metrics:

1. **Google Search Console**:
   - Pages indexed
   - Impressions
   - Clicks
   - Average position

2. **Your Analytics**:
   - AI crawler visits (already tracked)
   - Which bots visit
   - Which pages they access

3. **Manual Checks**:
   - Test citations in ChatGPT/Claude
   - Check Google AI Overviews
   - Monitor Perplexity sources

## 🎯 Priority Actions

**Do these first** (in order):

1. ✅ Submit to Google Search Console (MOST IMPORTANT)
2. ✅ Submit to Bing Webmaster Tools
3. ✅ Request indexing for homepage
4. ✅ Share content on social media
5. ✅ Build a few external links

## 📝 Notes

- Indexing typically takes 1-7 days after submission
- AI systems may take longer to start citing (weeks to months)
- Regular content updates help maintain visibility
- Quality content gets cited more often than promotional content

---

**Last Updated**: ${new Date().toISOString().split("T")[0]}

