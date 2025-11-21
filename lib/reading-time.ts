/**
 * Calculate estimated reading time for content
 * @param content - Text content to calculate reading time for
 * @param wordsPerMinute - Average reading speed (default: 200 words per minute)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  // Remove HTML tags and count words
  const textContent = content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Format reading time as ISO 8601 duration (e.g., "PT5M" for 5 minutes)
 * @param minutes - Reading time in minutes
 * @returns ISO 8601 duration string
 */
export function formatReadingTimeDuration(minutes: number): string {
  return `PT${minutes}M`;
}

