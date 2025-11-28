import { NextRequest, NextResponse } from "next/server";
import { getLoopsClient, isLoopsConfigured } from "@/lib/loops-client";
import { APIError } from "loops";

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if Loops API key is configured
    if (!isLoopsConfigured()) {
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

    const loops = getLoopsClient();
    if (!loops) {
      return NextResponse.json(
        { error: "Newsletter service is not configured" },
        { status: 500 }
      );
    }

    try {
      // Step 1: Add contact to audience (create/update contact)
      // Don't auto-subscribe, just add to audience
      await loops.createContact({
        email: normalizedEmail,
        properties: {
          source: source,
          subscribed: false,
        },
      });
    } catch (error) {
      // Handle duplicate email (contact already exists) - this is fine, continue to send event
      if (error instanceof APIError) {
        // Contact already exists (409) or similar - continue to send event
        const errorMessage = typeof error.json === 'object' && error.json !== null && 'message' in error.json
          ? String(error.json.message)
          : '';
        
        if (error.statusCode !== 409 && !errorMessage.includes("already exists")) {
          console.error("Loops contact creation error:", error.json);
          return NextResponse.json(
            { error: "Failed to add to newsletter. Please try again later." },
            { status: error.statusCode || 500 }
          );
        }
      } else {
        console.error("Unexpected error creating contact:", error);
        return NextResponse.json(
          { error: "Failed to add to newsletter. Please try again later." },
          { status: 500 }
        );
      }
    }

    try {
      // Step 2: Send newsletter_subscription event
      await loops.sendEvent({
        email: normalizedEmail,
        eventName: "newsletter_subscription",
      });
    } catch (error) {
      // Even if event fails, contact was added, so log but don't fail
      if (error instanceof APIError) {
        console.warn("Contact added but event failed to send:", error.json);
      } else {
        console.warn("Unexpected error sending event:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed! Check your email to confirm.",
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

