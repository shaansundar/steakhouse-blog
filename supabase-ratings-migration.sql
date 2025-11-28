-- ============================================
-- Supabase Migration: Create article_ratings table
-- ============================================
-- 
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- This creates the table for tracking article ratings and reviews.

-- Create the article_ratings table
CREATE TABLE IF NOT EXISTS public.article_ratings (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_ip TEXT, -- Optional: for basic duplicate prevention (hashed)
  user_agent TEXT, -- Optional: for basic duplicate prevention
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, user_ip) -- Prevent duplicate ratings from same IP (optional)
);

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

-- Policy to allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access" ON public.article_ratings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_article_ratings_updated_at
  BEFORE UPDATE ON public.article_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_article_ratings_updated_at();

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

