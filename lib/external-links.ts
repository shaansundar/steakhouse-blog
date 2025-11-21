/**
 * Mapping of terms to their authoritative external links
 * Used for adding inline citations in blog post content
 */
export const EXTERNAL_LINK_MAP: Record<string, { url: string; text?: string }> = {
  'GPTBot': {
    url: 'https://platform.openai.com/docs/gptbot',
    text: 'GPTBot (OpenAI)',
  },
  'ClaudeBot': {
    url: 'https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web',
    text: 'ClaudeBot (Anthropic)',
  },
  'Google-Extended': {
    url: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers',
    text: 'Google-Extended',
  },
  'Schema.org': {
    url: 'https://schema.org/',
    text: 'Schema.org',
  },
  'JSON-LD': {
    url: 'https://json-ld.org/',
    text: 'JSON-LD',
  },
  'Open Graph Protocol': {
    url: 'https://ogp.me/',
    text: 'Open Graph Protocol',
  },
  'robots.txt': {
    url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro',
    text: 'robots.txt specification',
  },
  'OpenAI': {
    url: 'https://platform.openai.com/docs/gptbot',
    text: 'OpenAI',
  },
  'Anthropic': {
    url: 'https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web',
    text: 'Anthropic',
  },
  'Google': {
    url: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers',
    text: 'Google',
  },
};

/**
 * Process HTML content to add external links for specific terms
 * Only links the first occurrence of each term to avoid over-linking
 * Avoids linking terms that are already inside anchor tags
 * @param html - HTML content to process
 * @returns HTML content with external links added
 */
export function addExternalLinks(html: string): string {
  let processedHtml = html;
  const linkedTerms = new Set<string>();

  // Process each term in the link map (order matters - process more specific terms first)
  const sortedTerms = Object.entries(EXTERNAL_LINK_MAP).sort((a, b) => b[0].length - a[0].length);

  for (const [term, linkInfo] of sortedTerms) {
    // Skip if already linked
    if (linkedTerms.has(term)) continue;

    // Create regex pattern to match the term (case-insensitive, whole word)
    // Use negative lookahead/lookbehind to avoid matching inside anchor tags
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(?<!<a[^>]*>)(?<!href="[^"]*">)(?<!>)\\b(${escapedTerm})\\b(?!</a>)(?!<[^>]*>)`,
      'gi'
    );

    // Find first match that's not inside an anchor tag
    let matchFound = false;
    processedHtml = processedHtml.replace(pattern, (match, capturedTerm) => {
      if (matchFound) return match;
      
      // Check if this match is inside an anchor tag by looking backwards
      const matchIndex = processedHtml.indexOf(match);
      const beforeMatch = processedHtml.substring(0, matchIndex);
      const lastOpenTag = beforeMatch.lastIndexOf('<a');
      const lastCloseTag = beforeMatch.lastIndexOf('</a>');
      
      // If there's an open <a> tag before this match and no closing </a> after it, skip
      if (lastOpenTag > lastCloseTag) {
        return match;
      }
      
      matchFound = true;
      const linkText = linkInfo.text || capturedTerm;
      return `<a href="${linkInfo.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${linkText}</a>`;
    });

    if (matchFound) {
      linkedTerms.add(term);
    }
  }

  return processedHtml;
}

