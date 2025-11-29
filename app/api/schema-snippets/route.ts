/**
 * API Route: Schema Snippets
 * 
 * Provides machine-readable JSON-LD schema templates.
 * Useful for developers and AI systems that need structured data examples.
 */

import { NextResponse } from "next/server";
import { SCHEMA_SNIPPETS } from "@/lib/resources/schema-snippets";

export async function GET() {
  return NextResponse.json(
    {
      schemas: SCHEMA_SNIPPETS,
      version: "1.0.0",
      documentation: "https://schema.org",
      usage: "These templates use {{variable}} syntax. Replace variables with actual values.",
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}

