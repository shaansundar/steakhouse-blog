/**
 * API Route: Get View Count for a Blog Post
 * 
 * Returns the view count for a specific blog post slug.
 * This endpoint can be called from client components.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPageViewStats } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const stats = await getPageViewStats(slug);

    return NextResponse.json(
      { 
        slug, 
        views: stats.views,
        crawlers_viewed: stats.crawlers_viewed,
        human_views: stats.human_views,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching view count:", error);
    return NextResponse.json(
      { error: "Failed to fetch view count" },
      { status: 500 }
    );
  }
}

