/**
 * Structured Data (JSON-LD) Generators
 * 
 * Creates schema.org compliant JSON-LD for SEO and AI discovery.
 */

import { PostMeta } from './posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trysteakhouse.com';
const SITE_NAME = 'SteakHouse Blog';
const SITE_DESCRIPTION = 'Master GEO, AEO, and AI-driven content optimization with SteakHouse. Expert insights on making your content discoverable by AI systems.';

/**
 * Organization schema for SteakHouse
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SteakHouse',
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      'https://twitter.com/trysteakhouse',
      'https://github.com/nimbushq',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'shaan@nimbushq.xyz',
      contactType: 'customer support',
    },
  };
}

/**
 * WebSite schema with search action
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: 'SteakHouse',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BlogPosting schema for individual blog posts
 */
export function generateBlogPostingSchema(post: PostMeta) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SteakHouse',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    image: post.ogImage || `${SITE_URL}/og-default.png`,
    keywords: post.tags.join(', '),
    articleSection: post.tags[0] || 'Technology',
    wordCount: undefined, // Can be calculated if needed
    inLanguage: 'en-US',
  };
}

/**
 * BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * FAQPage schema for FAQ sections
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * ItemList schema for blog listing
 */
export function generateBlogListSchema(posts: PostMeta[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.slice(0, 10).map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };
}

/**
 * Render JSON-LD script tag content
 */
export function renderJsonLd(schema: object | object[]): string {
  return JSON.stringify(schema);
}

