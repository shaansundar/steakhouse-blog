import { NextRequest, NextResponse } from "next/server";
import { submitRating, getRatingStats } from "@/lib/supabaseServer";

/**
 * GET /api/ratings/[slug]
 * Get rating statistics for a specific article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  try {
    const stats = await getRatingStats(slug);

    if (!stats) {
      return NextResponse.json(
        {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: [
            { rating: 1, count: 0 },
            { rating: 2, count: 0 },
            { rating: 3, count: 0 },
            { rating: 4, count: 0 },
            { rating: 5, count: 0 },
          ],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching rating stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch rating stats" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings/[slug]
 * Submit a rating for an article
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { rating } = body;

    if (!rating || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Rating is required and must be a number" },
        { status: 400 }
      );
    }

    // Get user IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const userIp = forwardedFor?.split(",")[0] || realIp || undefined;

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await submitRating({
      slug,
      rating,
      userIp,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit rating" },
        { status: 400 }
      );
    }

    // Return updated stats
    const stats = await getRatingStats(slug);

    return NextResponse.json(
      {
        success: true,
        stats: stats || {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

