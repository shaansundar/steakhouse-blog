/**
 * Case Study Content Model
 * 
 * Defines the structure for GEO case studies with before/after metrics.
 * Used for tracking AI citations and AI referral traffic improvements.
 */

export interface CaseStudyMetrics {
  // AI-specific metrics
  ai_citations_before: number;
  ai_citations_after: number;
  ai_referral_traffic_before: number;
  ai_referral_traffic_after: number;
  
  // Traditional SEO metrics (optional)
  organic_traffic_before?: number;
  organic_traffic_after?: number;
  keyword_rankings_before?: number;
  keyword_rankings_after?: number;
  
  // Time period
  measurement_period_days: number;
  measurement_start_date: string; // ISO date
  measurement_end_date: string; // ISO date
}

export interface CaseStudyMeta {
  slug: string;
  title: string;
  description: string;
  industry: string; // e.g., "B2B SaaS", "E-commerce", "Fintech", "Dev Tools"
  company_name?: string; // Optional - can be anonymized
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  
  // Metrics
  metrics: CaseStudyMetrics;
  
  // Summary for GEO Hub
  summary: string; // 1-2 sentence summary
  
  // Content
  challenge: string; // What problem they faced
  solution: string; // What GEO approach they used
  results: string; // Narrative results description
  
  // Optional structured data
  featured_image?: string;
}

/**
 * Placeholder case study structure
 * TODO: Add real case studies as markdown files in content/case-studies/
 */
export const CASE_STUDY_PLACEHOLDER: CaseStudyMeta = {
  slug: 'example-case-study',
  title: 'Example Case Study: B2B SaaS Company Increases AI Citations by 300%',
  description: 'How a B2B SaaS company implemented GEO and saw dramatic improvements in AI citation rates.',
  industry: 'B2B SaaS',
  publishedAt: new Date().toISOString(),
  author: 'SteakHouse Team',
  tags: ['Case Study', 'B2B SaaS', 'GEO', 'AI Citations'],
  metrics: {
    ai_citations_before: 5,
    ai_citations_after: 20,
    ai_referral_traffic_before: 50,
    ai_referral_traffic_after: 200,
    measurement_period_days: 90,
    measurement_start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    measurement_end_date: new Date().toISOString(),
  },
  summary: 'A B2B SaaS company increased AI citations by 300% and AI referral traffic by 4x through systematic GEO implementation.',
  challenge: 'Low visibility in AI-generated answers despite strong SEO performance.',
  solution: 'Implemented structured data, semantic HTML, and content clusters focused on entity recognition.',
  results: 'Saw 300% increase in AI citations and 4x growth in AI referral traffic within 90 days.',
};

