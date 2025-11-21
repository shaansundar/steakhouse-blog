# Quick Start Guide

## 🚀 Get Running in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 3. Add Your First Post

Create `content/posts/my-first-post.md`:

```markdown
---
title: "My First GEO-Optimized Post"
description: "An example blog post with proper GEO optimization"
slug: "my-first-post"
publishedAt: "2025-11-21"
updatedAt: "2025-11-21"
author:
  name: "Your Name"
  url: "https://yourwebsite.com"
tags:
  - "Getting Started"
  - "Tutorial"
faq:
  - question: "What makes this blog special?"
    answer: "It's optimized for AI discovery using semantic HTML, structured data, and GEO best practices."
---

# Welcome to My Blog

This is your first post. Write your content here using Markdown.

## Key Features

* Server-side rendering
* Semantic HTML
* JSON-LD structured data
* AI crawler friendly

Your content will automatically appear on the homepage and blog index.
```

Save the file and refresh your browser - your post is live!

## 📝 Essential Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Preview production build
npm run lint     # Run ESLint
```

## 🎯 Next Steps

1. **Customize the site**
   - Edit `lib/structured-data.ts` to change site name/URL
   - Modify `app/globals.css` for styling
   - Update `app/layout.tsx` for navigation

2. **Add more posts**
   - Create `.md` files in `content/posts/`
   - Use the frontmatter template above
   - Build and deploy

3. **Verify GEO optimization**
   - Disable JavaScript - confirm content visible
   - View page source - check for JSON-LD
   - Visit `/robots.txt` and `/sitemap.xml`

4. **Deploy**
   - Push to GitHub
   - Connect to Vercel/Netlify
   - Set `NEXT_PUBLIC_SITE_URL` env var

## 📚 Learn More

- **README.md** - Complete usage guide
- **ARCHITECTURE.md** - Technical details
- **VERIFICATION.md** - Testing checklist
- **PROJECT_SUMMARY.md** - Overview

## 🆘 Troubleshooting

**Issue**: Posts not showing
- **Check**: Files are in `content/posts/`
- **Check**: Frontmatter is valid YAML
- **Check**: Slug matches filename

**Issue**: Build fails
- **Check**: All frontmatter fields are present
- **Check**: Dates are in YYYY-MM-DD format
- **Check**: No syntax errors in markdown

**Issue**: Content not visible without JS
- **Check**: Using `npm run build` (not just dev)
- **Check**: Not using client-side data fetching
- **Check**: All content is server-rendered

## ✨ That's It!

You now have a fully functional, GEO-optimized blog ready for AI discovery.

Happy blogging! 🎉

