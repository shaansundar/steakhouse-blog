/**
 * Loops Email Marketing Integration
 * 
 * Configuration and utilities for Loops.so email marketing platform.
 * 
 * Setup:
 * 1. Get your API key from https://app.loops.so/settings/api
 * 2. Add LOOPS_API_KEY to your .env file:
 *    LOOPS_API_KEY=your_api_key_here
 * 
 * The API route handles:
 * - Subscribing users to your Loops contact list
 * - Tagging subscribers with source information
 * - Handling duplicate subscriptions gracefully
 * - Error handling and validation
 */

export const LOOPS_CONFIG = {
  apiUrl: "https://app.loops.so/api/v1",
  defaultUserGroup: "blog-subscribers",
  defaultSource: "blog-sidebar",
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

