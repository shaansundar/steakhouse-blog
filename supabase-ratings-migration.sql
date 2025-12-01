-- ============================================
-- Supabase Migration: Create article_ratings table
-- ============================================
-- 
-- UPDATED FOR NEW SUPABASE API KEY SYSTEM (November 2025+)
-- See: https://github.com/orgs/supabase/discussions/29260
--
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- This creates the table for tracking article ratings and reviews.
--
-- COMPATIBILITY:
-- - Works with legacy keys (service_role, anon)
-- - Works with new keys (sb_secret_..., sb_publishable_...)

-- Create the article_ratings table
CREATE TABLE IF NOT EXISTS public.article_ratings (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_ip TEXT, -- Optional: for basic duplicate prevention
  user_agent TEXT, -- Optional: for analytics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, user_ip) -- Prevent duplicate ratings from same IP
);

-- Add table comment for documentation
COMMENT ON TABLE public.article_ratings IS 'Stores user ratings for blog articles (1-5 stars)';
COMMENT ON COLUMN public.article_ratings.slug IS 'URL slug of the rated article';
COMMENT ON COLUMN public.article_ratings.rating IS 'Rating value between 1-5';
COMMENT ON COLUMN public.article_ratings.user_ip IS 'IP address for duplicate prevention (hashed in production recommended)';
COMMENT ON COLUMN public.article_ratings.user_agent IS 'Browser user agent for analytics';

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_article_ratings_slug ON public.article_ratings(slug);

-- Create index for rating lookups
CREATE INDEX IF NOT EXISTS idx_article_ratings_rating ON public.article_ratings(rating);

-- Create index for created_at (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_article_ratings_created_at ON public.article_ratings(created_at DESC);

-- Create a composite index for slug + rating (useful for aggregations)
CREATE INDEX IF NOT EXISTS idx_article_ratings_slug_rating ON public.article_ratings(slug, rating);

-- Enable Row Level Security (RLS)
ALTER TABLE public.article_ratings ENABLE ROW LEVEL SECURITY;

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
DROP POLICY IF EXISTS "Service role has full access" ON public.article_ratings;
DROP POLICY IF EXISTS "Secret key has full access" ON public.article_ratings;
DROP POLICY IF EXISTS "Allow public read access" ON public.article_ratings;

-- Policy: Full access for service role (legacy) and secret keys (new)
-- Note: Both service_role (legacy) and secret keys (new) bypass RLS by default,
-- but we include this policy for explicit documentation and edge cases
CREATE POLICY "Service role has full access" ON public.article_ratings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow public read access for rating stats
-- This enables clients to fetch aggregate rating data
CREATE POLICY "Allow public read access" ON public.article_ratings
  FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_article_ratings_updated_at ON public.article_ratings;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_article_ratings_updated_at
  BEFORE UPDATE ON public.article_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_article_ratings_updated_at();

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
  AND table_name = 'article_ratings'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'article_ratings';

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
  AND tablename = 'article_ratings';

-- Verify trigger is in place
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
  AND event_object_table = 'article_ratings';
