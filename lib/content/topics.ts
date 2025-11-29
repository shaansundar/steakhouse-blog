/**
 * Topic Clusters Configuration
 * 
 * Defines topic clusters for GEO content organization.
 * Used for internal linking, navigation, and the GEO knowledge hub.
 */

export const GEO_TOPICS = {
  // Fundamentals - Core GEO concepts and theory
  fundamentals: [
    'what-is-generative-ai-engine-optimization-geo',
    'keywords-to-citations-aeo-ai-search',
    'mastering-ai-overviews-generative-search-entity-seo',
  ],
  
  // Implementation - Technical how-to guides
  implementation: [
    'semantic-html-for-ai-crawlers',
    'structured-data-for-ai-discoverability',
    'structured-data-schema-ai-native-answer-engine',
  ],
  
  // Workflows - Applied content strategies and processes
  workflows: [
    'ai-content-automation-git-backed-blogs-seo',
    'brand-data-to-ai-optimized-articles-b2b-saas-scaling',
    'mastering-topical-authority-ai-content-clusters-entity-seo',
    'single-source-of-truth-brand-data-ai-content-generation',
    'content-as-code-playbook-programmatic-seo',
    'geo-playbook-rebrand-rebuild-topical-authority-ai',
    'api-docs-to-content-moat-ai-workflow',
  ],
  
  // Advanced - Specialized topics and case studies
  advanced: [
    'ai-native-vs-ai-assisted-content-workflow-seo',
    'ai-content-automation-vs-agencies-vs-seo-tools',
    'brand-citation-score-ai-search-measurement',
    'cfo-guide-geo-roi-ai-content-automation',
    'is-your-content-stack-ready-for-ai-search',
  ],
} as const;

export type TopicClusterId = keyof typeof GEO_TOPICS;

export interface TopicCluster {
  id: TopicClusterId;
  name: string;
  description: string;
  slug: readonly string[];
}

export const TOPIC_CLUSTERS: Record<TopicClusterId, TopicCluster> = {
  fundamentals: {
    id: 'fundamentals',
    name: 'GEO Fundamentals',
    description: 'Core concepts and theory of Generative Engine Optimization',
    slug: GEO_TOPICS.fundamentals,
  },
  implementation: {
    id: 'implementation',
    name: 'Implementation Guides',
    description: 'Technical how-to guides for implementing GEO',
    slug: GEO_TOPICS.implementation,
  },
  workflows: {
    id: 'workflows',
    name: 'Content Workflows',
    description: 'Applied content strategies and automation workflows',
    slug: GEO_TOPICS.workflows,
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Specialized topics, case studies, and advanced strategies',
    slug: GEO_TOPICS.advanced,
  },
};

/**
 * Get all topic cluster IDs
 */
export function getAllTopicIds(): TopicClusterId[] {
  return Object.keys(TOPIC_CLUSTERS) as TopicClusterId[];
}

/**
 * Get posts for a specific topic cluster
 */
export function getPostsForTopic(topicId: TopicClusterId, allPosts: Array<{ slug: string }>): Array<{ slug: string }> {
  const cluster = TOPIC_CLUSTERS[topicId];
  return allPosts.filter(post => (cluster.slug as readonly string[]).includes(post.slug));
}

/**
 * Get topic cluster for a post slug
 */
export function getTopicForPost(slug: string): TopicClusterId | null {
  for (const [topicId, cluster] of Object.entries(TOPIC_CLUSTERS)) {
    if (cluster.slug.includes(slug)) {
      return topicId as TopicClusterId;
    }
  }
  return null;
}

