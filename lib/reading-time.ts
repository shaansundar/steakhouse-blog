/**
 * Reading Time Calculator
 * 
 * Estimates reading time based on word count.
 * Average reading speed: ~200 words per minute.
 */

const WORDS_PER_MINUTE = 200;

/**
 * Calculate reading time from markdown content
 */
export function calculateReadingTime(content: string): string {
  // Strip markdown formatting for word count
  const plainText = content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove headers markers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  if (minutes < 1) {
    return '1 min read';
  }

  return `${minutes} min read`;
}

/**
 * Get word count from content
 */
export function getWordCount(content: string): number {
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.split(/\s+/).filter(Boolean).length;
}

