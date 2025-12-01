-- ============================================
-- Supabase Migration: Create page_views table
-- ============================================
-- 
-- UPDATED FOR NEW SUPABASE API KEY SYSTEM (November 2025+)
-- See: https://github.com/orgs/supabase/discussions/29260
--
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- This creates the table for tracking blog post views and crawler visits.
--
-- COMPATIBILITY:
-- - Works with legacy keys (service_role, anon)
-- - Works with new keys (sb_secret_..., sb_publishable_...)

-- Create the page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  views BIGINT DEFAULT 0,
  crawlers_viewed BIGINT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment for documentation
COMMENT ON TABLE public.page_views IS 'Tracks page view counts for blog posts, including crawler/bot detection';
COMMENT ON COLUMN public.page_views.slug IS 'Unique URL slug for the blog post';
COMMENT ON COLUMN public.page_views.views IS 'Total number of page views (humans + crawlers)';
COMMENT ON COLUMN public.page_views.crawlers_viewed IS 'Number of views from detected crawlers/bots';
COMMENT ON COLUMN public.page_views.last_viewed_at IS 'Timestamp of the most recent view';

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_page_views_slug ON public.page_views(slug);

-- Create index for sorting by views
CREATE INDEX IF NOT EXISTS idx_page_views_views ON public.page_views(views DESC);

-- Create index for last_viewed_at (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_page_views_last_viewed ON public.page_views(last_viewed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================
-- These policies work with both legacy and new API key systems.
-- 
-- With new API keys (sb_secret_...):
--   - Secret keys bypass RLS by default
--   - Publishable keys respect RLS policies
--
-- With legacy API keys:
--   - service_role bypasses RLS by default  
--   - anon key respects RLS policies

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Service role has full access" ON public.page_views;
DROP POLICY IF EXISTS "Secret key has full access" ON public.page_views;
DROP POLICY IF EXISTS "Allow public read access" ON public.page_views;

-- Policy: Full access for service role (legacy) and secret keys (new)
-- Note: Both service_role (legacy) and secret keys (new) bypass RLS by default,
-- but we include this policy for explicit documentation and edge cases
CREATE POLICY "Service role has full access" ON public.page_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow public/anonymous read access for view counts
-- This enables clients to fetch view counts via publishable/anon keys
CREATE POLICY "Allow public read access" ON public.page_views
  FOR SELECT
  TO anon
  USING (true);

-- Optional: If you want authenticated users to also read
-- CREATE POLICY "Authenticated users can read" ON public.page_views
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify the table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'page_views'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'page_views';

-- Verify policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'page_views';
