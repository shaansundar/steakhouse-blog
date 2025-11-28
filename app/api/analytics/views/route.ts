/**
 * API Route: Get All View Statistics
 * 
 * Returns view statistics for all blog posts.
 * Useful for admin/analytics dashboards.
 * 
 * Note: This endpoint should be protected in production.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllPageViews } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const pageViews = await getAllPageViews();

    // Calculate totals
    const totals = pageViews.reduce(
      (acc, pv) => ({
        totalViews: acc.totalViews + (pv.views || 0),
        totalCrawlers: acc.totalCrawlers + (pv.crawlers_viewed || 0),
        totalHumans: acc.totalHumans + ((pv.views || 0) - (pv.crawlers_viewed || 0)),
      }),
      { totalViews: 0, totalCrawlers: 0, totalHumans: 0 }
    );

    return NextResponse.json(
      {
        posts: pageViews.map((pv) => ({
          slug: pv.slug,
          views: pv.views || 0,
          crawlers_viewed: pv.crawlers_viewed || 0,
          human_views: (pv.views || 0) - (pv.crawlers_viewed || 0),
          last_viewed_at: pv.last_viewed_at,
        })),
        totals,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

