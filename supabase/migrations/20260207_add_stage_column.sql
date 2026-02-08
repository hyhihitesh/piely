-- Migration: Add stage column to roadmaps table
-- This column stores the AI-detected startup stage for accelerator tracking

ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'validation';

-- Add comment for documentation
COMMENT ON COLUMN roadmaps.stage IS 'AI-detected startup stage: validation, build, or growth';
