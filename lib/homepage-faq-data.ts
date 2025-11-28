/**
 * Homepage FAQ Data
 * 
 * SEO/GEO Analytics FAQ questions and answers for the homepage.
 * This data is used both in the client component and for structured data generation.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const homepageFAQData: FAQItem[] = [
  {
    question: "What is Generative Engine Optimization (GEO) and how does it differ from traditional SEO?",
    answer: "Generative Engine Optimization (GEO) is the practice of optimizing content specifically for AI systems like ChatGPT, Claude, and Perplexity. While traditional SEO focuses on ranking in search engine results pages, GEO focuses on being cited, referenced, and included in AI-generated answers. GEO requires semantic clarity, structured data, and content that AI systems can easily parse and understand.",
  },
  {
    question: "How do I track if AI crawlers are visiting my website?",
    answer: "You can track AI crawler visits by monitoring user-agent strings for bots like GPTBot, ClaudeBot, Google-Extended, PerplexityBot, and CCBot. SteakHouse provides automated crawler detection and analytics, showing you which AI systems are accessing your content, how often, and which pages they're viewing. This visibility helps you understand your content's AI discoverability.",
  },
  {
    question: "What metrics should I track for GEO success?",
    answer: "Key GEO metrics include: AI crawler visit frequency, citation rate in AI responses, structured data coverage, semantic HTML usage, content readability scores, and AI system visibility. Unlike SEO metrics focused on rankings and clicks, GEO metrics measure how often your content is referenced by AI systems and how well AI crawlers can understand your content.",
  },
  {
    question: "Does structured data (JSON-LD) improve AI discoverability?",
    answer: "Yes, structured data significantly improves AI discoverability. JSON-LD schemas like Article, FAQPage, Organization, and HowTo provide machine-readable context that helps AI systems understand your content's meaning, relationships, and authority. AI crawlers use structured data to better parse and cite your content in their responses.",
  },
  {
    question: "How can I measure my content's GEO performance?",
    answer: "Measure GEO performance by tracking: (1) AI crawler analytics showing which bots visit your site, (2) citation tracking to see if your content appears in AI responses, (3) structured data validation to ensure proper markup, (4) content readability scores for AI comprehension, and (5) semantic HTML coverage. SteakHouse automates these measurements with real-time GEO scoring.",
  },
  {
    question: "What is the difference between GEO and AEO (Answer Engine Optimization)?",
    answer: "GEO (Generative Engine Optimization) is the broader practice of optimizing for AI systems, while AEO (Answer Engine Optimization) specifically focuses on optimizing content to appear in direct answer boxes and featured snippets in AI responses. AEO is a subset of GEO that emphasizes concise, direct answers to common questions.",
  },
  {
    question: "How often do AI crawlers visit websites?",
    answer: "AI crawler visit frequency varies by system and content type. GPTBot, ClaudeBot, and Google-Extended typically crawl popular, frequently-updated content more often. New content may be crawled within days or weeks. Factors affecting crawl frequency include content freshness, site authority, structured data presence, and how often your content is referenced.",
  },
  {
    question: "Can I optimize existing content for GEO, or do I need to create new content?",
    answer: "You can optimize existing content for GEO by: adding structured data (JSON-LD), improving semantic HTML structure, adding FAQ sections, creating clear TL;DR summaries, ensuring proper heading hierarchy, and enhancing content clarity. SteakHouse can analyze your existing content and provide specific optimization recommendations without requiring complete rewrites.",
  },
];

