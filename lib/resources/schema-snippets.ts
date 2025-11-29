/**
 * JSON-LD Schema Snippets
 * 
 * Reusable JSON-LD templates for common structured data patterns.
 * These can be imported and customized for specific use cases.
 */

export const SCHEMA_SNIPPETS = {
  /**
   * Basic BlogPosting schema
   */
  blogPosting: {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: '{{title}}',
    description: '{{description}}',
    author: {
      '@type': 'Person',
      name: '{{authorName}}',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SteakHouse by NimbusHQ',
      logo: {
        '@type': 'ImageObject',
        url: '{{logoUrl}}',
      },
    },
    datePublished: '{{datePublished}}',
    dateModified: '{{dateModified}}',
    url: '{{url}}',
  },

  /**
   * FAQPage schema
   */
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '{{question}}',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '{{answer}}',
        },
      },
    ],
  },

  /**
   * Organization schema
   */
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SteakHouse by NimbusHQ',
    url: 'https://trysteakhouse.com',
    logo: {
      '@type': 'ImageObject',
      url: '{{logoUrl}}',
    },
    sameAs: [
      'https://twitter.com/trysteakhouse',
      'https://github.com/nimbushq',
    ],
  },

  /**
   * WebSite schema with search action
   */
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SteakHouse Blog',
    url: '{{siteUrl}}',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: '{{siteUrl}}/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },

  /**
   * BreadcrumbList schema
   */
  breadcrumbList: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '{{item1Name}}',
        item: '{{item1Url}}',
      },
    ],
  },
} as const;

/**
 * Helper function to fill template variables
 */
export function fillSchemaTemplate(
  template: Record<string, any>,
  variables: Record<string, string>
): Record<string, any> {
  const filled = JSON.parse(JSON.stringify(template));
  
  function replaceVars(obj: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || match;
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceVars);
    }
    if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceVars(value);
      }
      return result;
    }
    return obj;
  }
  
  return replaceVars(filled);
}

