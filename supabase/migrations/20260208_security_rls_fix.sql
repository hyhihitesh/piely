-- Migration: Security Fixes
-- Fix function search paths (mutable search_path vulnerabilities)

-- ============================================
-- FIX FUNCTION SEARCH PATHS
-- ============================================

-- Fix set_random_username function
CREATE OR REPLACE FUNCTION public.set_random_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NULL THEN
    NEW.username := generate_random_username();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix generate_random_username function
CREATE OR REPLACE FUNCTION public.generate_random_username()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Swift', 'Bright', 'Bold', 'Calm', 'Clever', 'Eager', 'Fair', 'Grand', 'Happy', 'Keen'];
  nouns TEXT[] := ARRAY['Falcon', 'Phoenix', 'Tiger', 'Eagle', 'Wolf', 'Hawk', 'Lion', 'Bear', 'Owl', 'Fox'];
  result TEXT;
BEGIN
  result := adjectives[floor(random() * array_length(adjectives, 1) + 1)::int] || 
            nouns[floor(random() * array_length(nouns, 1) + 1)::int] ||
            floor(random() * 1000)::text;
  RETURN result;
END;
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION public.set_random_username() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_random_username() TO authenticated;
