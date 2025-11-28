import { NextRequest, NextResponse } from "next/server";

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_API_URL = "https://app.loops.so/api/v1/contacts/create";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SubscribeRequest {
  email: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email, source = "blog" } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if Loops API key is configured
    if (!LOOPS_API_KEY) {
      console.error("LOOPS_API_KEY is not configured");
      // In development, return success to allow testing
      if (process.env.NODE_ENV === "development") {
        console.warn("Loops API key not set - returning mock success");
        return NextResponse.json(
          { success: true, message: "Subscription successful (mock)" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Newsletter service is not configured" },
        { status: 500 }
      );
    }

    // Subscribe to Loops
    const loopsResponse = await fetch(LOOPS_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        source: source,
        subscribed: true,
        userGroup: "blog-subscribers",
      }),
    });

    if (!loopsResponse.ok) {
      const errorData = await loopsResponse.json().catch(() => ({}));
      console.error("Loops API error:", errorData);
      
      // Handle duplicate email (already subscribed)
      if (loopsResponse.status === 409 || errorData.message?.includes("already exists")) {
        return NextResponse.json(
          { success: true, message: "You're already subscribed!" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Failed to subscribe. Please try again later." },
        { status: loopsResponse.status }
      );
    }

    const data = await loopsResponse.json();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed! Check your email to confirm.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

