/**
 * Loops Email Marketing Integration
 * 
 * Configuration and utilities for Loops.so email marketing platform.
 * Uses the official Loops JavaScript SDK (@loops/loops).
 * 
 * Setup:
 * 1. Get your API key from https://app.loops.so/settings/api
 * 2. Add LOOPS_API_KEY to your .env file:
 *    LOOPS_API_KEY=your_api_key_here
 * 3. Create a "newsletter_subscription" event in your Loops dashboard
 *    (Settings → Events → Create Event)
 * 
 * The API route handles:
 * - Adding contacts to your Loops audience
 * - Sending "newsletter_subscription" event
 * - Tagging contacts with source information
 * - Handling duplicate contacts gracefully
 * - Error handling and validation
 */

export const LOOPS_CONFIG = {
  defaultSource: "blog-sidebar",
  eventName: "newsletter_subscription",
} as const;

/**
 * Subscribe a user to Loops
 * This is handled server-side via the API route for security
 */
export async function subscribeToLoops(email: string, source?: string) {
  const response = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      source: source || LOOPS_CONFIG.defaultSource,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to subscribe");
  }

  return response.json();
}

