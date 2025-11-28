/**
 * Supabase Server Client
 * 
 * Provides server-side Supabase client for analytics and data operations.
 * Uses service role key for server-only operations.
 * 
 * IMPORTANT: Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Type for page view record
export interface PageView {
  id: number;
  slug: string;
  views: number;
  crawlers_viewed: number;
  last_viewed_at: string;
}

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase server client
 * Returns null if credentials are not configured
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase credentials not configured. View tracking disabled.');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Increment page view for a given slug
 * Creates the record if it doesn't exist
 */
export async function incrementPageView({
  slug,
  isCrawler = false,
}: {
  slug: string;
  isCrawler?: boolean;
}): Promise<void> {
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    // Supabase not configured, skip tracking
    return;
  }

  try {
    // First, try to get existing record
    const { data: existing, error: fetchError } = await supabase
      .from('page_views')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError) {
      // PGRST116 = no rows returned, which is expected for new slugs
      // PGRST205 = table not found - table needs to be created
      if (fetchError.code === 'PGRST116') {
        // This is fine, we'll create a new record
      } else if (fetchError.code === 'PGRST205') {
        console.warn('page_views table not found. Please run the migration SQL in Supabase.');
        return;
      } else {
        console.error('Error fetching page view:', fetchError);
        return;
      }
    }

    const now = new Date().toISOString();

    if (existing) {
      // Update existing record
      const updateData: Partial<PageView> = {
        views: (existing.views || 0) + 1,
        last_viewed_at: now,
      };

      if (isCrawler) {
        updateData.crawlers_viewed = (existing.crawlers_viewed || 0) + 1;
      }

      const { error: updateError } = await supabase
        .from('page_views')
        .update(updateData)
        .eq('slug', slug);

      if (updateError) {
        console.error('Error updating page view:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('page_views')
        .insert({
          slug,
          views: 1,
          crawlers_viewed: isCrawler ? 1 : 0,
          last_viewed_at: now,
        });

      if (insertError) {
        console.error('Error inserting page view:', insertError);
      }
    }
  } catch (error) {
    console.error('Unexpected error in incrementPageView:', error);
  }
}

/**
 * Get view count for a specific slug
 */
export async function getPageViews(slug: string): Promise<number> {
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('views')
      .eq('slug', slug)
      .single();

    if (error) {
      // PGRST205 = table not found
      if (error.code === 'PGRST205') {
        console.warn('page_views table not found. Please run the migration SQL in Supabase.');
      }
      return 0;
    }

    return data?.views || 0;
  } catch {
    return 0;
  }
}

/**
 * Get crawler view count for a specific slug
 */
export async function getCrawlerViews(slug: string): Promise<number> {
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('crawlers_viewed')
      .eq('slug', slug)
      .single();

    if (error) {
      // PGRST205 = table not found
      if (error.code === 'PGRST205') {
        console.warn('page_views table not found. Please run the migration SQL in Supabase.');
      }
      return 0;
    }

    return data?.crawlers_viewed || 0;
  } catch {
    return 0;
  }
}

/**
 * Get full page view stats (total views and crawler views) for a specific slug
 */
export async function getPageViewStats(slug: string): Promise<{
  views: number;
  crawlers_viewed: number;
  human_views: number;
}> {
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return { views: 0, crawlers_viewed: 0, human_views: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('views, crawlers_viewed')
      .eq('slug', slug)
      .single();

    if (error) {
      // PGRST205 = table not found
      if (error.code === 'PGRST205') {
        console.warn('page_views table not found. Please run the migration SQL in Supabase.');
      }
      return { views: 0, crawlers_viewed: 0, human_views: 0 };
    }

    const views = data?.views || 0;
    const crawlers_viewed = data?.crawlers_viewed || 0;
    const human_views = views - crawlers_viewed;

    return { views, crawlers_viewed, human_views };
  } catch {
    return { views: 0, crawlers_viewed: 0, human_views: 0 };
  }
}

/**
 * Get view counts for multiple slugs at once
 * Returns a map of slug -> view count
 */
export async function getPageViewsBatch(slugs: string[]): Promise<Record<string, number>> {
  const supabase = getSupabaseServerClient();
  
  if (!supabase || slugs.length === 0) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('slug, views')
      .in('slug', slugs);

    if (error) {
      // PGRST205 = table not found
      if (error.code === 'PGRST205') {
        console.warn('page_views table not found. Please run the migration SQL in Supabase.');
      } else {
        console.error('Error fetching batch page views:', error);
      }
      return {};
    }

    const viewsMap: Record<string, number> = {};
    (data || []).forEach((item) => {
      viewsMap[item.slug] = item.views || 0;
    });

    // Ensure all slugs have an entry (default to 0)
    slugs.forEach((slug) => {
      if (!(slug in viewsMap)) {
        viewsMap[slug] = 0;
      }
    });

    return viewsMap;
  } catch {
    return {};
  }
}

/**
 * Get all page views (for admin/analytics)
 */
export async function getAllPageViews(): Promise<PageView[]> {
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .order('views', { ascending: false });

    if (error) {
      // PGRST205 = table not found
      if (error.code === 'PGRST205') {
        console.warn('page_views table not found. Please run the migration SQL in Supabase.');
      } else {
        console.error('Error fetching all page views:', error);
      }
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/*
 * ============================================
 * SUPABASE TABLE SCHEMA
 * ============================================
 * 
 * Run this SQL in your Supabase SQL editor to create the page_views table:
 * 
 * CREATE TABLE IF NOT EXISTS page_views (
 *   id BIGSERIAL PRIMARY KEY,
 *   slug TEXT UNIQUE NOT NULL,
 *   views BIGINT DEFAULT 0,
 *   crawlers_viewed BIGINT DEFAULT 0,
 *   last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Create index for faster slug lookups
 * CREATE INDEX IF NOT EXISTS idx_page_views_slug ON page_views(slug);
 * 
 * -- Optional: Enable Row Level Security (RLS)
 * ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
 * 
 * -- Policy to allow service role full access
 * CREATE POLICY "Service role has full access" ON page_views
 *   FOR ALL
 *   TO service_role
 *   USING (true)
 *   WITH CHECK (true);
 * 
 */

