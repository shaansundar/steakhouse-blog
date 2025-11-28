# SteakHouse Blog

A **production-ready Medium-style blog platform** built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui. Optimized for **SEO**, **GEO (Generative Engine Optimization)**, and **AEO (Answer Engine Optimization)**.

![SteakHouse Blog](https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=SteakHouse+Blog)

## ✨ Features

- **🚀 Next.js 16 App Router** - Latest Next.js with full SSR support
- **📝 Markdown-driven content** - Write posts in Markdown with frontmatter
- **🎨 Beautiful UI** - shadcn/ui components with custom typography
- **🔍 SEO Optimized** - Meta tags, Open Graph, Twitter cards, JSON-LD
- **🤖 GEO/AEO Ready** - Optimized for AI crawlers (GPTBot, ClaudeBot, etc.)
- **📊 View Tracking** - Server-side analytics with Supabase
- **📱 Responsive** - Mobile-first design with Tailwind CSS
- **🎯 Accessibility** - Semantic HTML with proper ARIA attributes
- **⚡ Fast** - Optimized for Core Web Vitals

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Runtime**: Bun
- **Database**: Supabase (PostgreSQL)
- **Markdown**: gray-matter + remark + rehype

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Node.js](https://nodejs.org) (v18+)
- [Supabase](https://supabase.com) account (optional, for view tracking)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/SteakHouse-blog.git
   cd SteakHouse-blog
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:

   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   LOOPS_API_KEY=your-loops-api-key  # Optional, for newsletter subscriptions
   ```

4. **Start the development server**

   ```bash
   bun dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📝 Adding Blog Posts

Blog posts are Markdown files in the `content/posts` directory.

### File Naming Convention

```
YYYY-MM-DD--slug-for-your-post.md
```

Example: `2025-11-28--what-is-generative-engine-optimization.md`

### Frontmatter Schema

```yaml
---
title: "Your Post Title"
slug: optional-custom-slug  # If omitted, derived from filename
excerpt: "A compelling description for SEO and previews (150-160 chars)"
tags:
  - GEO
  - AI Discovery
  - Content Strategy
publishedAt: "2025-11-28T10:00:00Z"
updatedAt: "2025-11-28T12:00:00Z"  # Optional
author: "Your Name"
ogImage: "/og/your-post.png"  # Optional
---

# Your Post Title

**TL;DR:** A brief summary (under 50 words) for AI systems to easily extract.

## Your Content Here...
```

### GEO-Optimized Structure

For best AI discoverability, structure your posts with:

1. **TL;DR section** - Right after the title, provide a concise summary
2. **Clear headings** - Use H2s for main sections, H3s for subsections
3. **Key Takeaways** - Bullet list of main points
4. **FAQ section** - Common questions with short answers

Example:

```markdown
# How to Optimize for AI Discovery

**TL;DR:** To optimize for AI discovery, focus on semantic clarity, structured
data, and direct answers. AI systems prioritize content that's easy to parse.

## Understanding AI Discovery

Content here...

## Key Takeaways

- Point one
- Point two
- Point three

## Frequently Asked Questions

### What is GEO?

GEO (Generative Engine Optimization) is...

### How is it different from SEO?

While SEO focuses on...
```

## 🗄️ Supabase Setup

### Create the page_views table

**Important:** The view tracking feature requires a Supabase table. If you see errors about the table not existing, follow these steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard: https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** → **New Query**

2. **Run the Migration SQL**
   - Copy the contents of `supabase-migration.sql` from the project root
   - Paste it into the SQL Editor
   - Click **Run** (or press `Cmd/Ctrl + Enter`)

   Alternatively, you can run this SQL directly:

```sql
-- Create page_views table for tracking
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  views BIGINT DEFAULT 0,
  crawlers_viewed BIGINT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_views_slug ON public.page_views(slug);
CREATE INDEX IF NOT EXISTS idx_page_views_views ON public.page_views(views DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_last_viewed ON public.page_views(last_viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policy for service role (server-side)
CREATE POLICY "Service role has full access" ON public.page_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

3. **Verify the table was created**
   - Check the **Table Editor** in Supabase
   - You should see `page_views` table with columns: `id`, `slug`, `views`, `crawlers_viewed`, `last_viewed_at`, `created_at`

**Note:** If you don't set up Supabase, the app will still work but view tracking will be disabled (you'll see warnings in the console).

## 📧 Loops Newsletter Integration

The blog includes a newsletter subscription form powered by [Loops.so](https://loops.so), an email marketing platform optimized for developers.

### Setup

1. **Create a Loops account**
   - Sign up at https://loops.so
   - Create a new project or use an existing one

2. **Get your API key**
   - Go to Settings → API in your Loops dashboard
   - Copy your API key

3. **Add to environment variables**

   ```env
   LOOPS_API_KEY=your-loops-api-key-here
   ```

4. **Test the subscription**
   - The newsletter form appears in the sidebar on blog pages
   - In development, if `LOOPS_API_KEY` is not set, the form will return a mock success response
   - In production, the API key is required

### Features

- **Automatic subscription** - Users are added to your Loops contact list
- **Source tracking** - Subscribers are tagged with `source: "blog-sidebar"`
- **User group** - Subscribers are added to the `blog-subscribers` group
- **Duplicate handling** - Gracefully handles already-subscribed emails
- **Error handling** - User-friendly error messages for failed subscriptions

### API Endpoint

The subscription form calls `/api/newsletter/subscribe` which:
- Validates the email address
- Subscribes the user to Loops
- Returns success/error messages
- Handles edge cases (duplicates, API errors, etc.)

### Customization

You can customize the subscription behavior by editing:
- `app/api/newsletter/subscribe/route.ts` - API route logic
- `components/newsletter-form.tsx` - Form UI and behavior
- `lib/loops.ts` - Loops configuration and utilities

### View Tracking Features

The `page_views` table tracks:

- **Total Views** - All page visits (humans + crawlers)
- **Crawler Views** - Visits from AI bots (GPTBot, ClaudeBot, etc.) and search engine crawlers
- **Human Views** - Calculated as total views minus crawler views

#### Display Components

- **ViewCount** - Shows total view count (optionally with crawler breakdown)
- **CrawlerStats** - Detailed card showing view statistics with percentages and progress bars

#### API Endpoints

- `GET /api/views/[slug]` - Get view stats for a specific blog post
- `GET /api/analytics/views` - Get view stats for all posts (for admin/analytics)

### Environment Variables

Add to your `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Never expose the service role key to the client!**

## 📁 Project Structure

```
SteakHouse-blog/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with header/footer
│   ├── page.tsx             # Homepage with bento grid
│   ├── blog/
│   │   ├── page.tsx         # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx     # Individual blog post (SSR)
│   ├── robots.ts            # robots.txt configuration
│   ├── sitemap.ts           # XML sitemap
│   └── llm.txt/
│       └── route.ts         # llm.txt for AI crawlers
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── header.tsx           # Site header
│   ├── footer.tsx           # Site footer
│   ├── post-card.tsx        # Blog post card
│   └── sidebar.tsx          # Homepage sidebar
├── content/
│   └── posts/               # Markdown blog posts
├── lib/
│   ├── posts.ts             # Markdown parsing utilities
│   ├── reading-time.ts      # Reading time calculator
│   ├── userAgent.ts         # Crawler detection
│   ├── supabaseServer.ts    # Supabase server client
│   ├── structured-data.ts   # JSON-LD schemas
│   └── utils.ts             # General utilities
└── public/                  # Static assets
```

## 🔍 SEO & GEO Features

### Metadata

- Dynamic `<title>` and `<meta description>` per page
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs

### Structured Data (JSON-LD)

- **Homepage**: WebSite, Organization, ItemList schemas
- **Blog Posts**: BlogPosting, BreadcrumbList schemas
- **FAQs**: FAQPage schema (when applicable)

### robots.txt

Configured to:

- Allow all search engines
- Explicitly allow AI crawlers (GPTBot, ClaudeBot, etc.)
- Disallow API and internal routes

### llm.txt

Custom endpoint at `/llm.txt` providing:

- Site description for AI systems
- Content categories and topics
- Usage and attribution guidelines
- Contact information

### Sitemap

Auto-generated at `/sitemap.xml` including:

- All static pages
- All blog posts with last modified dates
- Proper priority and change frequency

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SITE_URL` - Your production URL
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `LOOPS_API_KEY` - Your Loops API key (optional, for newsletter)
4. Deploy!

### Manual Build

```bash
# Build the application
bun run build

# Start production server
bun run start
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server with Turbopack |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Bun](https://bun.sh) - Fast JavaScript runtime

---

Built with ❤️ by the SteakHouse team
