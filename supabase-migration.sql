-- ============================================
-- Supabase Migration: Create page_views table
-- ============================================
-- 
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- This creates the table for tracking blog post views and crawler visits.

-- Create the page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  views BIGINT DEFAULT 0,
  crawlers_viewed BIGINT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_page_views_slug ON public.page_views(slug);

-- Create index for sorting by views
CREATE INDEX IF NOT EXISTS idx_page_views_views ON public.page_views(views DESC);

-- Create index for last_viewed_at (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_page_views_last_viewed ON public.page_views(last_viewed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access" ON public.page_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Policy to allow authenticated users to read (if you want to expose view counts via API)
-- CREATE POLICY "Authenticated users can read" ON public.page_views
--   FOR SELECT
--   TO authenticated
--   USING (true);

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

