/**
 * GEO Playbooks Configuration
 * 
 * Defines vertical-specific GEO playbooks for different industries.
 * Each playbook provides industry-specific guidance and best practices.
 */

export interface PlaybookMeta {
  slug: string;
  title: string;
  description: string;
  industry: string; // e.g., "B2B SaaS", "E-commerce", "Fintech", "Dev Tools"
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  
  // Playbook-specific fields
  target_audience: string; // e.g., "Marketing leaders", "Technical founders"
  key_objectives: string[]; // What this playbook helps achieve
  estimated_time_to_implement: string; // e.g., "2-4 weeks"
  
  // Content sections (can be markdown)
  overview: string;
  prerequisites: string[];
  step_by_step: string[]; // Array of step descriptions
  common_pitfalls: string[];
  success_metrics: string[];
  
  // Optional
  featured_image?: string;
  related_resources?: string[]; // Slugs of related posts
}

export const PLAYBOOK_INDUSTRIES = [
  'B2B SaaS',
  'E-commerce',
  'Fintech',
  'Dev Tools',
  'Healthcare',
  'Education',
  'Real Estate',
  'Legal',
] as const;

export type PlaybookIndustry = typeof PLAYBOOK_INDUSTRIES[number];

/**
 * Placeholder playbook structure
 * TODO: Add real playbooks as markdown files in content/playbooks/
 */
export const PLAYBOOK_PLACEHOLDER: PlaybookMeta = {
  slug: 'geo-playbook-b2b-saas',
  title: 'GEO Playbook: B2B SaaS',
  description: 'A comprehensive guide to implementing GEO for B2B SaaS companies.',
  industry: 'B2B SaaS',
  publishedAt: new Date().toISOString(),
  author: 'SteakHouse Team',
  tags: ['Playbook', 'B2B SaaS', 'GEO', 'Implementation'],
  target_audience: 'Marketing leaders and technical founders at B2B SaaS companies',
  key_objectives: [
    'Increase AI citation rates',
    'Improve entity recognition',
    'Build topical authority',
    'Scale content production',
  ],
  estimated_time_to_implement: '2-4 weeks',
  overview: 'This playbook provides a step-by-step guide to implementing GEO for B2B SaaS companies.',
  prerequisites: [
    'Access to website codebase',
    'Content management system',
    'Basic understanding of HTML and structured data',
  ],
  step_by_step: [
    'Audit current content for GEO readiness',
    'Implement structured data (Schema.org)',
    'Optimize semantic HTML',
    'Create content clusters around core entities',
    'Set up tracking for AI citations',
  ],
  common_pitfalls: [
    'Over-optimizing for keywords instead of entities',
    'Neglecting structured data',
    'Inconsistent entity naming',
  ],
  success_metrics: [
    'AI citation rate',
    'AI referral traffic',
    'Entity recognition in knowledge graphs',
  ],
};

