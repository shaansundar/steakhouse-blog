import { PostMetadata, FAQ } from './posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://steakhouse-test.nimbushq.xyz';
const SITE_NAME = 'GEO Optimized Blog';

/**
 * Generate JSON-LD for a blog post
 */
export function generateBlogPostingSchema(metadata: PostMetadata) {
  return {
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
  };
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

