import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { TOPIC_CLUSTERS, TopicClusterId } from "@/lib/content/topics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Code, Workflow, TrendingUp } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.trysteakhouse.com";

export const metadata: Metadata = {
  title: "GEO Knowledge Hub",
  description: "Comprehensive guide to Generative Engine Optimization (GEO). Learn how to make your content discoverable by AI systems like ChatGPT, Claude, and Google AI Overviews.",
  alternates: {
    canonical: `${SITE_URL}/geo-hub`,
  },
  openGraph: {
    title: "GEO Knowledge Hub",
    description: "Comprehensive guide to Generative Engine Optimization (GEO)",
    url: `${SITE_URL}/geo-hub`,
    type: "website",
  },
};

const topicIcons: Record<TopicClusterId, typeof BookOpen> = {
  fundamentals: BookOpen,
  implementation: Code,
  workflows: Workflow,
  advanced: TrendingUp,
};

export default function GeoHubPage() {
  const allPosts = getAllPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          GEO Knowledge Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Your comprehensive guide to Generative Engine Optimization (GEO). 
          Learn how to make your content discoverable by AI systems like ChatGPT, Claude, and Google AI Overviews.
        </p>
      </header>

      {/* Topic Clusters */}
      <div className="space-y-12">
        {Object.values(TOPIC_CLUSTERS).map((cluster) => {
          const Icon = topicIcons[cluster.id];
          const posts = allPosts.filter((post) => cluster.slug.includes(post.slug));

          return (
            <section key={cluster.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl lg:text-3xl font-bold">{cluster.name}</h2>
              </div>
              <p className="text-muted-foreground text-lg">{cluster.description}</p>

              {/* Posts Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {posts.map((post) => (
                  <Card key={post.slug} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 mb-4">
                        {post.tldr || post.description}
                      </CardDescription>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Read more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA Section */}
      <section className="mt-16 p-8 bg-muted/30 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4">Ready to optimize your content for AI?</h2>
        <p className="text-muted-foreground mb-6">
          SteakHouse helps you automate GEO-optimized content at scale. 
          Transform your brand data into AI-discoverable articles.
        </p>
        <Link
          href="https://trysteakhouse.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Learn more about SteakHouse <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

