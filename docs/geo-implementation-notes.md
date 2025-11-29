# GEO Implementation Notes

This document summarizes the GEO/AEO improvements implemented across the SteakHouse blog infrastructure.

## What Changed

### 1. Sitemap, Robots, and llms.txt Alignment ✅

**Changes:**
- All infrastructure files now use canonical blog domain: `https://blog.trysteakhouse.com`
- Sitemap uses `NEXT_PUBLIC_SITE_URL` environment variable (falls back to blog domain)
- Robots.txt references canonical sitemap URL
- llms.txt references canonical sitemap and domain
- Added GEO Hub page to sitemap

**Files Modified:**
- `app/sitemap.ts` - Simplified to use canonical domain
- `app/robots.ts` - Updated default domain
- `app/llms.txt/route.ts` - Updated domain references
- `app/feed.xml/route.ts` - Updated domain references
- `app/page.tsx` - Updated domain references

**Verification:**
- Check `https://blog.trysteakhouse.com/sitemap.xml` returns valid XML
- Check `https://blog.trysteakhouse.com/robots.txt` references correct sitemap
- Check `https://blog.trysteakhouse.com/llms.txt` references correct domain

### 2. Tl;Dr Snippets ✅

**Changes:**
- Added `tldr` field to `PostMeta` interface
- Posts can now include a `tldr` field in frontmatter (max ~50 words)
- Tl;Dr snippet renders prominently below H1 on blog posts
- Styled with left border and muted background for visibility

**How to Add Tl;Dr:**
Add to post frontmatter:
```yaml
tldr: "Your concise direct-answer snippet here. Max 50 words. This appears right after the H1."
```

**Files Modified:**
- `lib/posts.ts` - Added `tldr` field to `PostMeta` interface and parsing logic
- `app/blog/[slug]/page.tsx` - Added Tl;Dr rendering component

**TODO:**
- Add `tldr` fields to all pillar/high-traffic articles:
  - `what-is-generative-ai-engine-optimization-geo.md`
  - `semantic-html-for-ai-crawlers.md`
  - `structured-data-for-ai-discoverability.md`
  - `structured-data-schema-ai-native-answer-engine.md`
  - `mastering-topical-authority-ai-content-clusters-entity-seo.md`
  - `keywords-to-citations-aeo-ai-search.md`

### 3. FAQPage JSON-LD ✅

**Status:** Already implemented and working correctly.

**How It Works:**
- Posts with `faq` array in frontmatter automatically emit FAQPage JSON-LD
- FAQs are extracted from frontmatter first, then fall back to content parsing
- FAQPage schema is included in structured data alongside BlogPosting schema

**Files:**
- `lib/structured-data.ts` - `generateFAQSchema()` function
- `app/blog/[slug]/page.tsx` - FAQPage JSON-LD emission

**Verification:**
- View page source on posts with FAQs
- Look for `<script type="application/ld+json">` with `@type: "FAQPage"`
- Test with Google Rich Results Test: https://search.google.com/test/rich-results

### 4. Canonical URLs ✅

**Status:** Already implemented correctly.

**How It Works:**
- All blog posts include `<link rel="canonical">` tag
- Canonical URLs use clean slug format: `https://blog.trysteakhouse.com/blog/{slug}`
- No query parameters or tracking codes in canonical URLs

**Files:**
- `app/blog/[slug]/page.tsx` - `generateMetadata()` includes `alternates.canonical`

**Verification:**
- View page source on any blog post
- Check `<head>` for `<link rel="canonical" href="...">`
- Ensure URL matches clean slug format

### 5. Site-Wide JSON-LD ✅

**Changes:**
- Organization schema uses "SteakHouse by NimbusHQ" consistently
- WebSite schema includes search action
- BlogPosting schema includes all required fields
- All schemas use canonical blog domain

**Files:**
- `lib/structured-data.ts` - All schema generators
- `app/page.tsx` - Homepage emits Organization and WebSite schemas
- `app/blog/[slug]/page.tsx` - Each post emits BlogPosting schema

**Verification:**
- View page source on homepage - should see Organization and WebSite JSON-LD
- View page source on blog posts - should see BlogPosting JSON-LD
- Test with Schema.org validator: https://validator.schema.org/

### 6. Topic Clusters & GEO Hub ✅

**Changes:**
- Created `lib/content/topics.ts` with topic cluster definitions
- Created `/geo-hub` page that lists all posts organized by topic cluster
- Topic clusters: Fundamentals, Implementation, Workflows, Advanced
- Added GEO Hub link to main navigation

**Files Created:**
- `lib/content/topics.ts` - Topic cluster configuration
- `app/geo-hub/page.tsx` - GEO Hub page

