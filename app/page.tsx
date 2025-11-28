import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Sidebar } from "@/components/sidebar";
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateBlogListSchema,
  renderJsonLd,
} from "@/lib/structured-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";

export const metadata: Metadata = {
  title: "SteakHouse Blog | Master GEO & AI Content Optimization",
  description:
    "Learn how to optimize your content for AI discovery. Expert guides on Generative Engine Optimization (GEO), semantic HTML, structured data, and making content visible to ChatGPT, Claude, and other AI systems.",
  openGraph: {
    title: "SteakHouse Blog | Master GEO & AI Content Optimization",
    description:
      "Expert guides on making your content discoverable by AI systems.",
    url: SITE_URL,
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function HomePage() {
  // Fetch all posts server-side
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  // Generate structured data
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();
  const blogListSchema = generateBlogListSchema(posts);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderJsonLd([websiteSchema, organizationSchema, blogListSchema]),
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Section */}
        <header className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4">
            The SteakHouse Blog
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert insights on{" "}
            <strong className="text-foreground">
              Generative Engine Optimization
            </strong>
            , AI content strategy, and making your content discoverable by AI
            systems.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Blog Posts - Bento Grid */}
          <section className="lg:col-span-8" aria-label="Blog posts">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No posts yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Featured Post */}
                {featuredPost && (
                  <div className="mb-8">
                    <h2 className="sr-only">Featured Post</h2>
                    <PostCard post={featuredPost} featured />
                  </div>
                )}

                {/* Recent Posts Grid */}
                {recentPosts.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      Recent Posts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recentPosts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Sidebar />
            </div>
          </div>
        </div>

        {/* About Section (for SEO/GEO) */}
        <section
          id="about"
          className="mt-16 lg:mt-24 pt-12 border-t"
          aria-labelledby="about-heading"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 id="about-heading" className="text-3xl font-bold mb-6">
              About SteakHouse
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-base leading-relaxed mb-4">
                SteakHouse is an AI content optimization platform that helps
                content teams prepare for the future of search. As AI systems
                like ChatGPT, Claude, and Perplexity become primary information
                sources, traditional SEO alone isn&apos;t enough.
              </p>
              <p className="text-base leading-relaxed mb-4">
                Our platform automates Generative Engine Optimization (GEO) by
                analyzing your content for AI readability, generating optimized
                structured data, and tracking how AI crawlers interact with your
                site.
              </p>
              <p className="text-base leading-relaxed">
                Whether you&apos;re a solo creator or enterprise content team,
                SteakHouse gives you the tools to ensure your content gets
                discovered, understood, and cited by AI systems.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
