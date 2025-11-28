import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBlogListSchema, renderJsonLd } from "@/lib/structured-data";
import { ChevronLeft, Tag } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";

export const metadata: Metadata = {
  title: "Blog | All Articles on GEO & AI Content Optimization",
  description:
    "Browse all articles on Generative Engine Optimization, AI discovery, semantic HTML, structured data, and making content visible to AI systems like ChatGPT and Claude.",
  openGraph: {
    title: "Blog | SteakHouse - GEO & AI Content Optimization",
    description:
      "Expert guides on making your content discoverable by AI systems.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const blogListSchema = generateBlogListSchema(posts);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderJsonLd(blogListSchema),
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            All Articles
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Deep dives into GEO, AI content optimization, and the future of
            search. {posts.length} articles to help you master AI discoverability.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Posts Grid */}
          <section className="lg:col-span-8" aria-label="Blog posts">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  No articles yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Tags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-5 w-5 text-primary" />
                    Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
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

              {/* Stats */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {posts.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Articles</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {tags.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Topics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