**How to Use:**
Posts can include `topics` field in frontmatter:
```yaml
topics:
  - "fundamentals"
  - "implementation"
```

**Verification:**
- Visit `https://blog.trysteakhouse.com/geo-hub`
- Verify posts are organized by topic clusters
- Check navigation includes "GEO Hub" link

### 7. Entity Naming Normalization ✅

**Changes:**
- Standardized on "SteakHouse by NimbusHQ" for Organization name
- Updated all JSON-LD schemas to use consistent naming
- Header already shows "SteakHouse by NimbusHQ"

**Files Modified:**
- `lib/structured-data.ts` - All Organization references
- `components/header.tsx` - Already correct

**Verification:**
- Check JSON-LD on any page - Organization name should be "SteakHouse by NimbusHQ"
- Check header logo - should show "SteakHouse by NimbusHQ"

### 8. AI Infrastructure Alignment ✅

**Changes:**
- All AI-facing endpoints use canonical blog domain
- `robots.txt` allows all AI crawlers
- `llms.txt` references canonical domain and sitemap
- Added future enhancement sections to `llms.txt` for pillar URLs and entity index

**Files Modified:**
- `app/robots.ts` - Canonical domain
- `app/llms.txt/route.ts` - Canonical domain and future sections
- `app/sitemap.ts` - Canonical domain

**Verification:**
- Check `robots.txt` allows GPTBot, ClaudeBot, Google-Extended, etc.
- Check `llms.txt` references correct sitemap URL
- Verify all domain references use `NEXT_PUBLIC_SITE_URL` env var

### 9. Long-Term Scaffolding ✅

**Changes:**
- Created `lib/content/case-studies.ts` - Case study content model
- Created `lib/content/playbooks.ts` - Playbook content model
- Created `lib/resources/schema-snippets.ts` - Reusable JSON-LD templates
- Created `/api/schema-snippets` endpoint for machine-readable schema templates
- Added future enhancement sections to `llms.txt`

**Files Created:**
- `lib/content/case-studies.ts` - Case study interface and placeholder
- `lib/content/playbooks.ts` - Playbook interface and placeholder
- `lib/resources/schema-snippets.ts` - JSON-LD template library
- `app/api/schema-snippets/route.ts` - API endpoint for schema snippets

**Next Steps:**
- Create `content/case-studies/` directory when ready to add case studies
- Create `content/playbooks/` directory when ready to add playbooks
- Use schema snippets as templates when creating new structured data

## Environment Variables

Ensure these are set in production:

```bash
NEXT_PUBLIC_SITE_URL=https://blog.trysteakhouse.com
```

## Testing Checklist

- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt` and references sitemap
- [ ] llms.txt accessible at `/llms.txt` and references sitemap
- [ ] GEO Hub accessible at `/geo-hub`
- [ ] Blog posts show Tl;Dr snippets (when `tldr` field is present)
- [ ] Blog posts emit FAQPage JSON-LD (when `faq` field is present)
- [ ] All blog posts have canonical URLs
- [ ] Homepage emits Organization and WebSite JSON-LD
- [ ] Blog posts emit BlogPosting JSON-LD
- [ ] Schema snippets API accessible at `/api/schema-snippets`

## TODOs for Content Team

1. **Add Tl;Dr to Pillar Posts:**
   - Review pillar articles and add `tldr` field to frontmatter
   - Keep Tl;Dr concise (max 50 words)
   - Make it a direct answer to the main question

2. **Add Topics to Posts:**
   - Review posts and add `topics` field to frontmatter
   - Use topic IDs: `fundamentals`, `implementation`, `workflows`, `advanced`
   - Posts can belong to multiple topics

3. **Add Real Case Studies:**
   - Create markdown files in `content/case-studies/` (when ready)
   - Follow `CaseStudyMeta` interface from `lib/content/case-studies.ts`
   - Include before/after metrics for AI citations and AI referral traffic

4. **Add Real Playbooks:**
   - Create markdown files in `content/playbooks/` (when ready)
   - Follow `PlaybookMeta` interface from `lib/content/playbooks.ts`
   - Focus on vertical-specific GEO implementation guides

5. **Expand llms.txt:**
   - Add pillar article URLs to "Pillar Articles" section
   - Add entity index as content grows
   - Document additional API endpoints as they're created

6. **Add High-Trust Citations:**
   - Review data-heavy articles (cost comparisons, trends)
   - Add citation slots for external sources
   - Do NOT fabricate sources - use real, verifiable data

## Notes

- All changes maintain backward compatibility
- No breaking changes to existing content
- New fields (`tldr`, `topics`) are optional
- Canonical URLs were already implemented correctly
- FAQPage JSON-LD was already working correctly

