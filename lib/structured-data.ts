import { PostMetadata, FAQ } from './posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://steakhouse-test.nimbushq.xyz';
const SITE_NAME = 'GEO Optimized Blog';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`; // Default OpenGraph image

/**
 * Generate JSON-LD for a blog post
 */
export function generateBlogPostingSchema(
  metadata: PostMetadata,
  readingTimeMinutes?: number
) {
  const imageUrl = metadata.image 
    ? (metadata.image.startsWith('http') ? metadata.image : `${SITE_URL}${metadata.image}`)
    : DEFAULT_OG_IMAGE;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': ['BlogPosting', 'Article'],
    headline: metadata.title,
    description: metadata.description,
    datePublished: metadata.publishedAt,
    dateModified: metadata.updatedAt,
    author: {
      '@type': 'Person',
      name: metadata.author.name,
      url: metadata.author.url,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${metadata.slug}`,
    },
    keywords: metadata.tags,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
  };

  // Add reading time if provided (ISO 8601 duration format)
  if (readingTimeMinutes) {
    schema.timeRequired = `PT${readingTimeMinutes}M`;
  }

  return schema;
}

/**
 * Generate JSON-LD for FAQ section
 */
export function generateFAQSchema(faq: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD for the website
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'A blog about Generative AI Engine Optimization (GEO), AI discovery, and making products findable by ChatGPT, Claude, Gemini, and other LLMs.',
        publisher: {
          '@id': `${SITE_URL}#organization`,
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: 'A blog optimized for Generative AI Engine Optimization (GEO) and SEO',
      },
    ],
  };
}

/**
 * Generate JSON-LD for the organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: 'A blog optimized for Generative AI Engine Optimization (GEO) and SEO',
  };
}

/**
 * Generate JSON-LD BreadcrumbList schema
 */
export function generateBreadcrumbListSchema(metadata: PostMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: metadata.title,
        item: `${SITE_URL}/blog/${metadata.slug}`,
      },
    ],
  };
}

/**
 * Generate JSON-LD FAQPage schema for homepage FAQ section
 */
export function generateHomepageFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is this blog about?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Generative AI Engine Optimization (GEO) — helping products become discoverable by AI assistants like ChatGPT, Claude, and Gemini. Learn how to structure your content, implement semantic HTML, use structured data, and optimize for AI crawlers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is it for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Founders, marketers, and developers who want AI models to correctly understand and recommend their products. If you\'re building a product that should be discoverable through conversational AI interfaces, this blog is for you.',
        },
      },
      {
        '@type': 'Question',
        name: 'What will I learn?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Practical guides on semantic HTML, structured data (JSON-LD), AI-friendly content architecture, robots.txt configuration for AI crawlers, and strategies for making your product maximally discoverable by LLMs.',
        },
      },
    ],
  };
}

/**
 * Generate JSON-LD HowTo schema for step-by-step guides
 */
export interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

export function generateHowToSchema(
  steps: HowToStep[],
  name: string,
  description: string,
  baseUrl: string = SITE_URL
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
    })),
  };
}

/**
 * Generate JSON-LD WebPage schema with speakable property
 */
export function generateWebPageSchema(
  metadata: PostMetadata,
  speakableSelectors: string[] = ['#tldr', '.prose', '[aria-labelledby="faq-heading"]']
) {
  const url = `${SITE_URL}/blog/${metadata.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: metadata.title,
    description: metadata.description,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors,
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
    },
  };
}

