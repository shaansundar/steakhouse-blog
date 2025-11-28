"use client";

import { useEffect, useState } from "react";
import { Bot, Eye, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CrawlerStats {
  views: number;
  crawlers_viewed: number;
  human_views: number;
}

interface CrawlerStatsProps {
  slug: string;
}

/**
 * CrawlerStats Component
 * 
 * Displays detailed view statistics including crawler/bot views.
 * Shows breakdown of total views, crawler views, and human views.
 */
export function CrawlerStats({ slug }: CrawlerStatsProps) {
  const [stats, setStats] = useState<CrawlerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/views/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            views: data.views || 0,
            crawlers_viewed: data.crawlers_viewed || 0,
            human_views: data.human_views || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching crawler stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [slug]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">View Statistics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  // Always show stats card, even if views are 0 (to display 0 crawler views)

  const crawlerPercentage = stats.views > 0 
    ? Math.round((stats.crawlers_viewed / stats.views) * 100) 
    : 0;
  const humanPercentage = stats.views > 0 
    ? Math.round((stats.human_views / stats.views) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-5 w-5 text-primary" />
          View Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Total Views */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Total Views</span>
            <span className="text-sm font-bold">{stats.views.toLocaleString()}</span>
          </div>
        </div>

        {/* Human Views */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Human Views</span>
            </div>
            <span className="text-sm font-semibold">
              {stats.human_views.toLocaleString()} ({humanPercentage}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-1">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${humanPercentage}%` }}
            />
          </div>
        </div>

        {/* Crawler Views - Always show, even if 0 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Crawler/Bot Views</span>
            </div>
            <span className="text-sm font-semibold">
              {stats.crawlers_viewed.toLocaleString()} ({crawlerPercentage}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-1">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${crawlerPercentage}%` }}
            />
          </div>
        </div>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          Crawler views include AI bots (GPTBot, ClaudeBot, etc.) and search engine crawlers.
        </p>
      </CardContent>
    </Card>
  );
}

