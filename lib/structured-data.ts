/**
 * Structured Data (JSON-LD) Generators
 * 
 * Creates schema.org compliant JSON-LD for SEO and AI discovery.
 */

import { PostMeta } from './posts';

// Use canonical blog domain - normalize to blog.trysteakhouse.com
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.trysteakhouse.com';
const SITE_NAME = 'SteakHouse Blog';
const SITE_DESCRIPTION = 'Master GEO, AEO, and AI-driven content optimization with SteakHouse. Expert insights on making your content discoverable by AI systems.';

/**
 * Organization schema for SteakHouse
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SteakHouse by NimbusHQ',
    url: 'https://trysteakhouse.com', // Main product URL
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
      name: 'SteakHouse by NimbusHQ',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-default.png`,
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
 * Follows Schema.org best practices: https://schema.org/BlogPosting
 */
export function generateBlogPostingSchema(post: PostMeta, articleBody?: string) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  
  // Normalize author to string
  const authorName = typeof post.author === 'string' ? post.author : post.author.name;
  const authorUrl = typeof post.author === 'object' && post.author.url ? post.author.url : undefined;
  
  const authorSchema: any = {
    '@type': 'Person',
    name: authorName,
  };
  
  if (authorUrl) {
    authorSchema.url = authorUrl;
  }
  
  // Calculate word count if articleBody is provided
  const wordCount = articleBody 
    ? articleBody.split(/\s+/).filter(word => word.length > 0).length 
    : undefined;
  
  // Build schema following Schema.org recommendations
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: authorSchema,
    publisher: {
      '@type': 'Organization',
      name: 'SteakHouse by NimbusHQ',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-default.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    image: post.ogImage ? {
      '@type': 'ImageObject',
      url: post.ogImage.startsWith('http') ? post.ogImage : `${SITE_URL}${post.ogImage}`,
    } : {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-default.png`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.tags[0] || 'Technology',
    inLanguage: 'en-US',
  };
  
  // Add wordCount if available
  if (wordCount) {
    schema.wordCount = wordCount;
  }
  
  // Add articleBody if provided (helps AI understand full content)
  if (articleBody) {
    schema.articleBody = articleBody;
  }
  
  // Add about property for topics (helps with entity recognition)
  if (post.tags.length > 0) {
    schema.about = post.tags.map(tag => ({
      '@type': 'Thing',
      name: tag,
    }));
  }
  
  // Add genre/articleSection for better categorization
  if (post.tags.length > 0) {
    schema.genre = post.tags;
  }
  
  // Ensure dates are in ISO 8601 format (already handled by normalizeDate)
  // Schema.org requires ISO 8601 format
  
  return schema;
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
 * Follows Schema.org best practices: https://schema.org/FAQPage
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => {
      // Clean answer text (remove markdown formatting if present)
      const cleanAnswer = faq.answer
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      return {
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: cleanAnswer,
        },
      };
    }),
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

