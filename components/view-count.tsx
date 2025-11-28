"use client";

import { useEffect, useState } from "react";
import { Eye, Bot } from "lucide-react";

interface ViewStats {
  views: number;
  crawlers_viewed: number;
  human_views: number;
}

interface ViewCountProps {
  slug: string;
  className?: string;
  initialViews?: number;
  showCrawlers?: boolean;
}

/**
 * ViewCount Component
 * 
 * Displays the view count for a blog post.
 * Optionally shows crawler/bot view counts.
 * Uses initialViews if provided (from SSR), otherwise fetches from API.
 */
export function ViewCount({ 
  slug, 
  className = "", 
  initialViews,
  showCrawlers = false,
}: ViewCountProps) {
  const [stats, setStats] = useState<ViewStats | null>(
    initialViews !== undefined 
      ? { views: initialViews, crawlers_viewed: 0, human_views: initialViews }
      : null
  );
  const [isLoading, setIsLoading] = useState(initialViews === undefined);

  useEffect(() => {
    async function fetchViews() {
      try {
        const response = await fetch(`/api/views/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            views: data.views || 0,
            crawlers_viewed: data.crawlers_viewed || 0,
            human_views: data.human_views || 0,
          });
        } else {
          setStats((prev) => prev || { views: 0, crawlers_viewed: 0, human_views: 0 });
        }
      } catch (error) {
        console.error("Error fetching view count:", error);
        setStats((prev) => prev || { views: 0, crawlers_viewed: 0, human_views: 0 });
      } finally {
        setIsLoading(false);
      }
    }

    // If we have initialViews from SSR, use that and optionally refresh after delay
    if (initialViews !== undefined) {
      setIsLoading(false);
      // Optionally refresh the count after a delay to get updated count
      const timer = setTimeout(() => {
        fetchViews();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // No initial views, fetch immediately
      fetchViews();
    }
  }, [slug, initialViews]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}>
        <Eye className="h-4 w-4 animate-pulse" />
        <span>...</span>
      </div>
    );
  }

  if (!stats || stats.views === 0) {
    return null;
  }

  const formattedViews = stats.views.toLocaleString();
  const formattedCrawlers = stats.crawlers_viewed.toLocaleString();
  const formattedHumans = stats.human_views.toLocaleString();

  return (
    <div className={`flex text-sm gap-8 text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1.5">
        <Eye className="size-4" />
        <span>{formattedViews} {stats.views === 1 ? "View" : "Views"}</span>
      </div>
      {showCrawlers && stats.crawlers_viewed >= 0 && (
        <div className="flex items-center gap-1.5 text-sm">
          <Bot className="size-4" />
          <span>
            {formattedCrawlers} {stats.crawlers_viewed === 1 ? "Crawler" : "Crawlers"}
          </span>
        </div>
      )}
    </div>
  );
}

