import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "@/components/newsletter-form";
import { HomepageFAQ } from "@/components/homepage-faq";
import {
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const popularTags = [
  "GEO",
  "AI Discovery",
  "SEO",
  "Content Strategy",
  "Technical SEO",
  "Structured Data",
];

const essentialReads = [
  {
    href: "/blog/what-is-generative-engine-optimization",
    title: "What is GEO?",
    description: "The complete guide to Generative Engine Optimization",
  },
  {
    href: "/blog/semantic-html-for-ai-crawlers",
    title: "Semantic HTML Guide",
    description: "Structure content for AI comprehension",
  },
  {
    href: "/blog/structured-data-for-ai-discoverability",
    title: "JSON-LD Best Practices",
    description: "Help AI systems understand your content",
  },
];

const benefits = [
  "AI-optimized content analysis",
  "Real-time GEO scoring",
  "Automated structured data",
  "Crawler visibility tracking",
];

export function Sidebar() {
  return (
    <aside className="space-y-6">
      {/* About SteakHouse */}
      <Card className="overflow-hidden bg-linear-to-br h-full from-primary/10 via-primary/5 to-transparent">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 size-10 flex items-center justify-center rounded-lg">
              <span className="text-2xl">🥩</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">SteakHouse</h2>
              <p className="text-sm text-muted-foreground">
                AI Content Optimization
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            SteakHouse helps content teams optimize for AI discovery. Get your
            content cited by ChatGPT, Claude, Perplexity, and other AI systems
            through automated GEO optimization.
          </p>
          <Button asChild className="w-full font-semibold">
            <a
              href="https://trysteakhouse.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </Card>
      <HomepageFAQ />
      {/* Why SteakHouse */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            Why SteakHouse?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Essential Reads */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Start Here
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {essentialReads.map((read) => (
              <Link
                key={read.href}
                href={read.href}
                className="block group"
              >
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {read.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {read.description}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO/GEO Analytics FAQ - Only visible on homepage */}

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Popular Topics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
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

      {/* Newsletter */}
      <Card className="bg-gradient-to-br from-muted/50 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Stay Updated</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Get the latest GEO insights and AI content strategies delivered to
            your inbox.
          </p>
          <NewsletterForm />
          <p className="text-xs text-muted-foreground mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}

