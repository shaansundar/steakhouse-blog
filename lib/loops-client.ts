/**
 * Loops Client Singleton
 * 
 * Creates and exports a singleton Loops client instance for use across the application.
 * This ensures we only create one client instance and reuse it.
 */

import { LoopsClient } from "loops";

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;

let loopsClient: LoopsClient | null = null;

/**
 * Get or create the Loops client instance
 */
export function getLoopsClient(): LoopsClient | null {
  if (!LOOPS_API_KEY) {
    return null;
  }

  if (!loopsClient) {
    loopsClient = new LoopsClient(LOOPS_API_KEY);
  }

  return loopsClient;
}

/**
 * Check if Loops is configured
 */
export function isLoopsConfigured(): boolean {
  return !!LOOPS_API_KEY;
}

