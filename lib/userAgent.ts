/**
 * User Agent Detection
 * 
 * Detects whether a request comes from a crawler/bot,
 * including AI crawlers used by LLMs.
 */

// List of known crawlers including AI/LLM crawlers
const CRAWLER_PATTERNS: { pattern: string; name: string }[] = [
  // Traditional search engine crawlers
  { pattern: 'googlebot', name: 'Googlebot' },
  { pattern: 'bingbot', name: 'Bingbot' },
  { pattern: 'yandexbot', name: 'YandexBot' },
  { pattern: 'duckduckbot', name: 'DuckDuckBot' },
  { pattern: 'baiduspider', name: 'Baiduspider' },
  { pattern: 'slurp', name: 'Yahoo Slurp' },
  
  // AI/LLM crawlers
  { pattern: 'gptbot', name: 'GPTBot' },
  { pattern: 'chatgpt-user', name: 'ChatGPT-User' },
  { pattern: 'google-extended', name: 'Google-Extended' },
  { pattern: 'ccbot', name: 'CCBot' },
  { pattern: 'claudebot', name: 'ClaudeBot' },
  { pattern: 'claude-web', name: 'Claude-Web' },
  { pattern: 'anthropic-ai', name: 'Anthropic-AI' },
  { pattern: 'meta-externalagent', name: 'Meta-ExternalAgent' },
  { pattern: 'meta-externalfetcher', name: 'Meta-ExternalFetcher' },
  { pattern: 'cohere-ai', name: 'Cohere-AI' },
  { pattern: 'perplexitybot', name: 'PerplexityBot' },
  { pattern: 'applebot', name: 'Applebot' },
  { pattern: 'bytespider', name: 'Bytespider' },
  { pattern: 'petalbot', name: 'PetalBot' },
  
  // Other common bots
  { pattern: 'semrushbot', name: 'SEMrushBot' },
  { pattern: 'ahrefsbot', name: 'AhrefsBot' },
  { pattern: 'mj12bot', name: 'Majestic Bot' },
  { pattern: 'dotbot', name: 'DotBot' },
  { pattern: 'rogerbot', name: 'Rogerbot' },
  { pattern: 'seznambot', name: 'SeznamBot' },
  { pattern: 'archive.org_bot', name: 'Internet Archive Bot' },
  { pattern: 'ia_archiver', name: 'IA Archiver' },
  
  // Generic bot patterns (check last)
  { pattern: 'bot', name: 'Generic Bot' },
  { pattern: 'spider', name: 'Generic Spider' },
  { pattern: 'crawler', name: 'Generic Crawler' },
  { pattern: 'scraper', name: 'Generic Scraper' },
];

export interface CrawlerInfo {
  isCrawler: boolean;
  crawlerName: string | null;
  isAiCrawler: boolean;
}

// AI crawler patterns for specific detection
const AI_CRAWLER_PATTERNS = [
  'gptbot',
  'chatgpt-user',
  'google-extended',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'meta-externalagent',
  'meta-externalfetcher',
  'cohere-ai',
  'perplexitybot',
  'ccbot',
];

/**
 * Detect if a user agent string belongs to a crawler
 */
export function detectCrawler(userAgent: string | null): CrawlerInfo {
  if (!userAgent) {
    return {
      isCrawler: false,
      crawlerName: null,
      isAiCrawler: false,
    };
  }

  const lowerUA = userAgent.toLowerCase();

  // Check against known patterns
  for (const { pattern, name } of CRAWLER_PATTERNS) {
    if (lowerUA.includes(pattern)) {
      const isAiCrawler = AI_CRAWLER_PATTERNS.some((p) => lowerUA.includes(p));
      return {
        isCrawler: true,
        crawlerName: name,
        isAiCrawler,
      };
    }
  }

  return {
    isCrawler: false,
    crawlerName: null,
    isAiCrawler: false,
  };
}

/**
 * Simple check if request is from a crawler
 */
export function isCrawler(userAgent: string | null): boolean {
  return detectCrawler(userAgent).isCrawler;
}

/**
 * Check if request is from an AI/LLM crawler
 */
export function isAiCrawler(userAgent: string | null): boolean {
  return detectCrawler(userAgent).isAiCrawler;
}

