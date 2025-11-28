"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    rating: number;
    count: number;
  }[];
}

interface ArticleRatingProps {
  slug: string;
  initialStats?: RatingStats | null;
}

export function ArticleRating({ slug, initialStats }: ArticleRatingProps) {
  const [stats, setStats] = useState<RatingStats | null>(initialStats || null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialStats);

  // Fetch stats on mount if not provided
  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [slug]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ratings/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (isSubmitting || hasRated) return;

    setIsSubmitting(true);
    setSelectedRating(rating);

    try {
      const response = await fetch(`/api/ratings/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setHasRated(true);
        setSelectedRating(null);
      } else {
        const error = await response.json();
        console.error("Error submitting rating:", error);
        setSelectedRating(null);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || selectedRating || stats?.average_rating || 0;
  const totalRatings = stats?.total_ratings || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Rate this article</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Rating Display */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5 transition-colors",
                      star <= Math.round(displayRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">
                  {stats?.average_rating.toFixed(1) || "0.0"}
                </span>
                {totalRatings > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {totalRatings.toLocaleString()} {totalRatings === 1 ? "review" : "reviews"}
                  </span>
                )}
              </div>
            </div>

            {/* Rating Input */}
            {!hasRated && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {hoveredRating
                    ? `Rate ${hoveredRating} ${hoveredRating === 1 ? "star" : "stars"}`
                    : selectedRating
                    ? `Submitting ${selectedRating} ${selectedRating === 1 ? "star" : "stars"}...`
                    : "Click to rate"}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      disabled={isSubmitting}
                      className={cn(
                        "transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50",
                        isSubmitting && "cursor-wait"
                      )}
                      aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
                    >
                      {isSubmitting && selectedRating === star ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Star
                          className={cn(
                            "h-6 w-6 transition-colors",
                            star <= (hoveredRating || selectedRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted-foreground hover:fill-yellow-200 hover:text-yellow-200"
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasRated && (
              <p className="text-sm text-muted-foreground">
                Thank you for your rating!
              </p>
            )}

            {/* Rating Distribution (Optional - can be hidden if not needed) */}
            {stats && stats.total_ratings > 0 && (
              <div className="pt-2 border-t space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.rating_distribution.find((r) => r.rating === rating)?.count || 0;
                  const percentage = stats.total_ratings > 0 ? (count / stats.total_ratings) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-muted-foreground">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

