import { PostMetadata, FAQ } from './posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const SITE_NAME = 'GEO Optimized Blog';

/**
 * Generate JSON-LD for a blog post
 */
export function generateBlogPostingSchema(metadata: PostMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
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
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${metadata.slug}`,
    },
    keywords: metadata.tags.join(', '),
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
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'A blog optimized for Generative AI Engine Optimization (GEO) and SEO',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Generate JSON-LD for the organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'A blog optimized for Generative AI Engine Optimization (GEO) and SEO',
    sameAs: [
      'https://twitter.com/example',
      'https://linkedin.com/company/example',
      'https://github.com/example',
    ],
  };
}

