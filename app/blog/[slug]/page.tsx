import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getPostBySlug, getAllPosts, extractHeadings, extractFAQs } from "@/lib/posts";
import { detectCrawler } from "@/lib/userAgent";
import { incrementPageView, getPageViewStats } from "@/lib/supabaseServer";
import {
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  renderJsonLd,
} from "@/lib/structured-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ViewCount } from "@/components/view-count";
import { CrawlerStats } from "@/components/crawler-stats";
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ArrowRight,
  ListTree,
} from "lucide-react";

// Force SSR - no static generation
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  // Ensure meta description is optimal length (120-160 chars)
  let metaDescription = post.excerpt;
  if (metaDescription.length < 120) {
    // Extend with more context if too short
    metaDescription = `${post.excerpt} Learn more about ${post.tags[0] || 'content optimization'} and discover best practices.`;
  }
  if (metaDescription.length > 160) {
    // Truncate to 160 chars at word boundary
    metaDescription = metaDescription.substring(0, 157).trim() + '...';
  }

  // Optimize title for SEO (aim for 50-60 characters total)
  // Layout template adds " | SteakHouse Blog" (18 chars), so base title should be ~40 chars max
  let seoTitle = post.title;
  const MAX_BASE_TITLE_LENGTH = 40; // 40 + 18 (template) = 58 chars total
  if (seoTitle.length > MAX_BASE_TITLE_LENGTH) {
    // Truncate at word boundary, keeping core meaning
    const words = seoTitle.split(' ');
    let truncated = '';
    for (const word of words) {
      if ((truncated + ' ' + word).trim().length <= MAX_BASE_TITLE_LENGTH) {
        truncated = (truncated + ' ' + word).trim();
      } else {
        break;
      }
    }
    seoTitle = truncated || seoTitle.substring(0, MAX_BASE_TITLE_LENGTH);
  }

  return {
    title: seoTitle,
    description: metaDescription,
    authors: [{ name: post.author }],
    // Preload fonts for faster LCP
    other: {
      "font-display": "optional",
    },
    openGraph: {
      title: post.title,
      description: metaDescription,
      url: postUrl,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      images: post.ogImage
        ? [{ url: post.ogImage, width: 1200, height: 630, alt: post.title }]
        : [{ url: "/og-default.png", width: 1200, height: 630, alt: post.title }],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: metaDescription,
      images: post.ogImage ? [post.ogImage] : ["/og-default.png"],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get request headers for crawler detection and view tracking
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const crawlerInfo = detectCrawler(userAgent);

  // Track page view server-side (non-blocking for faster LCP)
  // Fire and forget - don't await to avoid blocking render
  incrementPageView({
    slug: post.slug,
    isCrawler: crawlerInfo.isCrawler,
  }).catch((err) => {
    // Silently fail - analytics shouldn't block rendering
    console.error("Failed to increment page view:", err);
  });

  // Get current view stats (non-blocking - fetch in parallel)
  const viewStatsPromise = getPageViewStats(post.slug).catch(() => ({
    views: 0,
    crawlers_viewed: 0,
  }));

  // Extract headings for table of contents
  const headings = extractHeadings(post.rawContent);
  
  // Extract FAQs from content
  const faqs = extractFAQs(post.rawContent);

  // Get related posts (same tags, different slug)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        p.tags.some((tag) => post.tags.includes(tag))
    )
    .slice(0, 3);

  // Format dates
  const formattedPublishedDate = new Date(post.publishedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const formattedUpdatedDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Generate structured data
  const blogPostingSchema = generateBlogPostingSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);
  
  // Generate FAQ schema if FAQs exist
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
  
  // Combine all schemas
  const structuredDataSchemas = [
    blogPostingSchema,
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : []),
  ];

  // Await view stats (non-blocking promise)
  const viewStats = await viewStatsPromise;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderJsonLd(structuredDataSchemas),
        }}
      />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </li>
            <li key="separator-1" aria-hidden="true">/</li>
            <li>
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </li>
            <li key="separator-2" aria-hidden="true">/</li>
            <li className="text-foreground truncate max-w-[200px]">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Header */}
            <header className="mb-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title - Optimized for LCP with system font fallback */}
              <h1 
                className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 leading-tight"
                style={{
                  fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg lg:text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt}>{formattedPublishedDate}</time>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime}</span>
                </div>
                {viewStats.views > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <ViewCount slug={post.slug} initialViews={viewStats.views} showCrawlers />
                  </>
                )}
                {viewStats.crawlers_viewed >= 0 && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    
                  </>
                )}
              </div>

              {formattedUpdatedDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated: {formattedUpdatedDate}
                </p>
              )}
            </header>

            <Separator className="mb-8" />

            {/* Article Body */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Separator className="my-12" />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section aria-labelledby="related-heading">
                <h2
                  id="related-heading"
                  className="text-2xl font-bold mb-6"
                >
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="group block"
                    >
                      <Card className="h-full hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {related.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back Link */}
            <div className="mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to all articles
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ListTree className="h-5 w-5 text-primary" />
                      Table of Contents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav aria-label="Table of contents">
                      <ul className="space-y-2 text-sm">
                        {headings.map((heading) => (
                          <li
                            key={heading.id}
                            style={{
                              paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                            }}
                          >
                            <a
                              href={`#${heading.id}`}
                              className="text-muted-foreground hover:text-foreground transition-colors block py-1"
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </CardContent>
                </Card>
              )}

              {/* Crawler Statistics */}
              <CrawlerStats slug={post.slug} />

              {/* SteakHouse CTA */}
              <Card className="overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 size-10 flex items-center justify-center rounded-lg">
                      <span className="text-2xl">🥩</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Optimize with SteakHouse</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Want to ensure your content is optimized for AI discovery?
                    SteakHouse automatically analyzes and enhances your content
                    for GEO.
                  </p>
                  <Button asChild className="w-full font-semibold">
                    <a
                      href="https://trysteakhouse.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Try SteakHouse <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

