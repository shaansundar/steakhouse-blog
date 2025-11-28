import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import { getAuthorName, isSteakhouseAgent } from "@/lib/posts";

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card
        className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
          featured
            ? "bg-gradient-to-br from-primary/5 via-background to-accent/5"
            : "hover:bg-muted/30"
        }`}
      >
        <CardHeader className={featured ? "pb-2" : "pb-3"}>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h2
            className={`font-bold leading-tight tracking-tight group-hover:text-primary transition-colors ${
              featured ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"
            }`}
          >
            {post.title}
          </h2>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Excerpt */}
          <p
            className={`text-muted-foreground leading-relaxed mb-4 ${
              featured ? "text-base" : "text-sm line-clamp-2"
            }`}
          >
            {post.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {isSteakhouseAgent(post.author) ? (
                <span className="text-base">🥩</span>
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>{getAuthorName(post.author)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt}>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

